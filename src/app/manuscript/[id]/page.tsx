'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import { Sparkles } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChapterSidebar from '@/components/ChapterSidebar';
import ChapterEditor from '@/components/ChapterEditor';
import GenerateButton from '@/components/GenerateButton';
import AIChat from '@/components/AIChat';
import { useAuthorStore } from '@/store/useAuthorStore';
import { useManuscriptStore } from '@/store/useManuscriptStore';
import { useUIStore } from '@/store/useUIStore';
import styles from './page.module.css';

export default function ManuscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentAuthor } = useAuthorStore();
  const {
    currentManuscript,
    fetchManuscript,
    generateOutline,
    generateChapter,
    updateChapterContent,
    activeChapterIndex,
    setActiveChapter,
    generating,
    loading,
  } = useManuscriptStore();
  const { sidebarCollapsed } = useUIStore();

  useEffect(() => {
    if (!currentAuthor) {
      router.push('/');
      return;
    }
    fetchManuscript(id);
  }, [id, currentAuthor, router, fetchManuscript]);

  if (!currentAuthor || loading) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={`${styles.loadingState} ${sidebarCollapsed ? styles.collapsed : ''}`}>
          <div className="spinner spinner-lg" />
          <p>Loading manuscript...</p>
        </div>
      </div>
    );
  }

  if (!currentManuscript) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={`${styles.loadingState} ${sidebarCollapsed ? styles.collapsed : ''}`}>
          <p>Manuscript not found</p>
          <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activeChapter = currentManuscript.chapters[activeChapterIndex] || null;
  const hasOutline = currentManuscript.chapters.length > 0;

  const handleDownloadAll = () => {
    const content = currentManuscript.chapters
      .map((ch) => `\n\nCHAPTER ${ch.number}: ${ch.title}\n\n${ch.content || '[Not yet written]'}`)
      .join('\n\n---\n');

    const fullText = `${currentManuscript.title}\n${currentManuscript.subtitle ? currentManuscript.subtitle + '\n' : ''}By ${currentAuthor.name}\n\n---${content}`;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentManuscript.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={`${styles.workspace} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className="btn btn-ghost btn-icon" onClick={() => router.push('/dashboard')}>
              <FiArrowLeft size={18} />
            </button>
            <div className={styles.bookInfo}>
              <h1 className={styles.bookTitle}>{currentManuscript.title}</h1>
              {currentManuscript.subtitle && (
                <span className={styles.bookSubtitle}>{currentManuscript.subtitle}</span>
              )}
            </div>
          </div>
          <div className={styles.topBarRight}>
            <span className={`badge ${currentManuscript.status === 'complete' ? 'badge-success' : currentManuscript.status === 'drafting' ? 'badge-warning' : 'badge-info'}`}>
              {currentManuscript.status.charAt(0).toUpperCase() + currentManuscript.status.slice(1)}
            </span>
            {hasOutline && (
              <button className="btn btn-ghost btn-sm" onClick={handleDownloadAll}>
                <FiDownload size={14} />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {!hasOutline ? (
          /* No outline yet — show generate prompt */
          <div className={styles.outlinePrompt}>
            <div className={styles.outlinePromptContent}>
              <div className={styles.outlineIcon}>✨</div>
              <h2>Generate Your Book Outline</h2>
              <p>
                The Scribe will create a detailed chapter-by-chapter outline for
                &ldquo;{currentManuscript.title}&rdquo; based on your voice profile and book description.
              </p>
              <div className={styles.bookMeta}>
                <span className="badge badge-info">{currentManuscript.bookType}</span>
                {currentManuscript.description && (
                  <p className={styles.bookDesc}>{currentManuscript.description}</p>
                )}
              </div>
              <div className={styles.generateAction}>
                <GenerateButton
                  onClick={() => generateOutline(currentManuscript._id)}
                  loading={generating}
                  label="Generate Book Outline"
                  sublabel="AI will create 8-12 chapters tailored to your voice"
                  icon={<Sparkles size={20} />}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Has outline — show chapter workspace */
          <div className={styles.contentArea}>
            <div className={styles.chapterSidebar}>
              <ChapterSidebar
                chapters={currentManuscript.chapters}
                activeIndex={activeChapterIndex}
                onSelectChapter={setActiveChapter}
                onGenerateChapter={(num) => generateChapter(currentManuscript._id, num)}
                generating={generating}
              />
            </div>
            <div className={styles.editor}>
              <ChapterEditor
                chapter={activeChapter}
                onSave={(content) =>
                  updateChapterContent(currentManuscript._id, activeChapterIndex, content)
                }
                onGenerate={() => {
                  if (activeChapter) generateChapter(currentManuscript._id, activeChapter.number);
                }}
                generating={generating}
                bookTitle={currentManuscript.title}
              />
            </div>
          </div>
        )}
      </div>

      <AIChat manuscriptId={currentManuscript._id} />
    </div>
  );
}
