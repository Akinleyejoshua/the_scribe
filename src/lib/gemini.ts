import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

interface AuthorVoiceProfile {
  name: string;
  ministry: string;
  theologicalStream: string;
  voiceProfile: {
    toneDescriptors: string[];
    signaturePhrases: string[];
    anchorScriptures: string[];
    writingStyle: string;
    audienceDescription: string;
    personalTestimony: string;
    theologicalFramework: string;
    avoidTopics: string[];
    preferredBibleVersion: string;
  };
}

function buildAuthorSystemPrompt(author: AuthorVoiceProfile): string {
  const vp = author.voiceProfile;
  return `You are a gifted ghostwriter who has studied ${author.name} for years. You write EXACTLY in their voice, style, and theological framework. You are not a generic AI — you are ${author.name}'s personal writing companion.

AUTHOR PROFILE:
- Name: ${author.name}
- Ministry: ${author.ministry}
- Theological Stream: ${author.theologicalStream}

VOICE & TONE:
- Tone: ${vp.toneDescriptors.join(', ')}
- Writing Style: ${vp.writingStyle}

SIGNATURE LANGUAGE:
These are phrases ${author.name} characteristically uses. Weave them naturally throughout your writing:
${vp.signaturePhrases.map(p => `- "${p}"`).join('\n')}

ANCHOR SCRIPTURES:
These are ${author.name}'s go-to scriptures. Reference them where contextually appropriate:
${vp.anchorScriptures.map(s => `- ${s}`).join('\n')}
Preferred Bible Version: ${vp.preferredBibleVersion}

PERSONAL TESTIMONY & STORIES:
${vp.personalTestimony}

THEOLOGICAL FRAMEWORK:
${vp.theologicalFramework}

TARGET AUDIENCE:
${vp.audienceDescription}

TOPICS/LANGUAGE TO AVOID:
${vp.avoidTopics.map(t => `- ${t}`).join('\n')}

CRITICAL INSTRUCTIONS:
1. Write as if YOU ARE ${author.name}. Use first person.
2. Match their exact tone — ${vp.toneDescriptors[0] || 'authentic'} and ${vp.toneDescriptors[1] || 'powerful'}.
3. Include their signature phrases naturally, not forced.
4. Reference their anchor scriptures when contextually relevant.
5. Draw from their personal stories when it strengthens the message.
6. Stay within their theological framework — never contradict their core beliefs.
7. Write for their specific audience.
8. Never use language or topics they want to avoid.`;
}

export async function generateContent(prompt: string, systemInstruction?: string) {
  const result = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || 'You are a helpful AI writing assistant for Christian authors.',
    },
  });
  return result.text || '';
}

export async function generateWithAuthorVoice(author: AuthorVoiceProfile, prompt: string) {
  const systemPrompt = buildAuthorSystemPrompt(author);
  return generateContent(prompt, systemPrompt);
}

export async function generateOutline(author: AuthorVoiceProfile, bookDetails: {
  title: string;
  description: string;
  bookType: string;
  targetAudience: string;
}) {
  const systemPrompt = buildAuthorSystemPrompt(author);
  const prompt = `Create a detailed book outline for the following:

BOOK TITLE: "${bookDetails.title}"
BOOK TYPE: ${bookDetails.bookType}
DESCRIPTION: ${bookDetails.description}
TARGET AUDIENCE: ${bookDetails.targetAudience}

Create a compelling book outline with 8-12 chapters. For each chapter provide:
1. Chapter number
2. Chapter title (compelling and on-brand for the author)
3. A 2-3 sentence summary of what the chapter covers
4. 3-5 key points or sub-topics

Format your response as valid JSON with this structure:
{
  "chapters": [
    {
      "number": 1,
      "title": "Chapter Title",
      "summary": "Chapter summary...",
      "keyPoints": ["point 1", "point 2", "point 3"]
    }
  ]
}

Only return the JSON, no other text.`;

  return generateContent(prompt, systemPrompt);
}

export async function generateChapter(author: AuthorVoiceProfile, chapterDetails: {
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterSummary: string;
  keyPoints: string[];
  previousChapterSummary?: string;
  outline: string;
}) {
  const systemPrompt = buildAuthorSystemPrompt(author);
  const prompt = `Write Chapter ${chapterDetails.chapterNumber}: "${chapterDetails.chapterTitle}" for the book "${chapterDetails.bookTitle}".

CHAPTER OVERVIEW: ${chapterDetails.chapterSummary}

KEY POINTS TO COVER:
${chapterDetails.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

${chapterDetails.previousChapterSummary ? `PREVIOUS CHAPTER SUMMARY (for continuity): ${chapterDetails.previousChapterSummary}` : ''}

FULL BOOK OUTLINE FOR CONTEXT:
${chapterDetails.outline}

INSTRUCTIONS:
- Write 2000-3000 words for this chapter
- Begin with a compelling opening that draws the reader in
- Include relevant scripture references (using the author's preferred Bible version)
- Weave in personal stories and testimony where appropriate
- End with a powerful conclusion or call to action
- Include a prayer or declaration at the end if appropriate for this author's style
- Write in the author's exact voice and style`;

  return generateContent(prompt, systemPrompt);
}

export async function streamChat(
  author: AuthorVoiceProfile | null,
  messages: Array<{ role: string; content: string }>,
  currentManuscriptContext?: string
) {
  const systemPrompt = author
    ? `${buildAuthorSystemPrompt(author)}

You are also ${author.name}'s AI writing assistant — "The Scribe." You help them brainstorm, refine passages, discuss theology, and develop their manuscript. Be warm, encouraging, and Spirit-led in your responses. Address them by name occasionally.

${currentManuscriptContext ? `CURRENT MANUSCRIPT CONTEXT:\n${currentManuscriptContext}` : ''}`
    : `You are "The Scribe," an AI writing assistant purpose-built for Christian authors. You help Spirit-filled ministry voices brainstorm, develop outlines, refine their writing, and discuss theology. Be warm, encouraging, and Spirit-led in your responses.`;

  const formattedContents = messages.map(m => ({
    role: m.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: m.content }],
  }));

  const result = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash',
    contents: formattedContents,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  return result;
}
