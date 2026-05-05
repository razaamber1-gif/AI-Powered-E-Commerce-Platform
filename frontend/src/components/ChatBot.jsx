import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatbotSearch } from '../services/chatbotService';
import { firstImage, formatPrice, truncate, PLACEHOLDER_IMG } from '../utils/helpers';

/**
 * ChatBot — the AI shopping assistant floating widget.
 *
 * Behaviour:
 *  - Closed: shows a circular floating button at bottom-right
 *  - Open: shows a chat panel with messages and an input
 *  - On send: posts to /api/chatbot/search, displays bot reply + product cards
 *
 * The bot's "memory" is local to this component (useState). Each message has
 * { role: 'user'|'bot', text, products?, filters? }.
 */
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm your AI Shopping Agent 🛍️\nTell me what you're looking for in plain English. Try:\n• \"Show me Jockey black t-shirts under 1200\"\n• \"DKNY trolley bag under 15000\"\n• \"Red running shoes for men\"",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever a message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-focus the input when the chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setMessages((m) => [...m, { role: 'user', text: prompt }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await chatbotSearch(prompt);
      setMessages((m) => [
        ...m,
        {
          role: 'bot',
          text: data.reply,
          products: data.products,
          filters: data.filters,
        },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Sorry, the AI service is unavailable. Make sure the Python service and Ollama are running.';
      setMessages((m) => [...m, { role: 'bot', text: `⚠️ ${msg}`, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI shopping assistant"
          className="fixed bottom-6 right-6 z-50 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 transition transform hover:scale-105"
        >
          <span className="text-2xl">🤖</span>
          <span className="font-bold text-sm hidden sm:inline">Search with AI Agent</span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[420px] h-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold">Search with AI Agent</h3>
                <p className="text-xs text-primary-100">Powered by Llama 3.2</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-white hover:text-primary-100 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                  <span className="dot-1">●</span>
                  <span className="dot-2 ml-1">●</span>
                  <span className="dot-3 ml-1">●</span>
                </div>
                <span className="text-xs text-gray-400">AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                disabled={loading}
                placeholder='Try: "DKNY trolley bag under 15000"'
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-full p-2 flex items-center justify-center"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              First search may take 10–30 seconds (CPU LLM warm-up)
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ───────── ChatMessage subcomponent ───────── */

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm whitespace-pre-line text-sm ${
          isUser
            ? 'bg-primary-500 text-white rounded-br-sm'
            : message.isError
            ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-sm'
            : 'bg-white text-gray-800 rounded-bl-sm'
        }`}
      >
        <p>{message.text}</p>

        {/* Filter chips (debugging / UX clarity) */}
        {!isUser && message.filters && (
          <FilterChips filters={message.filters} />
        )}

        {/* Product cards as horizontal scroll */}
        {!isUser && message.products && message.products.length > 0 && (
          <div className="mt-3 -mx-2 overflow-x-auto chat-scroll">
            <div className="flex gap-3 px-2 pb-2">
              {message.products.slice(0, 8).map((p) => (
                <MiniProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChips({ filters }) {
  const chips = [];
  if (filters.brand) chips.push(['Brand', filters.brand]);
  if (filters.category) chips.push(['Category', filters.category]);
  if (filters.color) chips.push(['Color', filters.color]);
  if (filters.gender) chips.push(['Gender', filters.gender]);
  if (filters.max_price) chips.push(['Max ₹', filters.max_price]);
  if (filters.min_price) chips.push(['Min ₹', filters.min_price]);
  if (chips.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {chips.map(([k, v]) => (
        <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {k}: <strong>{v}</strong>
        </span>
      ))}
    </div>
  );
}

function MiniProductCard({ product }) {
  return (
    <Link
      to={`/product/${product._id}`}
      className="block w-32 flex-shrink-0 bg-white rounded-md overflow-hidden border border-gray-100 hover:shadow-md transition"
    >
      <div className="aspect-[3/4] bg-gray-50">
        <img
          src={firstImage(product)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
        />
      </div>
      <div className="p-2">
        <p className="text-[11px] font-bold text-gray-900 truncate">{product.brand}</p>
        <p className="text-[10px] text-gray-500 line-clamp-2">{truncate(product.name, 40)}</p>
        <p className="text-[12px] font-bold mt-1">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
