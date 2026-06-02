create extension if not exists "pg_trgm";

create table if not exists topics (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  description     text not null default '',
  tags            text[] not null default '{}',
  estimated_mins  int not null default 20,
  prerequisites   text[] not null default '{}',
  request_count   int not null default 1,
  lessons         jsonb not null default '[]',
  audio_ready     boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists topics_request_count_idx on topics (request_count desc);
create index if not exists topics_slug_trgm_idx on topics using gin (slug gin_trgm_ops);
create index if not exists topics_title_trgm_idx on topics using gin (title gin_trgm_ops);

create table if not exists user_topic_progress (
  user_id         text not null,
  topic_slug      text not null references topics(slug) on delete cascade,
  lesson_index    int not null default 0,
  slide_index     int not null default 0,
  completed       boolean not null default false,
  updated_at      timestamptz not null default now(),
  primary key (user_id, topic_slug)
);

create or replace function increment_topic_request_count(p_slug text)
returns void language plpgsql as $$
begin
  update topics set request_count = request_count + 1 where slug = p_slug;
end;
$$;
