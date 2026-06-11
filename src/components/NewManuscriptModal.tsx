'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import styles from './NewManuscriptModal.module.css';

interface NewManuscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    subtitle: string;
    description: string;
    targetAudience: string;
    bookType: string;
  }) => void;
  loading?: boolean;
}

const bookTypes = [
  { value: 'devotional', label: '🕊️ Devotional', desc: 'Daily readings and meditations' },
  { value: 'teaching', label: '📚 Teaching', desc: 'Doctrinal or instructional content' },
  { value: 'prophetic', label: '🔥 Prophetic', desc: 'Prophetic words and declarations' },
  { value: 'testimony', label: '💎 Testimony', desc: 'Personal story and life journey' },
  { value: 'study guide', label: '📖 Study Guide', desc: 'Bible study and curriculum' },
];

export default function NewManuscriptModal({ isOpen, onClose, onSubmit, loading }: NewManuscriptModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [bookType, setBookType] = useState('teaching');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, subtitle, description, targetAudience, bookType });
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">New Manuscript</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX size={16} />
          </button>
        </div>

        <div className={styles.form}>
          <div className="input-group">
            <label className="input-label">Book Title *</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., Walking in Kingdom Authority"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Subtitle</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., A Guide to Spiritual Warfare"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Book Type</label>
            <div className={styles.bookTypes}>
              {bookTypes.map((type) => (
                <button
                  key={type.value}
                  className={`${styles.typeBtn} ${bookType === type.value ? styles.typeActive : ''}`}
                  onClick={() => setBookType(type.value)}
                  type="button"
                >
                  <span className={styles.typeLabel}>{type.label}</span>
                  <span className={styles.typeDesc}>{type.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <span className="input-hint">What is this book about? The more detail, the better the AI can help.</span>
            <textarea
              className="input"
              placeholder="Describe the key themes, messages, and purpose of your book..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Target Audience</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., New believers, church leaders, young adults..."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={!title.trim() || loading}
            >
              {loading ? <span className="spinner" /> : '✨ Create Manuscript'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
