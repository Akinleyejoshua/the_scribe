import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Manuscript from '@/models/Manuscript';
import Author from '@/models/Author';
import { generateOutline } from '@/lib/gemini';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const manuscript = await Manuscript.findById(id);
    if (!manuscript) {
      return Response.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    const author = await Author.findById(manuscript.authorId);
    if (!author) {
      return Response.json({ error: 'Author not found' }, { status: 404 });
    }

    const outlineText = await generateOutline(author.toObject(), {
      title: manuscript.title,
      description: manuscript.description,
      bookType: manuscript.bookType,
      targetAudience: manuscript.targetAudience,
    });

    // Parse the outline JSON
    let outlineData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = outlineText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : outlineText.trim();
      outlineData = JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, store as raw text
      manuscript.outline = outlineText;
      manuscript.status = 'drafting';
      await manuscript.save();
      return Response.json(manuscript);
    }

    // Update manuscript with parsed outline
    manuscript.outline = outlineText;
    manuscript.chapters = outlineData.chapters.map((ch: { number: number; title: string; summary: string; keyPoints: string[] }) => ({
      number: ch.number,
      title: ch.title,
      summary: ch.summary || '',
      keyPoints: ch.keyPoints || [],
      content: '',
      status: 'outline',
    }));
    manuscript.status = 'drafting';
    await manuscript.save();

    return Response.json(manuscript);
  } catch (error) {
    console.error('Generate outline error:', error);
    return Response.json({ error: 'Failed to generate outline' }, { status: 500 });
  }
}
