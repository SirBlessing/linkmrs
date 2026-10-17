import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const BASE = import.meta.env.VITE_API_URL || 'https://linkmrs.onrender.com';

const QUICK_PROMPTS = [
  'How is my shop performing overall?',
  'Which product is making me the most money?',
  'Why did my sales drop recently?',
  'What should I focus on to grow my revenue?',
  'Which customers order the most?',
  'Should I remove any products from my shop?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`ai-message ${isUser ? 'ai-message--user' : 'ai-message--assistant'}`}>
      {!isUser && (
        <div className="ai-message__avatar">
          <span className="material-symbols-outlined">smart_toy</span>
        </div>
      )}
      <div className="ai-message__bubble">
        {msg.content
          ? msg.content.split('\n').map((line, i) => <p key={i} style={{ margin: '0 0 0.25rem' }}>{line}</p>)
          : <span className="ai-typing-placeholder">▍</span>
        }
      </div>
    </div>
  );
}

export default function AiPage() {
  const { shop } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setError('');

    const userMsg   = { role: 'user', content: msg };
    const prevMsgs  = [...messages, userMsg];
    setMessages([...prevMsgs, { role: 'assistant', content: '' }]);
    setLoading(true);

    try {
      const response = await fetch(`${BASE}/api/ai/coach`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vendly_token')}`,
        },
        body: JSON.stringify({ message: msg, history: messages }),
      });

      if (!response.ok) throw new Error('AI request failed');

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text  = decoder.decode(value);
        const lines = text.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') break;
          try {
            const { chunk } = JSON.parse(data);
            if (chunk) {
              setMessages((p) => {
                const updated = [...p];
                updated[updated.length - 1] = {
                  role:    'assistant',
                  content: updated[updated.length - 1].content + chunk,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setError('AI is unavailable right now. Try again.');
      setMessages((p) => p.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="page ai-page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">
            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--c-secondary)' }}>
              smart_toy
            </span>
            AI Business Coach
          </h1>
          <p className="page__subtitle">
            Ask anything about your shop — products, sales, customers, strategy. Understands English and Pidgin.
          </p>
        </div>
        {messages.length > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setMessages([]); setError(''); }}>
            <span className="material-symbols-outlined">refresh</span>
            New chat
          </button>
        )}
      </header>

      <div className="ai-context-cards">
        <div className="ai-context-card">
          <span className="material-symbols-outlined">inventory_2</span>
          <span>Products &amp; prices</span>
        </div>
        <div className="ai-context-card">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span>Orders &amp; statuses</span>
        </div>
        <div className="ai-context-card">
          <span className="material-symbols-outlined">bar_chart</span>
          <span>Sales &amp; revenue</span>
        </div>
        <div className="ai-context-card">
          <span className="material-symbols-outlined">people</span>
          <span>Customer history</span>
        </div>
      </div>

      <div className="ai-chat">
        <div className="ai-chat__thread">
          {messages.length === 0 ? (
            <div className="ai-chat__empty">
              <span className="material-symbols-outlined ai-chat__empty-icon">smart_toy</span>
              <h2 className="heading-md">Hey {shop?.shopName?.split(' ')[0] || 'there'} 👋</h2>
              <p>I have access to all your shop data. Ask me anything about your business.</p>
              <div className="ai-quick-prompts">
                {QUICK_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" className="ai-quick-prompt" onClick={() => sendMessage(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <Message key={i} msg={msg} />)
          )}
          {error && (
            <div className="banner banner--warning" style={{ margin: '0' }}>
              <span className="material-symbols-outlined">error</span>{error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="ai-chat__input-row">
          <textarea
            ref={inputRef}
            className="ai-chat__input"
            placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button
            type="button"
            className="ai-chat__send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            {loading
              ? <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff', borderWidth: '2px' }} />
              : <span className="material-symbols-outlined">send</span>
            }
          </button>
        </div>
      </div>
    </div>
  );
}