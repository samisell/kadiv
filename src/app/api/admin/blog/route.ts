import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/blog — List all blog posts
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const posts = await db.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Admin blog error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// POST /api/admin/blog — Create a new blog post
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { title, slug: inputSlug, excerpt, content, image, category, readTime, isPublished } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const slug = inputSlug || generateSlug(title);

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content: content || null,
        image: image || null,
        category: category || null,
        readTime: readTime || null,
        isPublished: isPublished ?? false,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Admin create blog error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

// PUT /api/admin/blog — Update a blog post
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { id, title, slug, excerpt, content, image, category, readTime, isPublished } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const post = await db.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(readTime !== undefined && { readTime }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Admin update blog error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/admin/blog — Delete a blog post
export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete blog error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
