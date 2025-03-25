/*
  # Chat System Implementation

  1. New Tables
    - `chat_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `status` (text) - active, waiting, closed
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references chat_conversations)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for chat management
*/

-- Create chat_conversations table
CREATE TABLE chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('active', 'waiting', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
  ON chat_conversations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Users can create their own conversations"
  ON chat_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

-- Create policies for chat_messages
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

-- Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp
CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();