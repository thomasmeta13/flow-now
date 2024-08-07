import React, { useState } from 'react';
import axios from 'axios';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ text: string; sender: string; }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await axios.post('http://localhost:3001/api/chat', {
        message: input
      });
      
      setMessages([...newMessages, { text: response.data.message, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, { text: 'Sorry, I encountered an error.', sender: 'bot' }]);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-2/3 h-2/3 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Chat with Alisa</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="h-3/4 overflow-y-auto mb-4 p-4 bg-gray-100 rounded">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow p-2 border rounded-l"
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-r">Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;
