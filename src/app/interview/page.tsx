'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PenLine } from 'lucide-react';
import InterviewProgress from '@/components/InterviewProgress';
import InterviewStep from '@/components/InterviewStep';
import { useAuthorStore } from '@/store/useAuthorStore';
import styles from './page.module.css';

const INTERVIEW_STEPS = [
  {
    title: 'Your Identity',
    subtitle: 'Step 1 of 7',
    description: 'Let us know who you are. Your name, your ministry, and the theological stream you flow in.',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text' as const, placeholder: 'e.g., Apostle John Smith', required: true },
      { name: 'ministry', label: 'Ministry Name / Affiliation', type: 'text' as const, placeholder: 'e.g., Kingdom Fire Ministries' },
      {
        name: 'theologicalStream', label: 'Theological Stream', type: 'select' as const,
        options: [
          { value: 'Apostolic-Prophetic', label: 'Apostolic-Prophetic' },
          { value: 'Charismatic', label: 'Charismatic' },
          { value: 'Pentecostal', label: 'Pentecostal' },
          { value: 'Reformed Charismatic', label: 'Reformed Charismatic' },
          { value: 'Word of Faith', label: 'Word of Faith' },
          { value: 'Full Gospel', label: 'Full Gospel' },
          { value: 'Non-Denominational Spirit-Filled', label: 'Non-Denominational Spirit-Filled' },
          { value: 'Other', label: 'Other' },
        ],
      },
    ],
  },
  {
    title: 'Tone & Style',
    subtitle: 'Step 2 of 7',
    description: 'How do you sound when you preach or write? What is the atmosphere of your words?',
    fields: [
      {
        name: 'toneDescriptors', label: 'Tone Descriptors', type: 'tags' as const,
        placeholder: 'Type and press Enter (e.g., authoritative, pastoral, prophetic...)',
        hint: 'Add words that describe your voice — how you sound in the pulpit and on the page.',
      },
      {
        name: 'writingStyle', label: 'Writing Style Description', type: 'textarea' as const,
        placeholder: 'Describe how you write. Are you conversational or formal? Do you use short punchy sentences or long flowing paragraphs? Do you tell stories or cite data?',
        hint: 'Be as detailed as possible — this helps The Scribe match your unique rhythm.',
      },
    ],
  },
  {
    title: 'Signature Language',
    subtitle: 'Step 3 of 7',
    description: 'Every powerful voice has signature phrases — the words and expressions that are uniquely yours.',
    fields: [
      {
        name: 'signaturePhrases', label: 'Your Signature Phrases', type: 'tags' as const,
        placeholder: 'Press Enter after each phrase (e.g., "I decree and declare", "Saints of God"...)',
        hint: 'These are phrases you repeat often, that your audience associates with you. Add as many as you can.',
      },
    ],
  },
  {
    title: 'Scripture Foundation',
    subtitle: 'Step 4 of 7',
    description: 'The Word is your foundation. What scriptures anchor your ministry and writing?',
    fields: [
      {
        name: 'anchorScriptures', label: 'Anchor Scriptures', type: 'tags' as const,
        placeholder: 'Press Enter after each reference (e.g., Isaiah 61:1, Romans 8:28...)',
        hint: 'Your go-to scriptures — the ones you always come back to when teaching or writing.',
      },
      {
        name: 'preferredBibleVersion', label: 'Preferred Bible Version', type: 'select' as const,
        options: [
          { value: 'KJV', label: 'King James Version (KJV)' },
          { value: 'NKJV', label: 'New King James Version (NKJV)' },
          { value: 'NIV', label: 'New International Version (NIV)' },
          { value: 'ESV', label: 'English Standard Version (ESV)' },
          { value: 'NLT', label: 'New Living Translation (NLT)' },
          { value: 'AMP', label: 'Amplified Bible (AMP)' },
          { value: 'MSG', label: 'The Message (MSG)' },
          { value: 'NASB', label: 'New American Standard Bible (NASB)' },
        ],
      },
    ],
  },
  {
    title: 'Personal Stories',
    subtitle: 'Step 5 of 7',
    description: 'Your testimony is powerful. Share the key experiences and stories you often reference in your ministry.',
    fields: [
      {
        name: 'personalTestimony', label: 'Key Personal Testimonies & Stories', type: 'textarea' as const,
        placeholder: 'Share the stories that shaped your ministry. Your testimony of salvation, key breakthrough moments, divine encounters, pivotal life experiences that you reference when you preach or write...',
        hint: 'The more detail you provide, the more authentically The Scribe can weave your story into your writing.',
      },
    ],
  },
  {
    title: 'Theological Framework',
    subtitle: 'Step 6 of 7',
    description: 'What are the core beliefs and doctrinal positions that undergird everything you write and teach?',
    fields: [
      {
        name: 'theologicalFramework', label: 'Core Theological Beliefs', type: 'textarea' as const,
        placeholder: 'Describe your core doctrinal positions. For example: your view on the gifts of the Spirit, spiritual warfare, the role of the fivefold ministry, grace vs. holiness, eschatology, healing, prophetic ministry, etc.',
        hint: 'This ensures The Scribe never writes anything that contradicts your theological convictions.',
      },
    ],
  },
  {
    title: 'Audience & Boundaries',
    subtitle: 'Step 7 of 7',
    description: 'Who are you writing for, and what territory should The Scribe avoid?',
    fields: [
      {
        name: 'audienceDescription', label: 'Target Audience', type: 'textarea' as const,
        placeholder: 'Describe who reads your books and follows your ministry. Are they new believers? Seasoned leaders? Young adults? Church planters?',
      },
      {
        name: 'avoidTopics', label: 'Topics or Language to Avoid', type: 'tags' as const,
        placeholder: 'Press Enter after each topic (e.g., "profanity", "political partisanship"...)',
        hint: 'Anything The Scribe should never include in your writing.',
      },
    ],
  },
];

