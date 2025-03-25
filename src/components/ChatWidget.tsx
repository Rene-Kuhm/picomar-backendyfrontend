import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Loader, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getAIResponse } from '../lib/ai';

interface Message {
  id: string;
  content: string;
  user_id: string | null;
  created_at: string;
  is_read: boolean;
  is_ai?: boolean;
}

interface Conversation {
  id: string;
  status: 'active' | 'waiting' | 'closed';
  created_at: string;
  updated_at: string;
}

export function ChatWidget() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchOrCreateConversation();
    }
  }, [user]);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      const channel = setupRealtimeSubscription();
      return () => {
        channel.unsubscribe();
      };
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const fetchOrCreateConversation = async () => {
    try {
      const { data: existingConversations } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user?.id)
        .in('status', ['active', 'waiting'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingConversations && existingConversations.length > 0) {
        setConversation(existingConversations[0]);
      } else {
        const { data: newConversation, error } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user?.id,
            status: 'waiting'
          })
          .select()
          .single();

        if (error) throw error;
        setConversation(newConversation);

        // Send welcome message for new conversations
        const { data: welcomeMessage, error: welcomeError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: newConversation.id,
            content: "¡Hola! Soy el asistente virtual de MarDelicia. Puedo ayudarte con:\n\n" +
              "- Información de productos y precios\n" +
              "- Consultar stock disponible\n" +
              "- Detalles de entregas\n" +
              "- Información de contacto\n\n" +
              "¿En qué puedo ayudarte hoy?",
            is_ai: true,
            user_id: null
          })
          .select()
          .single();

        if (welcomeError) throw welcomeError;
        if (welcomeMessage) {
          setMessages([welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Error fetching/creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!conversation) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      const unread = data?.filter(msg => !msg.is_read && msg.user_id !== user?.id).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    return supabase.channel(`chat:${conversation?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversation?.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only add the message if it's not from the current user
          if (newMessage.user_id !== user?.id) {
            setMessages(prev => [...prev, newMessage]);
            if (newMessage.user_id !== user?.id) {
              setUnreadCount(prev => prev + 1);
            }
            scrollToBottom();
          }
        }
      )
      .subscribe();
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation || sending) return;

    const messageContent = message.trim();
    setMessage('');
    setSending(true);

    try {
      // Send user message
      const { data: userMessage, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          user_id: user?.id,
          content: messageContent,
          is_ai: false
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Update messages state immediately with user message
      if (userMessage) {
        setMessages(prev => [...prev, userMessage]);
        scrollToBottom();
      }

      // If conversation is in waiting status, get AI response
      if (conversation.status === 'waiting') {
        setProcessingAI(true);
        const aiResponse = await getAIResponse(messageContent);
        
        const { data: aiMessage, error: aiMessageError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversation.id,
            content: aiResponse,
            is_ai: true,
            user_id: null
          })
          .select()
          .single();

        if (aiMessageError) throw aiMessageError;

        // Update messages state immediately with AI response
        if (aiMessage) {
          setMessages(prev => [...prev, aiMessage]);
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
      setProcessingAI(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const markMessagesAsRead = async () => {
    if (!conversation || unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .eq('is_read', false)
        .neq('user_id', user?.id);

      if (error) throw error;
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-6 w-6 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl flex flex-col h-[600px]">
      <div className="bg-blue-900 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">Chat de Soporte</h3>
          {conversation?.status === 'waiting' && (
            <span className="flex items-center gap-1 text-sm bg-green-500 px-2 py-0.5 rounded-full">
              <Bot className="h-4 w-4" />
              AI Activa
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto" ref={chatContainerRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.user_id === user?.id
                    ? 'bg-blue-900 text-white'
                    : msg.is_ai
                    ? 'bg-green-100 text-green-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.is_ai && (
                  <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                    <Bot className="h-4 w-4" />
                    <span>Asistente AI</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {processingAI && (
            <div className="flex justify-start">
              <div className="bg-green-100 text-green-900 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm">Escribiendo...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base px-4 py-2"
            disabled={processingAI || sending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending || processingAI}
            className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}