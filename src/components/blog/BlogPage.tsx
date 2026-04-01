'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BLOG_POSTS } from '@/data/content';
import { useBlogStore } from '@/store/blogStore';
import { useNavigation } from '@/store/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const BLOG_CATEGORIES = ['Weddings', 'Corporate', 'Design', 'Trends', 'Tips', 'Venues'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  const [email, setEmail] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const { navigate } = useNavigation();

  const featuredPost = BLOG_POSTS[0];
  const gridPosts = BLOG_POSTS.slice(1);
  const filteredPosts = activeCategory
    ? gridPosts.filter((post) => post.category === activeCategory)
    : gridPosts;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to subscribe');
      }
      toast.success('Subscribed successfully!', {
        description: 'You will receive our latest event tips and updates.',
      });
      setEmail('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error('Failed to subscribe', { description: message });
    } finally {
      setSubscribing(false);
    }
  };

  const handleLoadMore = () => {
    toast.info('More articles coming soon!', {
      description: 'We are working on exciting new content for you.',
    });
  };

  return (
    <div className="min-h-screen">
      {/* ========== 1. Hero Banner ========== */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium tracking-[0.2em] uppercase text-gold/80">
                Our Blog
              </span>
              <div className="w-12 h-[1px] bg-gold/40" />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gold-gradient mb-6">
              KADIV Journal
            </h1>

            <p className="text-lg md:text-xl text-cream/60 max-w-2xl mx-auto leading-relaxed font-body">
              Event inspiration, trends, and expert tips from the world of luxury celebrations.
            </p>

            <div className="luxury-divider max-w-xs mx-auto mt-10" />
          </motion.div>
        </div>
      </section>

      {/* ========== 2. Featured Post ========== */}
      {featuredPost && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden border-gold/10 bg-charcoal-light/50 hover-lift group">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative overflow-hidden aspect-[16/10] md:aspect-auto">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-charcoal-light/30 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-light/60 to-transparent md:hidden" />
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-gold text-charcoal-dark hover:bg-gold-light border-0 px-3 py-1 text-xs font-semibold">
                      {featuredPost.category}
                    </Badge>
                    <span className="text-xs text-cream/40 tracking-wider uppercase">Featured</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-cream mb-4 leading-tight group-hover:text-gold transition-colors duration-300">
                    {featuredPost.title}
                  </h2>

                  <p className="text-cream/50 text-base md:text-lg leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-cream/40 text-sm mb-8">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredPost.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <Button
                    className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold w-fit group/btn"
                    onClick={() => { useBlogStore.getState().selectPost(featuredPost.id); navigate('blog-detail'); }}
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>
      )}

      {/* ========== 3. Blog Grid ========== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-cream mb-2">Latest Articles</h2>
          <p className="text-cream/50 font-body">Stay informed with our newest insights and stories.</p>
        </motion.div>

        {filteredPosts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPosts.map((post) => (
              <motion.div key={post.id} variants={itemVariants}>
                <Card className="overflow-hidden border-gold/10 bg-charcoal-light/30 hover-lift group h-full flex flex-col">
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/50 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gold text-charcoal-dark hover:bg-gold-light border-0 text-xs font-semibold">
                        {post.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-cream mb-2 leading-snug group-hover:text-gold transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-cream/50 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                      <div className="flex items-center gap-3 text-cream/40 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <button
                        onClick={() => { useBlogStore.getState().selectPost(post.id); navigate('blog-detail'); }}
                        className="text-sm text-cream/50 hover:text-gold transition-colors duration-300 flex items-center gap-1 font-medium"
                      >
                        Read More
                        <ArrowRight className="w-3.5 h-3.5 transition-transform hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gold/30 mx-auto mb-4" />
            <p className="text-cream/50 text-lg">No articles found in this category.</p>
            <button
              onClick={() => setActiveCategory(null)}
              className="text-gold hover:text-gold-light mt-2 text-sm font-medium transition-colors"
            >
              View all articles
            </button>
          </div>
        )}
      </section>

      {/* ========== 5. Categories Section ========== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Tag className="w-5 h-5 text-gold" />
            <h3 className="text-xl font-bold text-cream">Browse by Category</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                activeCategory === null
                  ? 'bg-gold text-charcoal-dark border-gold'
                  : 'bg-transparent text-cream/60 border-gold/20 hover:border-gold/50 hover:text-gold'
              }`}
            >
              All
            </button>
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  activeCategory === category
                    ? 'bg-gold text-charcoal-dark border-gold'
                    : 'bg-transparent text-cream/60 border-gold/20 hover:border-gold/50 hover:text-gold'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== 4. Newsletter Section ========== */}
      <section className="relative py-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark via-charcoal to-charcoal-dark" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/20 mb-6">
              <BookOpen className="w-6 h-6 text-gold" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">
              Subscribe to Our Newsletter
            </h2>

            <p className="text-cream/50 text-base md:text-lg leading-relaxed mb-8 font-body max-w-lg mx-auto">
              Receive exclusive event tips, trend reports, and early access to our latest articles delivered straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 bg-charcoal-light/50 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 focus:ring-gold/20 rounded-lg px-4"
              />
              <Button
                type="submit"
                disabled={subscribing}
                className="h-12 px-6 bg-gold text-charcoal-dark hover:bg-gold-light font-semibold rounded-lg whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {subscribing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>

            <p className="text-cream/30 text-xs mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== 6. Load More ========== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Button
            onClick={handleLoadMore}
            variant="outline"
            size="lg"
            className="border-gold/30 text-gold hover:bg-gold hover:text-charcoal-dark hover:border-gold font-semibold px-8 transition-all duration-300"
          >
            Load More Articles
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}