export default function InterviewPage() {
  const router = useRouter();
  const { currentAuthor, saveInterviewStep, loading } = useAuthorStore();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!currentAuthor) {
      router.push('/');
      return;
    }
    // Resume from where they left off
    if (currentAuthor.interviewStep > 0 && currentAuthor.interviewStep < 7) {
      setCurrentStep(currentAuthor.interviewStep);
    }
    if (currentAuthor.interviewCompleted) {
      router.push('/dashboard');
    }
  }, [currentAuthor, router]);

  if (!currentAuthor) return null;

  const handleStepSubmit = async (data: Record<string, unknown>) => {
    await saveInterviewStep(currentAuthor._id, currentStep, data);

    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Interview complete — go to dashboard
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepConfig = INTERVIEW_STEPS[currentStep];

  // Build initial data from existing author profile
  const getInitialData = (): Record<string, unknown> => {
    const vp = currentAuthor.voiceProfile;
    switch (currentStep) {
      case 0: return { name: currentAuthor.name, ministry: currentAuthor.ministry, theologicalStream: currentAuthor.theologicalStream };
      case 1: return { toneDescriptors: vp.toneDescriptors, writingStyle: vp.writingStyle };
      case 2: return { signaturePhrases: vp.signaturePhrases };
      case 3: return { anchorScriptures: vp.anchorScriptures, preferredBibleVersion: vp.preferredBibleVersion };
      case 4: return { personalTestimony: vp.personalTestimony };
      case 5: return { theologicalFramework: vp.theologicalFramework };
      case 6: return { audienceDescription: vp.audienceDescription, avoidTopics: vp.avoidTopics };
      default: return {};
    }
  };

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bgGlow} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoMark}>
          <PenLine size={20} />
        </div>
        <span className={styles.headerTitle}>Voice Capture Interview</span>
      </header>

      {/* Progress */}
      <div className={styles.progressWrapper}>
        <InterviewProgress currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <main className={styles.main}>
        <InterviewStep
          key={currentStep}
          title={stepConfig.title}
          subtitle={stepConfig.subtitle}
          description={stepConfig.description}
          fields={stepConfig.fields}
          onSubmit={handleStepSubmit}
          onBack={handleBack}
          isFirst={currentStep === 0}
          isLast={currentStep === 6}
          initialData={getInitialData()}
          loading={loading}
        />
      </main>
    </div>
  );
}
