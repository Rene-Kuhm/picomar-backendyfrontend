/*
  # Update chat_messages table to handle AI messages

  1. Changes
    - Make user_id nullable to allow AI messages
    - Add is_ai flag to identify AI messages
    - Update policies to handle AI messages

  2. Security
    - Update policies to allow AI messages
*/

-- Modify chat_messages table to handle AI messages
DO $$ 
BEGIN
  -- Make user_id nullable
  ALTER TABLE chat_messages 
    ALTER COLUMN user_id DROP NOT NULL;

  -- Add is_ai column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'is_ai'
  ) THEN
    ALTER TABLE chat_messages 
      ADD COLUMN is_ai boolean DEFAULT false;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create messages in their conversations" ON chat_messages;
  DROP POLICY IF EXISTS "Users can view messages in their conversations" ON chat_messages;
END $$;

-- Create new policies
DO $$ 
BEGIN
  -- Policy for creating messages
  CREATE POLICY "Users can create messages in their conversations"
    ON chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM chat_conversations
        WHERE chat_conversations.id = chat_messages.conversation_id
        AND (
          chat_conversations.user_id = auth.uid() OR
          (auth.jwt() ->> 'role')::text = 'admin' OR
          is_ai = true
        )
      )
    );

  -- Policy for viewing messages
  CREATE POLICY "Users can view messages in their conversations"
    ON chat_messages
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM chat_conversations
        WHERE chat_conversations.id = chat_messages.conversation_id
        AND (
          chat_conversations.user_id = auth.uid() OR
          (auth.jwt() ->> 'role')::text = 'admin'
        )
      )
    );
END $$;