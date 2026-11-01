-- migrate:up
-- Accounts get a name, a role and an on/off switch.
-- Admins set up the place and manage accounts; staff work the counters.
-- A turned-off account (active = false) can't sign in.
alter table users
  add column first_name varchar(50) not null default '',
  add column last_name varchar(50) not null default '',
  add column role text not null default 'staff' check (role in ('admin', 'staff')),
  add column active boolean not null default true;

-- migrate:down
alter table users
  drop column active,
  drop column role,
  drop column last_name,
  drop column first_name;
