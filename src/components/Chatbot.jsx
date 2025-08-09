import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const Chatbot = forwardRef(function Chatbot({ page }, ref) {
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: "Hi! I'm here for you. What's on your mind?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  async function getBotReply(input) {
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: "You're a caring study and mental health companion." },
            { role: 'user', content: input }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
          }
        }
      );
      return res.data.choices[0].message.content.trim();
    } catch (err) {
      console.error('ChatGPT error', err);
      return "Sorry, I'm having trouble responding right now.";
    }
  }

  async function handleChatSend(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages(ms => [...ms, { sender: 'user', text: chatInput }]);
    setChatInput('');
    setTyping(true);

    const reply = await getBotReply(chatInput);

    setTyping(false);
    setChatMessages(ms => [...ms, { sender: 'bot', text: reply }]);
  }

  useImperativeHandle(ref, () => ({
    addMessage(msg) {
      setChatMessages(ms => [...ms, msg]);
    }
  }));

  if (page !== 'chat') return null;

  return (
    <>
      <h2>Chat</h2>
      <div
        ref={chatRef}
        style={{ maxHeight: 300, overflowY: 'auto', background: '#eee', padding: 10, borderRadius: 8 }}
      >
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              marginBottom: 6
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: msg.sender === 'user' ? '#4caf50' : '#e0e0e0',
                color: msg.sender === 'user' ? '#fff' : '#000',
                padding: '8px 12px',
                borderRadius: 16
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {typing && <i>Bot is typing...</i>}
      </div>
      <form onSubmit={handleChatSend} style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="Talk to me..."
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: 6 }}
        >
          Send
        </button>
      </form>
    </>
  );
});

export default Chatbot;
