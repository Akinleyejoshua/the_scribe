import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Manuscript from '@/models/Manuscript';

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const authorId = request.nextUrl.searchParams.get('authorId');
    const filter = authorId ? { authorId } : {};
    const manuscripts = await Manuscript.find(filter).sort({ updatedAt: -1 });
    return Response.json(manuscripts);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch manuscripts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const manuscript = await Manuscript.create({
      authorId: body.authorId,
      title: body.title,
      subtitle: body.subtitle || '',
      description: body.description || '',
      targetAudience: body.targetAudience || '',
      bookType: body.bookType || 'teaching',
    });
    return Response.json(manuscript, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create manuscript' }, { status: 500 });
  }
}
