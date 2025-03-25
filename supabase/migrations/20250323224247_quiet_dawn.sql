/*
  # Chat System Implementation

  1. Changes
    - Add IF NOT EXISTS clauses to table creation
    - Add IF NOT EXISTS clauses to policies
    - Add OR REPLACE to function creation
    - Add IF NOT EXISTS to trigger creation

  2. Tables
    - chat_conversations
    - chat_messages

  3. Security
    - RLS policies for conversations and messages
    - Policies for users and admins
*/

-- Create chat_conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('active', 'waiting', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY';
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create policies for chat_conversations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_conversations' 
    AND policyname = 'Users can view their own conversations'
  ) THEN
    CREATE POLICY "Users can view their own conversations"
      ON chat_conversations
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = user_id OR 
        (auth.jwt() ->> 'role')::text = 'admin'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_conversations' 
    AND policyname = 'Users can create their own conversations'
  ) THEN
    CREATE POLICY "Users can create their own conversations"
      ON chat_conversations
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_conversations' 
    AND policyname = 'Users and admins can update conversations'
  ) THEN
    CREATE POLICY "Users and admins can update conversations"
      ON chat_conversations
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = user_id OR 
        (auth.jwt() ->> 'role')::text = 'admin'
      )
      WITH CHECK (
        auth.uid() = user_id OR 
        (auth.jwt() ->> 'role')::text = 'admin'
      );
  END IF;
END $$;

-- Create policies for chat_messages
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Users can view messages in their conversations'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Users can create messages in their conversations'
  ) THEN
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
            (auth.jwt() ->> 'role')::text = 'admin'
          )
        )
      );
  END IF;
END $$;

-- Create or replace function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_conversation_timestamp'
  ) THEN
    CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();
  END IF;
END $$;