-- À exécuter une fois dans Supabase > SQL Editor

create table if not exists cars (
  id serial primary key,
  name text not null,
  category text not null,
  price integer not null,
  image text not null,
  images text not null default '[]',
  description text not null default '',
  transmission text not null,
  fuel text not null,
  seats integer not null default 5,
  available integer not null default 1,
  created_at text not null default current_timestamp
);

create table if not exists reservations (
  id serial primary key,
  reference text not null,
  car_id integer,
  car_name text not null,
  name text not null,
  phone text not null,
  email text not null,
  city text not null,
  start_date text not null,
  end_date text not null,
  message text not null default '',
  status text not null default 'En attente',
  admin_reply text not null default '',
  created_at text not null default current_timestamp
);

create table if not exists admin_settings (
  key text primary key,
  value text not null,
  updated_at text not null default current_timestamp
);

-- Stockage des photos : créez un bucket "car-photos" (Storage > New bucket),
-- cochez "Public bucket", puis exécutez :
insert into storage.buckets (id, name, public)
values ('car-photos', 'car-photos', true)
on conflict (id) do update set public = true;
