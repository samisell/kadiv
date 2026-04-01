import { authenticateRequest } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  readTime: z.string().optional(),
  isPublished: z.boolean().optional(),
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/admin/blog/[id] — Update a blog post
export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateBlogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 },
      );
    }

    const { title, slug: providedSlug, excerpt, content, image, category, readTime, isPublished } = parsed.data;

    // If title changed but no slug provided, auto-generate slug
    let slug = providedSlug;
    if (title && !providedSlug) {
      slug = generateSlug(title);
    }

    // Check for duplicate slug if slug is being changed
    if (slug && slug !== existing.slug) {
      const slugExists = await db.blogPost.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: 'A blog post with this slug already exists' },
          { status: 400 },
        );
      }
    }

    const post = await db.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(readTime !== undefined ? { readTime } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Admin update blog post error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/blog/[id] — Delete a blog post
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await context.params;

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 },
      );
    }

    await db.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Admin delete blog post error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 },
    );
  }
}
