'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import { PenLine } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useAuthorStore } from '@/store/useAuthorStore';
import styles from './AIChat.module.css';

interface AIChatProps {
  manuscriptId?: string;
}

export default function AIChat({ manuscriptId }: AIChatProps) {
  const { messages, isOpen, streaming, sendMessage, toggleChat, loadMessages } = useChatStore();
  const { currentAuthor } = useAuthorStore();
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && currentAuthor) {
      loadMessages(currentAuthor._id, manuscriptId);
    }
  }, [isOpen, currentAuthor, manuscriptId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || streaming || !currentAuthor) return;
    sendMessage(input.trim(), currentAuthor._id, manuscriptId);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className={styles.fab} onClick={toggleChat} title="Open The Scribe AI">
          <PenLine size={22} />
          <span className={styles.fabPulse} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className={`${styles.panel} ${expanded ? styles.expanded : ''}`}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.headerIcon}>
                <PenLine size={18} />
              </div>
              <div>
                <h3 className={styles.headerTitle}>The Scribe</h3>
                <span className={styles.headerSubtitle}>Your AI Writing Companion</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.headerBtn}
                onClick={() => setExpanded(!expanded)}
                title={expanded ? 'Minimize' : 'Maximize'}
              >
                {expanded ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
              </button>
              <button className={styles.headerBtn} onClick={toggleChat} title="Close">
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <div className={styles.welcomeIcon}>✍️</div>
                <h4>Shalom{currentAuthor ? `, ${currentAuthor.name.split(' ')[0]}` : ''}!</h4>
                <p>I&apos;m The Scribe, your Spirit-led writing companion. Ask me anything about your manuscript, theology, or writing craft.</p>
                <div className={styles.suggestions}>
                  <button
                    className={styles.suggestion}
                    onClick={() => setInput('Help me develop my next chapter theme')}
                  >
                    💡 Help with chapter themes
                  </button>
                  <button
                    className={styles.suggestion}
                    onClick={() => setInput('Suggest scripture references for my topic')}
                  >
                    📖 Scripture suggestions
                  </button>
                  <button
                    className={styles.suggestion}
                    onClick={() => setInput('Refine this paragraph to match my voice')}
                  >
                    ✨ Refine my writing
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
              >
                {msg.role === 'assistant' && (
                  <div className={styles.messageAvatar}>
                    <PenLine size={14} />
                  </div>
                )}
                <div className={styles.messageBubble}>
                  <div className={styles.messageContent}>
                    {msg.content || (streaming && i === messages.length - 1 && (
                      <div className={styles.typingDots}>
                        <span /><span /><span />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask The Scribe..."
              disabled={streaming}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!input.trim() || streaming}
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
