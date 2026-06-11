'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiBook, FiFileText, FiEdit3 } from 'react-icons/fi';
import { Sparkles, PenLine } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import VoiceProfileCard from '@/components/VoiceProfileCard';
import ManuscriptCard from '@/components/ManuscriptCard';
import NewManuscriptModal from '@/components/NewManuscriptModal';
import AIChat from '@/components/AIChat';
import { useAuthorStore } from '@/store/useAuthorStore';
import { useManuscriptStore } from '@/store/useManuscriptStore';
import { useUIStore } from '@/store/useUIStore';
import styles from './page.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { currentAuthor, fetchAuthor } = useAuthorStore();
  const { manuscripts, fetchManuscripts, createManuscript, deleteManuscript, loading } = useManuscriptStore();
  const { showNewManuscriptModal, setShowNewManuscriptModal, sidebarCollapsed } = useUIStore();

  useEffect(() => {
    if (!currentAuthor) {
      router.push('/');
      return;
    }
    if (!currentAuthor.interviewCompleted) {
      router.push('/interview');
      return;
    }
    fetchManuscripts(currentAuthor._id);
  }, [currentAuthor, router, fetchManuscripts, fetchAuthor]);

  if (!currentAuthor) return null;

  const handleCreateManuscript = async (data: {
    title: string;
    subtitle: string;
    description: string;
    targetAudience: string;
    bookType: string;
  }) => {
    const manuscript = await createManuscript({
      ...data,
      authorId: currentAuthor._id,
    } as Parameters<typeof createManuscript>[0]);
    if (manuscript) {
      setShowNewManuscriptModal(false);
      router.push(`/manuscript/${manuscript._id}`);
    }
  };

  const handleDeleteManuscript = async (id: string) => {
    if (confirm('Are you sure you want to delete this manuscript?')) {
      await deleteManuscript(id);
    }
  };

  // Compute stats
  const totalChapters = manuscripts.reduce((sum, m) => sum + m.chapters.length, 0);
  const totalWords = manuscripts.reduce(
    (sum, m) => sum + m.chapters.reduce((cs, ch) => cs + (ch.content?.split(/\s+/).length || 0), 0),
    0
  );
  const draftsWritten = manuscripts.reduce(
    (sum, m) => sum + m.chapters.filter((ch) => ch.status !== 'outline').length,
    0
  );

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={`${styles.main} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>
              Welcome back, {currentAuthor.name.split(' ')[0]}
            </h1>
            <p className={styles.subtitle}>
              Your Spirit-led writing dashboard
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowNewManuscriptModal(true)}
          >
            <FiPlus size={18} />
            New Manuscript
          </button>
        </header>

        {/* Stats */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiBook size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{manuscripts.length}</span>
              <span className={styles.statLabel}>Manuscripts</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiFileText size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{totalChapters}</span>
              <span className={styles.statLabel}>Total Chapters</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiEdit3 size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{draftsWritten}</span>
              <span className={styles.statLabel}>Drafts Written</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <PenLine size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{totalWords.toLocaleString()}</span>
              <span className={styles.statLabel}>Words Written</span>
            </div>
          </div>
        </section>

        {/* Voice Profile */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={20} />
            Your Voice Profile
          </h2>
          <VoiceProfileCard
            author={currentAuthor}
            onEdit={() => router.push('/interview')}
          />
        </section>

        {/* Manuscripts */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FiBook size={20} />
              Your Manuscripts
            </h2>
          </div>

          {manuscripts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📖</div>
              <h3>No manuscripts yet</h3>
              <p>Create your first manuscript and let The Scribe help you write in your unique voice.</p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowNewManuscriptModal(true)}
              >
                <Sparkles size={18} />
                Create Your First Book
              </button>
            </div>
          ) : (
            <div className={styles.manuscriptGrid}>
              {manuscripts.map((manuscript, index) => (
                <div key={manuscript._id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <ManuscriptCard
                    manuscript={manuscript}
                    onClick={() => router.push(`/manuscript/${manuscript._id}`)}
                    onDelete={() => handleDeleteManuscript(manuscript._id)}
                  />
                </div>
              ))}

              {/* Add New Card */}
              <button
                className={styles.addCard}
                onClick={() => setShowNewManuscriptModal(true)}
              >
                <FiPlus size={32} />
                <span>New Manuscript</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modals & Overlays */}
      <NewManuscriptModal
        isOpen={showNewManuscriptModal}
        onClose={() => setShowNewManuscriptModal(false)}
        onSubmit={handleCreateManuscript}
        loading={loading}
      />

      <AIChat />
    </div>
  );
}
