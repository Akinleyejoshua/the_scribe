'use client';

import { FiBook, FiClock, FiFileText, FiTrash2 } from 'react-icons/fi';
import { Sparkles } from 'lucide-react';
import type { Manuscript } from '@/store/useManuscriptStore';
import styles from './ManuscriptCard.module.css';

interface ManuscriptCardProps {
  manuscript: Manuscript;
  onClick: () => void;
  onDelete: () => void;
}

const statusConfig = {
  planning: { label: 'Planning', class: 'badge-info' },
  drafting: { label: 'Drafting', class: 'badge-warning' },
  revising: { label: 'Revising', class: 'badge-purple' },
  complete: { label: 'Complete', class: 'badge-success' },
};

const bookTypeIcons: Record<string, string> = {
  devotional: '🕊️',
  teaching: '📚',
  prophetic: '🔥',
  testimony: '💎',
  'study guide': '📖',
};

export default function ManuscriptCard({ manuscript, onClick, onDelete }: ManuscriptCardProps) {
  const status = statusConfig[manuscript.status];
  const chaptersWritten = manuscript.chapters.filter((c) => c.status !== 'outline').length;
  const totalChapters = manuscript.chapters.length;
  const wordCount = manuscript.chapters.reduce((acc, ch) => acc + (ch.content?.split(/\s+/).length || 0), 0);

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.typeIcon}>
          {bookTypeIcons[manuscript.bookType] || '📖'}
        </div>
        <span className={`badge ${status.class}`}>{status.label}</span>
      </div>

      <h3 className={styles.title}>{manuscript.title}</h3>
      {manuscript.subtitle && (
        <p className={styles.subtitle}>{manuscript.subtitle}</p>
      )}
      <p className={styles.description}>
        {manuscript.description || 'No description yet'}
      </p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <FiBook size={14} />
          <span>{chaptersWritten}/{totalChapters} chapters</span>
        </div>
        <div className={styles.stat}>
          <FiFileText size={14} />
          <span>{wordCount.toLocaleString()} words</span>
        </div>
        <div className={styles.stat}>
          <FiClock size={14} />
          <span>{new Date(manuscript.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={`btn btn-sm btn-primary ${styles.continueBtn}`}>
          <Sparkles size={14} />
          Continue Writing
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete manuscript"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
}
