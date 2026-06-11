import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Author from '@/models/Author';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await request.json();
    const { step, data } = body;

    const author = await Author.findById(id);
    if (!author) {
      return Response.json({ error: 'Author not found' }, { status: 404 });
    }

    // Update fields based on interview step
    switch (step) {
      case 0: // Identity
        author.name = data.name || author.name;
        author.ministry = data.ministry || author.ministry;
        author.theologicalStream = data.theologicalStream || author.theologicalStream;
        break;
      case 1: // Tone & Style
        author.voiceProfile.toneDescriptors = data.toneDescriptors || [];
        author.voiceProfile.writingStyle = data.writingStyle || '';
        break;
      case 2: // Signature Language
        author.voiceProfile.signaturePhrases = data.signaturePhrases || [];
        break;
      case 3: // Scripture Foundation
        author.voiceProfile.anchorScriptures = data.anchorScriptures || [];
        author.voiceProfile.preferredBibleVersion = data.preferredBibleVersion || 'NKJV';
        break;
      case 4: // Personal Stories
        author.voiceProfile.personalTestimony = data.personalTestimony || '';
        break;
      case 5: // Theological Framework
        author.voiceProfile.theologicalFramework = data.theologicalFramework || '';
        break;
      case 6: // Audience & Boundaries
        author.voiceProfile.audienceDescription = data.audienceDescription || '';
        author.voiceProfile.avoidTopics = data.avoidTopics || [];
        break;
      default:
        return Response.json({ error: 'Invalid interview step' }, { status: 400 });
    }

    // Update interview progress
    author.interviewStep = step + 1;
    if (step === 6) {
      author.interviewCompleted = true;
    }

    await author.save();
    return Response.json(author);
  } catch (error) {
    return Response.json({ error: 'Failed to save interview step' }, { status: 500 });
  }
}
