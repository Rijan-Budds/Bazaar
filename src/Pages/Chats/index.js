'use client';

import { useState } from 'react';

const users = [
  { id: 1, name: 'Nurse Man' },
  { id: 2, name: 'Falcha Putli' },
  { id: 3, name: 'Banana king' },
  { id: 4, name: 'Kushal Das' },
];

const chatsData = {
  1: [
    { id: 1, sender: 'them', text: 'Are you selling?' },
    { id: 2, sender: 'me', text: 'Yes, it is available.' },
  ],
  2: [
    { id: 1, sender: 'them', text: 'Can you reduce the price?' },
    { id: 2, sender: 'me', text: 'Maybe, what is your offer?' },
  ],
  3: [],
  4: [],
};

export default function Chats() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setMessages(chatsData[userId] || []);
  };

  const handleSend = () => {
    if (newMessage.trim() !== '' && selectedUserId) {
      const updatedMessages = [...messages, { id: Date.now(), sender: 'me', text: newMessage }];
      setMessages(updatedMessages);
      chatsData[selectedUserId] = updatedMessages; // updating dummy chat data
      setNewMessage('');
    }
  };

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      {/* Sidebar */}
      <div className="border-end p-3" style={{ width: '300px', backgroundColor: '#f8f9fa' }}>
        <h5>Chats</h5>
        {users.map((user) => (
          <div 
            key={user.id} 
            className={`p-2 mb-2 rounded ${selectedUserId === user.id ? 'bg-primary text-white' : 'bg-light'}`}
            onClick={() => handleSelectUser(user.id)}
            style={{ cursor: 'pointer' }}
          >
            {user.name}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {selectedUserId ? (
          <>
            {/* Header */}
            <div className="border-bottom p-3">
              <h5>{users.find((u) => u.id === selectedUserId)?.name}</h5>
            </div>

            {/* Messages */}
            <div 
              className="flex-grow-1 p-3" 
              style={{ overflowY: 'auto', backgroundColor: '#e9ecef' }}
            >
              {messages.length === 0 ? (
                <p className="text-center text-muted">No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`d-flex mb-2 ${msg.sender === 'me' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <span 
                      className={`p-2 rounded ${msg.sender === 'me' ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                      style={{ maxWidth: '70%' }}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-top p-3 d-flex">
              <input 
                type="text" 
                className="form-control me-2"
                placeholder="Type a message..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              />
              <button className="btn btn-primary" onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="d-flex align-items-center justify-content-center flex-grow-1">
            <h5>Select a user to start chatting</h5>
          </div>
        )}
      </div>
    </div>
  );
}
