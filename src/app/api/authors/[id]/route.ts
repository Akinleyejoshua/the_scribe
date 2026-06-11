import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Author from '@/models/Author';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const author = await Author.findById(id);
    if (!author) {
      return Response.json({ error: 'Author not found' }, { status: 404 });
    }
    return Response.json(author);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch author' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await request.json();
    const author = await Author.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!author) {
      return Response.json({ error: 'Author not found' }, { status: 404 });
    }
    return Response.json(author);
  } catch (error) {
    return Response.json({ error: 'Failed to update author' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const author = await Author.findByIdAndDelete(id);
    if (!author) {
      return Response.json({ error: 'Author not found' }, { status: 404 });
    }
    return Response.json({ message: 'Author deleted' });
  } catch (error) {
    return Response.json({ error: 'Failed to delete author' }, { status: 500 });
  }
}
