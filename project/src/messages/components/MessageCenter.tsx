// MAIS Political Command Center - Message Center
// Swiss Precision Standards - Secure & Efficient Communication

import React, { useState } from 'react';
import { useApp } from '../../contexts/appContextUtils';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/components/Card';
import { Button } from '../../ui/components/Button';
import { Textarea } from '../../ui/components/Textarea';
import { Send, MessageSquare } from 'lucide-react';

const MessageCenter: React.FC = () => {
  const { messages, sendMessage, user } = useApp();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    const success = await sendMessage({
      sender_id: user.id,
      sender_name: user.full_name,
      sender_role: user.role,
      content: newMessage,
      is_urgent: false, // This could be a UI option
      is_confidential: false, // This could be a UI option
    });

    if (success) {
      setNewMessage('');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2" />
          Centro de Mensajes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-xs`}>
              <p className="font-bold text-sm">{msg.sender_name}</p>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500 text-right">{new Date(msg.created_at).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-grow"
          />
          <Button onClick={handleSendMessage}>
            <Send size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MessageCenter;
