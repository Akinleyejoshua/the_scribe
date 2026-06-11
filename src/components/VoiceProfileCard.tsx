'use client';

import { FiEdit2 } from 'react-icons/fi';
import { BookOpen } from 'lucide-react';
import type { Author } from '@/store/useAuthorStore';
import styles from './VoiceProfileCard.module.css';

interface VoiceProfileCardProps {
  author: Author;
  onEdit?: () => void;
}

export default function VoiceProfileCard({ author, onEdit }: VoiceProfileCardProps) {
  const vp = author.voiceProfile;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.icon}>
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className={styles.title}>Voice Profile</h3>
            <span className={styles.subtitle}>Your captured writing identity</span>
          </div>
        </div>
        {onEdit && (
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            <FiEdit2 size={14} />
            Edit
          </button>
        )}
      </div>

      <div className={styles.sections}>
        {/* Theological Stream */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Theological Stream</span>
          <span className={`badge badge-purple`}>{author.theologicalStream || 'Not set'}</span>
        </div>

        {/* Tone */}
        {vp.toneDescriptors.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Tone & Voice</span>
            <div className={styles.tags}>
              {vp.toneDescriptors.map((t, i) => (
                <span key={i} className="badge badge-gold">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Signature Phrases */}
        {vp.signaturePhrases.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Signature Phrases</span>
            <div className={styles.phrases}>
              {vp.signaturePhrases.slice(0, 4).map((p, i) => (
                <span key={i} className={styles.phrase}>&ldquo;{p}&rdquo;</span>
              ))}
              {vp.signaturePhrases.length > 4 && (
                <span className={styles.more}>+{vp.signaturePhrases.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* Anchor Scriptures */}
        {vp.anchorScriptures.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Anchor Scriptures</span>
            <div className={styles.scriptures}>
              {vp.anchorScriptures.slice(0, 3).map((s, i) => (
                <span key={i} className={styles.scripture}>📖 {s}</span>
              ))}
              {vp.anchorScriptures.length > 3 && (
                <span className={styles.more}>+{vp.anchorScriptures.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Bible Version */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Bible Version</span>
          <span className="badge badge-info">{vp.preferredBibleVersion || 'NKJV'}</span>
        </div>

        {/* Audience */}
        {vp.audienceDescription && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Target Audience</span>
            <p className={styles.sectionText}>{vp.audienceDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}
