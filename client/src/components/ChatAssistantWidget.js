import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function ChatAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hi Sahil! I can help you draft outreach messages, analyze lead responses, or schedule follow-ups. What would you like to do?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({ message: userText });
      if (res.data && res.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'assistant',
            text: res.data.reply,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: `I can help you review your pipeline and follow-ups. I recommend reaching out to any leads scheduled for follow-up today!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="floating-chat-btn"
        title="LeadFlow AI Assistant"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Interactive Chat Popup */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '340px',
            height: '420px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 99,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--primary-blue)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} />
              <span style={{ fontWeight: 600, fontSize: '13.5px' }}>LeadFlow Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ color: '#ffffff', opacity: 0.8 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              backgroundColor: 'var(--bg-subtle)'
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: m.sender === 'user' ? 'var(--primary-blue)' : 'var(--bg-card)',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  boxShadow: 'var(--shadow-sm)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)'
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '8px',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <input
              type="text"
              placeholder="Ask anything about your leads..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--primary-blue)',
                color: '#ffffff',
                padding: '7px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
