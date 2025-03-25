import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Loader, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  user_id: string;
  status: 'active' | 'waiting' | 'closed';
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export function AdminChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessageNotification, setNewMessageNotification] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    
    fetchConversations();
    const channel = supabase.channel('admin-chat')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.user_id !== user?.id) {
            if (audioRef.current) {
              try {
                await audioRef.current.play();
              } catch (error) {
                console.error('Error playing notification sound:', error);
              }
            }
            setNewMessageNotification(true);
            setTimeout(() => setNewMessageNotification(false), 5000);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          messages:chat_messages(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversations = data.map(conv => ({
        ...conv,
        messages: conv.messages.sort((a: Message, b: Message) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }));

      setConversations(conversations);

      // Update selected conversation if it exists
      if (selectedConversation) {
        const updated = conversations.find(c => c.id === selectedConversation.id);
        if (updated) setSelectedConversation(updated);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    try {
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: selectedConversation.id,
          user_id: user?.id,
          content: message.trim()
        });

      if (messageError) throw messageError;

      // Update conversation status if it was waiting
      if (selectedConversation.status === 'waiting') {
        const { error: statusError } = await supabase
          .from('chat_conversations')
          .update({ status: 'active' })
          .eq('id', selectedConversation.id);

        if (statusError) throw statusError;
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleCloseConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);

      if (error) throw error;

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {newMessageNotification && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2 shadow-lg z-50">
          <Bell className="h-5 w-5" />
          <span>¡Nuevo mensaje recibido!</span>
        </div>
      )}

      {/* Conversations List */}
      <div className="w-80 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {conversations.map(conversation => {
            const unreadCount = conversation.messages?.filter(
              msg => !msg.is_read && msg.user_id !== user?.id
            ).length || 0;

            return (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  markMessagesAsRead(conversation.id);
                }}
                className={`w-full p-4 text-left border-b hover:bg-gray-100 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">Usuario {conversation.user_id.slice(0, 8)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    conversation.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : conversation.status === 'waiting'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {conversation.status === 'active' ? 'Activo' :
                     conversation.status === 'waiting' ? 'Esperando' : 'Cerrado'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.messages?.[conversation.messages.length - 1]?.content || 'Sin mensajes'}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {new Date(conversation.updated_at).toLocaleString()}
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <div>
                <h3 className="font-semibold">
                  Chat con Usuario {selectedConversation.user_id.slice(0, 8)}
                </h3>
                <p className="text-sm text-gray-600">
                  Iniciado el {new Date(selectedConversation.created_at).toLocaleString()}
                </p>
              </div>
              {selectedConversation.status !== 'closed' && (
                <button
                  onClick={() => handleCloseConversation(selectedConversation.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {selectedConversation.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.user_id === user?.id
                          ? 'bg-blue-900 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {selectedConversation.status !== 'closed' && (
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p>Selecciona una conversación para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}