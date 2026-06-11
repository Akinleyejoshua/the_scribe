import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import Author from '@/models/Author';
import Manuscript from '@/models/Manuscript';
import { streamChat } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const authorId = request.nextUrl.searchParams.get('authorId');
    const manuscriptId = request.nextUrl.searchParams.get('manuscriptId');

    if (!authorId) {
      return Response.json({ error: 'authorId is required' }, { status: 400 });
    }

    const filter: Record<string, string> = { authorId };
    if (manuscriptId) filter.manuscriptId = manuscriptId;

    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: 1 })
      .limit(50);

    return Response.json(messages);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const { authorId, manuscriptId, messages } = body;

    if (!authorId || !messages || !messages.length) {
      return Response.json({ error: 'authorId and messages are required' }, { status: 400 });
    }

    // Get author for voice context
    const author = await Author.findById(authorId);

    // Get manuscript context if available
    let manuscriptContext = '';
    if (manuscriptId) {
      const manuscript = await Manuscript.findById(manuscriptId);
      if (manuscript) {
        manuscriptContext = `Book: "${manuscript.title}"\nType: ${manuscript.bookType}\nDescription: ${manuscript.description}\nChapters: ${manuscript.chapters.length}`;
      }
    }

    // Save user message to DB
    const lastUserMessage = messages[messages.length - 1];
    await ChatMessage.create({
      authorId,
      manuscriptId: manuscriptId || undefined,
      role: 'user',
      content: lastUserMessage.content,
    });

    // Stream response from Gemini
    const result = await streamChat(
      author ? author.toObject() : null,
      messages,
      manuscriptContext
    );

    // Create a ReadableStream to stream the response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            const text = chunk.text || '';
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }

          // Save assistant message to DB after streaming completes
          await ChatMessage.create({
            authorId,
            manuscriptId: manuscriptId || undefined,
            role: 'assistant',
            content: fullResponse,
          });

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return Response.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
