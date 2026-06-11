'use client';

import { FiCheck, FiEdit3, FiFileText } from 'react-icons/fi';
import { Sparkles } from 'lucide-react';
import type { Chapter } from '@/store/useManuscriptStore';
import styles from './ChapterSidebar.module.css';

interface ChapterSidebarProps {
  chapters: Chapter[];
  activeIndex: number;
  onSelectChapter: (index: number) => void;
  onGenerateChapter: (chapterNumber: number) => void;
  generating: boolean;
}

const statusIcons = {
  outline: FiFileText,
  draft: FiEdit3,
  revised: FiEdit3,
  final: FiCheck,
};

export default function ChapterSidebar({
  chapters,
  activeIndex,
  onSelectChapter,
  onGenerateChapter,
  generating,
}: ChapterSidebarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Chapters</h3>
        <span className={styles.count}>{chapters.length}</span>
      </div>

      <div className={styles.list}>
        {chapters.map((chapter, index) => {
          const StatusIcon = statusIcons[chapter.status];
          const isActive = index === activeIndex;
          const hasContent = chapter.content && chapter.content.length > 0;

          return (
            <div
              key={index}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              onClick={() => onSelectChapter(index)}
            >
              <div className={styles.itemHeader}>
                <div className={`${styles.statusDot} ${styles[chapter.status]}`}>
                  <StatusIcon size={12} />
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.chapterNum}>Chapter {chapter.number}</span>
                  <span className={styles.chapterTitle}>{chapter.title}</span>
                </div>
              </div>

              {!hasContent && (
                <button
                  className={`btn btn-sm btn-ghost ${styles.generateBtn}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateChapter(chapter.number);
                  }}
                  disabled={generating}
                >
                  {generating ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      <Sparkles size={12} />
                      Generate
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
