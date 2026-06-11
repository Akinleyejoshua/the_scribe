'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenLine, BookOpen, Mic, Sparkles, ArrowRight, Users } from 'lucide-react';
import { FiTrash2 } from 'react-icons/fi';
import { useAuthorStore } from '@/store/useAuthorStore';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();
  const { authors, fetchAuthors, createAuthor, deleteAuthor, setCurrentAuthor, loading } = useAuthorStore();
  const [newAuthorName, setNewAuthorName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) return;
    const author = await createAuthor(newAuthorName.trim());
    if (author) {
      setNewAuthorName('');
      setShowCreate(false);
      router.push('/interview');
    }
  };

  const handleSelectAuthor = (author: typeof authors[0]) => {
    setCurrentAuthor(author);
    if (author.interviewCompleted) {
      router.push('/dashboard');
    } else {
      router.push('/interview');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateAuthor();
    }
  };

  return (
    <div className={styles.page}>
      {/* Background Effects */}
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.bgGrid} />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          {/* Logo Badge */}
          <div className={`${styles.logoBadge} animate-fade-in-up`}>
            <PenLine size={32} />
          </div>

          <h1 className={`${styles.heroTitle} animate-fade-in-up stagger-1`}>
            The Scribe
          </h1>

          <p className={`${styles.heroTagline} animate-fade-in-up stagger-2`}>
            Your Spirit-Led Ghostwriter
          </p>

          <p className={`${styles.heroDescription} animate-fade-in-up stagger-3`}>
            An AI writing assistant purpose-built for apostolic, prophetic, and Spirit-filled
            ministry voices. We capture your theological voice, then generate full manuscripts
            in your exact style.
          </p>

          {/* CTA */}
          <div className={`${styles.heroActions} animate-fade-in-up stagger-4`}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowCreate(true)}
            >
              <Sparkles size={18} />
              Begin Your Journey
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className={`${styles.features} animate-fade-in-up stagger-5`}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Mic size={24} />
            </div>
            <h3>Voice Capture</h3>
            <p>7-step guided interview captures your unique writing DNA — tone, phrases, scriptures, stories</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <BookOpen size={24} />
            </div>
            <h3>Manuscript Generation</h3>
            <p>Full book outlines and chapters generated in your exact voice and theological framework</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <PenLine size={24} />
            </div>
            <h3>AI Writing Companion</h3>
            <p>An integrated assistant that knows your voice — refine, brainstorm, and develop your message</p>
          </div>
        </div>
      </section>

      {/* Author Profiles Section */}
      {authors.length > 0 && (
        <section className={`${styles.authorsSection} animate-fade-in-up`}>
          <h2 className={styles.sectionTitle}>
            <Users size={22} />
            Your Author Profiles
          </h2>
          <div className={styles.authorGrid}>
            {authors.map((author) => (
              <div
                key={author._id}
                className={styles.authorCard}
                onClick={() => handleSelectAuthor(author)}
              >
                <div className={styles.authorCardHeader}>
                  <div className={styles.authorInitial}>
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.authorCardInfo}>
                    <h4>{author.name}</h4>
                    <span>{author.ministry || 'Ministry Author'}</span>
                  </div>
                </div>
                <div className={styles.authorCardMeta}>
                  {author.interviewCompleted ? (
                    <span className="badge badge-success">Profile Complete</span>
                  ) : (
                    <span className="badge badge-warning">Interview in Progress</span>
                  )}
                  {author.theologicalStream && (
                    <span className="badge badge-purple">{author.theologicalStream}</span>
                  )}
                </div>
                <div className={styles.authorCardActions}>
                  <button className={`btn btn-sm btn-primary`}>
                    <ArrowRight size={14} />
                    {author.interviewCompleted ? 'Open Dashboard' : 'Continue Interview'}
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={(e) => { e.stopPropagation(); deleteAuthor(author._id); }}
                    title="Delete profile"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Create Author Modal */}
      {showCreate && (
        <>
          <div className="modal-backdrop" onClick={() => setShowCreate(false)} />
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Begin Your Journey</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>
                ×
              </button>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.7, fontSize: 'var(--text-sm)' }}>
              Enter your name to start the Voice Capture interview. This process helps The Scribe learn your unique
              writing style, theology, and ministry voice.
            </p>
            <div className="input-group">
              <label className="input-label">Your Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="e.g., Pastor John Smith"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleCreateAuthor}
                disabled={!newAuthorName.trim() || loading}
              >
                {loading ? <span className="spinner" /> : '✨ Start Interview'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
