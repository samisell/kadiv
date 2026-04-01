'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { FileText, Plus, Trash2, Edit, Calendar } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  category: string | null;
  readTime: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  isPublished: boolean;
}

const EMPTY_FORM: PostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  category: '',
  readTime: '',
  isPublished: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const CATEGORIES = [
  'Weddings',
  'Corporate Events',
  'Private Parties',
  'Concerts',
  'Festivals',
  'Tips & Planning',
  'Behind the Scenes',
  'Venue Tours',
  'Other',
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blog');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data.posts);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      image: post.image || '',
      category: post.category || '',
      readTime: post.readTime || '',
      isPublished: post.isPublished,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update
        const res = await fetch('/api/admin/blog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        if (!res.ok) throw new Error();
        toast.success('Post updated successfully');
      } else {
        // Create
        const res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success('Post created successfully');
      }
      setDialogOpen(false);
      fetchPosts();
    } catch {
      toast.error(editingId ? 'Failed to update post' : 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Post deleted');
      setDeleteId(null);
      fetchPosts();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const updateField = (field: keyof PostForm, value: string | boolean) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !editingId) {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
  };

  const publishedCount = posts.filter(p => p.isPublished).length;
  const draftCount = posts.filter(p => !p.isPublished).length;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Stats + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold text-gold-gradient">{posts.length}</p>
            <p className="text-xs text-cream/40">Total Posts</p>
          </div>
          <div className="h-8 w-px bg-gold/10" />
          <div>
            <p className="text-2xl font-bold text-green-400">{publishedCount}</p>
            <p className="text-xs text-cream/40">Published</p>
          </div>
          <div className="h-8 w-px bg-gold/10" />
          <div>
            <p className="text-2xl font-bold text-cream/50">{draftCount}</p>
            <p className="text-xs text-cream/40">Drafts</p>
          </div>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gold hover:bg-gold-light text-charcoal-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-charcoal border-gold/10"><CardContent className="p-5"><Skeleton className="h-32 w-full bg-charcoal-light" /></CardContent></Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="w-12 h-12 text-cream/20 mx-auto mb-3" />
          <p className="text-cream/40 text-sm">No blog posts yet</p>
          <Button variant="outline" className="mt-4 border-gold/20 text-gold hover:text-gold-light" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />Create First Post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-charcoal border-gold/10 hover:border-gold/20 transition-all group">
                  {/* Image thumbnail */}
                  {post.image && (
                    <div className="h-32 overflow-hidden rounded-t-lg relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={
                          post.isPublished
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 text-[10px]'
                            : 'bg-charcoal-light text-cream/50 border-charcoal-light text-[10px]'
                        }
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {post.category && (
                        <span className="text-[10px] text-cream/40">{post.category}</span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-cream mb-1 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-cream/40 mb-1 font-mono">/{post.slug}</p>
                    {post.excerpt && (
                      <p className="text-xs text-cream/50 line-clamp-2 mb-3">{post.excerpt}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gold/5">
                      <div className="flex items-center gap-1.5 text-[11px] text-cream/40">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(post.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-cream/40 hover:text-gold"
                          onClick={() => openEditDialog(post)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-cream/40 hover:text-red-400"
                          onClick={() => setDeleteId(post.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gold font-display text-xl">
              {editingId ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Title *</Label>
              <Input
                className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30"
                placeholder="Enter post title..."
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Slug *</Label>
              <Input
                className="bg-charcoal-light border-gold/10 text-cream/70 placeholder:text-cream/30 font-mono text-sm"
                placeholder="post-url-slug"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
              />
              {!editingId && (
                <p className="text-[10px] text-cream/30">Auto-generated from title. You can edit manually.</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
                <SelectTrigger className="bg-charcoal-light border-gold/10 text-cream">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-gold/20">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-cream focus:bg-gold/10 focus:text-gold">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Image URL</Label>
              <Input
                className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30"
                placeholder="https://..."
                value={form.image}
                onChange={(e) => updateField('image', e.target.value)}
              />
              {form.image && (
                <div className="mt-2 h-24 rounded-lg overflow-hidden border border-gold/10">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>

            {/* Read Time */}
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Read Time</Label>
              <Input
                className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30"
                placeholder="e.g., 5 min read"
                value={form.readTime}
                onChange={(e) => updateField('readTime', e.target.value)}
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Excerpt</Label>
              <Textarea
                className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 resize-none"
                placeholder="Brief summary of the post..."
                rows={3}
                value={form.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Content</Label>
              <Textarea
                className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 resize-none"
                placeholder="Full post content (supports markdown)..."
                rows={8}
                value={form.content}
                onChange={(e) => updateField('content', e.target.value)}
              />
            </div>

            {/* Published toggle */}
            <div className="flex items-center justify-between p-3 bg-charcoal-light rounded-lg">
              <div>
                <p className="text-sm text-cream">Published</p>
                <p className="text-[11px] text-cream/40">Make this post visible on the blog</p>
              </div>
              <Switch
                checked={form.isPublished}
                onCheckedChange={(checked) => updateField('isPublished', checked)}
                className="data-[state=checked]:bg-gold"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gold hover:bg-gold-light text-charcoal-dark min-w-[120px]"
            >
              {saving ? 'Saving...' : editingId ? 'Update Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cream">Delete Post</DialogTitle>
            <p className="text-cream/50 text-sm mt-2">Are you sure you want to delete this blog post? This action cannot be undone.</p>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && deletePost(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
