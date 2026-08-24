-- Persists the AI chat widget's conversations so the admin panel can host a
-- human-takeover inbox: admin reads customer messages with an automatic
-- English translation, and can reply in their own words — the reply gets
-- translated + polished into the customer's language before it's delivered
-- back to the widget. AI auto-replies keep going until an admin sends a
-- manual reply, at which point ai_paused flips true and the widget stops
-- getting AI answers for that conversation (mirrors human-handoff UX).

create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  customer_language text,
  ai_paused boolean not null default false,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references chat_conversations (id) on delete cascade,
  sender text not null check (sender in ('customer', 'ai', 'admin')),
  body text not null,
  translated_body text,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_conversation_id_idx on chat_messages (conversation_id);
create index if not exists chat_conversations_last_message_at_idx on chat_conversations (last_message_at desc);

alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;

-- No public policies: the widget and admin panel both go through server
-- routes/actions using the service-role key, same pattern as every other
-- table in this project.
