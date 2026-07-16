-- Higher Heels Sanctuary — database schema
-- Run this once in the Neon SQL Editor.

-- People who book or buy
create table if not exists customers (
  id          bigint generated always as identity primary key,
  email       text not null unique,
  name        text,
  phone       text,
  created_at  timestamptz not null default now()
);

-- Prepaid packs (bonos) and monthly memberships, redeemable by a single code
create table if not exists plan_codes (
  code                   text primary key,                  -- e.g. HHS-7K2P9
  customer_id            bigint references customers(id),
  kind                   text not null,                     -- 'bono' | 'membership'
  plan_name              text not null,                     -- Esencia/Ritual/Elite/Plata/Oro/Platino
  total_entries          int  not null,
  remaining_entries      int  not null,
  status                 text not null default 'active',    -- 'active' | 'expired' | 'cancelled'
  expires_at             timestamptz,                       -- bonos only
  stripe_subscription_id text,                              -- memberships only
  created_at             timestamptz not null default now()
);

-- Referral / affiliate codes (also used for the videomaker's code)
create table if not exists affiliates (
  code             text primary key,                        -- e.g. LUCIA10
  owner_name       text,
  owner_email      text,
  kind             text not null default 'affiliate',       -- 'affiliate' | 'videomaker'
  reward_threshold int,                                     -- bookings needed to unlock reward
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

-- Bookings: single paid session, or one redeemed from a plan_code
create table if not exists bookings (
  id                    bigint generated always as identity primary key,
  customer_id           bigint references customers(id),
  room_id               text not null,                      -- 'dark' | 'clean' | 'moon'
  slot_start            timestamptz not null,
  slot_end              timestamptz not null,
  source                text not null,                      -- 'single' | 'code'
  plan_code             text references plan_codes(code),   -- if redeemed from a pack/membership
  affiliate_code        text references affiliates(code),   -- if booked with an affiliate code
  amount_paid           numeric(10,2),
  stripe_payment_intent text,
  door_pin              text,                               -- filled later by the Nuki job
  status                text not null default 'confirmed',  -- 'confirmed' | 'cancelled'
  created_at            timestamptz not null default now(),
  unique (room_id, slot_start)                              -- prevents double-booking
);

-- Reserved-area logins with roles
create table if not exists app_users (
  id             bigint generated always as identity primary key,
  email          text not null unique,
  password_hash  text not null,
  role           text not null,                             -- 'affiliate' | 'subscriber' | 'executive'
  affiliate_code text references affiliates(code),          -- for the affiliate role
  customer_id    bigint references customers(id),           -- for the subscriber role
  created_at     timestamptz not null default now()
);

-- Nuki keypad auth id, so the code can be revoked after the session.
-- (Idempotent: safe to re-run.)
alter table bookings add column if not exists nuki_auth_id text;

-- Indexes for the common lookups
create index if not exists idx_bookings_customer  on bookings(customer_id);
create index if not exists idx_bookings_affiliate on bookings(affiliate_code);
create index if not exists idx_plan_codes_customer on plan_codes(customer_id);
