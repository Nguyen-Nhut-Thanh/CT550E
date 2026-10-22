BEGIN;
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS assigned_staff_id INTEGER,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP(6);
ALTER TABLE conversations ALTER COLUMN status SET DEFAULT 'WAITING';
UPDATE conversations SET status = 'WAITING'
WHERE status NOT IN ('WAITING', 'IN_PROGRESS', 'CLOSED');

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_assigned_staff_id_fkey') THEN
    ALTER TABLE conversations ADD CONSTRAINT conversations_assigned_staff_id_fkey
      FOREIGN KEY (assigned_staff_id) REFERENCES users(user_id) ON DELETE SET NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_conversations_status_time ON conversations(status, last_message_at);
CREATE INDEX IF NOT EXISTS idx_conversations_assignee ON conversations(assigned_staff_id);

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS client_message_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS context JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_client_id ON messages(conversation_id, client_message_id);
COMMIT;
