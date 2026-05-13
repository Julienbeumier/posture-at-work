create table if not exists email_sequences (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  firstname text,
  scores jsonb,
  sequence_step integer default 1,
  last_sent_at timestamptz default now(),
  next_send_at timestamptz,
  unsubscribed boolean default false,
  created_at timestamptz default now()
);

create index if not exists email_sequences_email_idx on email_sequences(email);
create index if not exists email_sequences_next_send_idx on email_sequences(next_send_at);
