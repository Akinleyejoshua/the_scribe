import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Author from '@/models/Author';

export async function GET() {
  await dbConnect();
  try {
    const authors = await Author.find({}).sort({ updatedAt: -1 });
    return Response.json(authors);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const author = await Author.create({
      name: body.name,
      ministry: body.ministry || '',
      theologicalStream: body.theologicalStream || '',
    });
    return Response.json(author, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create author' }, { status: 500 });
  }
}
