import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Manuscript from '@/models/Manuscript';
import Author from '@/models/Author';
import { generateChapter } from '@/lib/gemini';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await request.json();
    const { chapterNumber } = body;

    const manuscript = await Manuscript.findById(id);
    if (!manuscript) {
      return Response.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    const author = await Author.findById(manuscript.authorId);
    if (!author) {
      return Response.json({ error: 'Author not found' }, { status: 404 });
    }

    const chapterIndex = manuscript.chapters.findIndex(
      (ch: { number: number }) => ch.number === chapterNumber
    );
    if (chapterIndex === -1) {
      return Response.json({ error: 'Chapter not found in outline' }, { status: 404 });
    }

    const chapter = manuscript.chapters[chapterIndex];
    const previousChapter = chapterIndex > 0 ? manuscript.chapters[chapterIndex - 1] : null;

    const content = await generateChapter(author.toObject(), {
      bookTitle: manuscript.title,
      chapterNumber: chapter.number,
      chapterTitle: chapter.title,
      chapterSummary: chapter.summary || '',
      keyPoints: chapter.keyPoints || [],
      previousChapterSummary: previousChapter?.summary || undefined,
      outline: manuscript.outline,
    });

    // Update chapter with generated content
    manuscript.chapters[chapterIndex].content = content;
    manuscript.chapters[chapterIndex].status = 'draft';
    manuscript.chapters[chapterIndex].generatedAt = new Date();
    await manuscript.save();

    return Response.json(manuscript);
  } catch (error) {
    console.error('Generate chapter error:', error);
    return Response.json({ error: 'Failed to generate chapter' }, { status: 500 });
  }
}
