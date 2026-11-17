create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  created_at timestamptz not null default now(),
  nama text not null,
  whatsapp text not null,
  metode text not null check (metode in ('Pickup', 'Delivery')),
  alamat text,
  catatan text,
  total integer not null check (total >= 0),
  total_pcs integer not null check (total_pcs > 0),
  items jsonb not null default '[]'::jsonb,
  proof_data text,
  status text not null default 'baru' check (status in ('baru', 'dibayar', 'selesai'))
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_nama_idx on public.orders (lower(nama));

alter table public.orders enable row level security;

create table if not exists public.app_config (
  key text primary key,
  value text not null
);

alter table public.app_config enable row level security;

insert into public.app_config (key, value)
values ('admin_key', '831d639335095c5d8a51f126e54860f388001190')
on conflict (key) do update set value = excluded.value;

create or replace function public.admin_key_ok(p_key text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_config
    where key = 'admin_key' and value = p_key
  );
$$;

revoke all on function public.admin_key_ok(text) from public;

create table if not exists public.rate_limits (
  bucket text primary key,
  window_start timestamptz not null,
  hits integer not null default 0
);

create index if not exists rate_limits_window_idx on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;

create or replace function public.check_rate_limit(
  p_bucket text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_hits integer;
begin
  if coalesce(p_bucket, '') = '' or p_max is null or p_max < 1 or p_window_seconds is null or p_window_seconds < 1 then
    return true;
  end if;

  v_window := to_timestamp(
    (floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds)::double precision
  );

  insert into public.rate_limits (bucket, window_start, hits)
  values (p_bucket, v_window, 1)
  on conflict (bucket) do update
    set hits = case
                 when public.rate_limits.window_start = excluded.window_start then public.rate_limits.hits + 1
                 else 1
               end,
        window_start = excluded.window_start
  returning hits into v_hits;

  delete from public.rate_limits
  where window_start < v_window - make_interval(secs => p_window_seconds * 2);

  return v_hits <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public;

create or replace function public.submit_order(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_ip text;
  v_whatsapp text;
begin
  if coalesce(p ->> 'nama', '') = '' or coalesce(p ->> 'whatsapp', '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Data pesanan belum lengkap.');
  end if;

  if coalesce(p ->> 'order_id', '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Nomor pesanan tidak valid.');
  end if;

  if coalesce(p ->> 'proof_data', '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Bukti pembayaran wajib diupload.');
  end if;

  v_ip := coalesce(nullif(p ->> 'ip', ''), 'unknown');
  v_whatsapp := p ->> 'whatsapp';

  if not public.check_rate_limit('order:ip:' || v_ip, 10, 600) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  if not public.check_rate_limit('order:wa:' || v_whatsapp, 5, 1800) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  insert into public.orders (
    order_id, nama, whatsapp, metode, alamat, catatan, total, total_pcs, items, proof_data
  )
  values (
    p ->> 'order_id',
    p ->> 'nama',
    p ->> 'whatsapp',
    p ->> 'metode',
    nullif(p ->> 'alamat', ''),
    nullif(p ->> 'catatan', ''),
    coalesce((p ->> 'total')::int, 0),
    coalesce((p ->> 'total_pcs')::int, 1),
    coalesce(p -> 'items', '[]'::jsonb),
    p ->> 'proof_data'
  )
  returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id);
exception
  when others then
    return jsonb_build_object('ok', false, 'error', sqlerrm);
end;
$$;

create or replace function public.admin_orders(
  p_key text,
  p_search text default '',
  p_metode text default '',
  p_status text default '',
  p_sort text default 'newest',
  p_limit int default 25,
  p_offset int default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb;
  v_count bigint;
begin
  if not public.admin_key_ok(p_key) then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  select count(*)
  into v_count
  from public.orders o
  where (coalesce(p_search, '') = ''
      or o.nama ilike '%' || p_search || '%'
      or o.order_id ilike '%' || p_search || '%'
      or o.whatsapp ilike '%' || p_search || '%')
    and (coalesce(p_metode, '') = '' or o.metode = p_metode)
    and (coalesce(p_status, '') = '' or o.status = p_status);

  select coalesce(jsonb_agg(to_jsonb(f) order by f.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select o.*
    from public.orders o
    where (coalesce(p_search, '') = ''
        or o.nama ilike '%' || p_search || '%'
        or o.order_id ilike '%' || p_search || '%'
        or o.whatsapp ilike '%' || p_search || '%')
      and (coalesce(p_metode, '') = '' or o.metode = p_metode)
      and (coalesce(p_status, '') = '' or o.status = p_status)
    order by
      case when coalesce(p_sort, 'newest') = 'oldest' then o.created_at end asc,
      case when coalesce(p_sort, 'newest') <> 'oldest' then o.created_at end desc
    limit greatest(1, least(coalesce(p_limit, 25), 5000))
    offset greatest(0, coalesce(p_offset, 0))
  ) f;

  return jsonb_build_object('ok', true, 'count', v_count, 'rows', v_rows);
end;
$$;

create or replace function public.admin_stats(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
begin
  if not public.admin_key_ok(p_key) then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  select jsonb_build_object(
    'ok', true,
    'orders', count(*),
    'pcs', coalesce(sum(total_pcs), 0),
    'revenue', coalesce(sum(total), 0),
    'pending', coalesce(sum(case when status = 'baru' then 1 else 0 end), 0),
    'without_proof', coalesce(sum(case when proof_data is null then 1 else 0 end), 0)
  )
  into v
  from public.orders;

  return v;
end;
$$;

create or replace function public.admin_set_status(p_key text, p_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_key_ok(p_key) then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  if p_status not in ('baru', 'dibayar', 'selesai') then
    return jsonb_build_object('ok', false, 'error', 'Status tidak valid.');
  end if;

  update public.orders
  set status = p_status
  where id = p_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Pesanan tidak ditemukan.');
  end if;

  return jsonb_build_object('ok', true, 'status', p_status);
end;
$$;

create or replace function public.admin_delete_order(p_key text, p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id text;
begin
  if not public.admin_key_ok(p_key) then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  delete from public.orders
  where id = p_id
  returning order_id into v_order_id;

  if v_order_id is null then
    return jsonb_build_object('ok', false, 'error', 'Pesanan tidak ditemukan.');
  end if;

  return jsonb_build_object('ok', true, 'order_id', v_order_id);
end;
$$;

grant execute on function public.submit_order(jsonb) to anon, authenticated;
grant execute on function public.admin_orders(text, text, text, text, text, int, int) to anon, authenticated;
grant execute on function public.admin_stats(text) to anon, authenticated;
grant execute on function public.admin_set_status(text, uuid, text) to anon, authenticated;
grant execute on function public.admin_delete_order(text, uuid) to anon, authenticated;
