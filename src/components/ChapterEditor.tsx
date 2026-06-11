'use client';

import { useState, useCallback } from 'react';
import { FiSave, FiCopy, FiDownload } from 'react-icons/fi';
import { Sparkles } from 'lucide-react';
import type { Chapter } from '@/store/useManuscriptStore';
import styles from './ChapterEditor.module.css';

interface ChapterEditorProps {
  chapter: Chapter | null;
  onSave: (content: string) => void;
  onGenerate: () => void;
  generating: boolean;
  bookTitle: string;
}

export default function ChapterEditor({
  chapter,
  onSave,
  onGenerate,
  generating,
  bookTitle,
}: ChapterEditorProps) {
  const [content, setContent] = useState(chapter?.content || '');
  const [saved, setSaved] = useState(true);

  // Update content when chapter changes
  const [prevChapterNumber, setPrevChapterNumber] = useState(chapter?.number);
  if (chapter && chapter.number !== prevChapterNumber) {
    setContent(chapter.content || '');
    setSaved(true);
    setPrevChapterNumber(chapter.number);
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    onSave(content);
    setSaved(true);
  }, [content, onSave]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle} - Chapter ${chapter?.number} - ${chapter?.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, bookTitle, chapter]);

  if (!chapter) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📖</div>
        <h3>Select a Chapter</h3>
        <p>Choose a chapter from the sidebar to begin writing</p>
      </div>
    );
  }

  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.chapterInfo}>
          <span className={styles.chapterNum}>Chapter {chapter.number}</span>
          <h2 className={styles.chapterTitle}>{chapter.title}</h2>
        </div>

        <div className={styles.toolbarActions}>
          <span className={styles.wordCount}>{wordCount.toLocaleString()} words</span>
          {!saved && (
            <span className={styles.unsaved}>Unsaved</span>
          )}
          <button className="btn btn-ghost btn-icon" onClick={handleCopy} title="Copy">
            <FiCopy size={16} />
          </button>
          <button className="btn btn-ghost btn-icon" onClick={handleDownload} title="Download">
            <FiDownload size={16} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleSave} disabled={saved}>
            <FiSave size={14} />
            Save
          </button>
          {!content && (
            <button className="btn btn-primary btn-sm" onClick={onGenerate} disabled={generating}>
              {generating ? <span className="spinner" /> : <Sparkles size={14} />}
              Generate Chapter
            </button>
          )}
        </div>
      </div>

      {chapter.summary && (
        <div className={styles.summaryBar}>
          <strong>Summary:</strong> {chapter.summary}
        </div>
      )}

      <div className={styles.editorWrapper}>
        {generating ? (
          <div className={styles.generatingState}>
            <div className={styles.generatingIcon}>
              <Sparkles size={32} className="animate-pulse-glow" />
            </div>
            <h3>The Scribe is writing...</h3>
            <p>Generating chapter content in your unique voice</p>
            <div className={styles.typingDots}>
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <textarea
            className={styles.editor}
            value={content}
            onChange={handleChange}
            placeholder="Begin writing or generate content with AI..."
            spellCheck
          />
        )}
      </div>
    </div>
  );
}
