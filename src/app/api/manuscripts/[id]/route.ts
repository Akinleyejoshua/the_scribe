import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Manuscript from '@/models/Manuscript';

export async function GET(
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
    return Response.json(manuscript);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch manuscript' }, { status: 500 });
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
    const manuscript = await Manuscript.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!manuscript) {
      return Response.json({ error: 'Manuscript not found' }, { status: 404 });
    }
    return Response.json(manuscript);
  } catch (error) {
    return Response.json({ error: 'Failed to update manuscript' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const manuscript = await Manuscript.findByIdAndDelete(id);
    if (!manuscript) {
      return Response.json({ error: 'Manuscript not found' }, { status: 404 });
    }
    return Response.json({ message: 'Manuscript deleted' });
  } catch (error) {
    return Response.json({ error: 'Failed to delete manuscript' }, { status: 500 });
  }
}
