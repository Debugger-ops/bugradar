'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, AnalysisResult } from '@/app/libs/types';
import styles from '@/app/styles/AIChat.module.css';

interface AIChatProps {
  code: string;
  language: string;
  analysisResult?: AnalysisResult | null;
}

export default function AIChat({ code, language, analysisResult }: AIChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm BugRadar AI. Paste your code, run an analysis, and I can help you understand any issues or answer questions about your code.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          messages: newMessages,
          analysisResult,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${data.error}`, timestamp: Date.now() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message, timestamp: Date.now() },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error. Please try again.', timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const QUICK_PROMPTS = [
    'Explain the most critical bug',
    'How do I fix the security issues?',
    'What is the overall code quality?',
    'Show me the refactored code',
  ];

  function renderMessage(content: string) {
    // Simple code block rendering
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const lang = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={i} className={styles.codeBlock}>
            {lang && <div className={styles.codeLang}>{lang}</div>}
            <pre>{code}</pre>
          </div>
        );
      }
      // Bold and inline code
      const formatted = part
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{ __html: formatted.replace(/\n/g, '<br/>') }}
        />
      );
    });
  }

  return (
    <>
      {/* Floating Button */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => setOpen(!open)}
        title="Ask BugRadar AI"
      >
        {open ? '✕' : '🤖'}
        {!open && messages.length > 1 && (
          <span className={styles.fabBadge}>{messages.filter((m) => m.role === 'assistant').length - 1}</span>
        )}
      </button>

      {/* Chat Drawer */}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <span className={styles.aiDot} />
            <span>BugRadar AI</span>
          </div>
          <div className={styles.drawerMeta}>
            <span className={styles.modelBadge}>llama-3.3 / claude</span>
            <button className={styles.clearBtn} onClick={() => setMessages([{
              role: 'assistant',
              content: "Chat cleared. Ask me anything about your code!",
              timestamp: Date.now(),
            }])}>
              Clear
            </button>
          </div>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
              <div className={styles.msgAvatar}>
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className={styles.msgBubble}>
                {renderMessage(msg.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.msgAvatar}>🤖</div>
              <div className={`${styles.msgBubble} ${styles.typing}`}>
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className={styles.quickPrompts}>
            {QUICK_PROMPTS.map((p) => (
              <button key={p} className={styles.quickBtn} onClick={() => { setInput(p); inputRef.current?.focus(); }}>
                {p}
              </button>
            ))}
          </div>
        )}

        <div className={styles.inputArea}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a bug, request a fix, explain code... (Enter to send)"
            rows={2}
            disabled={loading}
          />
          <button
            className={styles.sendBtn}
            onClick={send}
            disabled={loading || !input.trim()}
          >
            {loading ? <span className={styles.sendSpinner} /> : '▶'}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}
    </>
  );
}
