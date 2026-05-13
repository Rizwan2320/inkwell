import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/track - Track a post visit and reading time
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, readMs } = body;

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment views by 1 and add reading time
    const updated = await db.post.update({
      where: { id: postId },
      data: {
        views: { increment: 1 },
        ...(readMs && readMs > 0 ? { totalReadMs: { increment: readMs } } : {}),
      },
    });

    return NextResponse.json({
      views: updated.views,
      avgReadTime: updated.views > 0 ? Math.round(updated.totalReadMs / updated.views / 1000) : 0,
    });
  } catch (error) {
    console.error('Error tracking visit:', error);
    return NextResponse.json({ error: 'Failed to track visit' }, { status: 500 });
  }
}
