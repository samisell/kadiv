'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { BLOG_POSTS } from '@/data/content';
import { useBlogStore } from '@/store/blogStore';
import { useNavigation } from '@/store/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeInOut" },
  }),
};

export default function BlogDetailPage() {
  const { selectedPostId } = useBlogStore();
  const { navigate } = useNavigation();

  const post = BLOG_POSTS.find((p) => p.id === selectedPostId);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-dark px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="block w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <span className="block w-1.5 h-1.5 rotate-45 border border-gold/40" />
            <span className="block w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 border border-gold/20 mb-6">
            <AlertTriangle className="w-10 h-10 text-gold" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-cream mb-3 font-display">
            Article Not <span className="text-gold">Found</span>
          </h1>
          <p className="text-cream/50 text-base leading-relaxed mb-8 font-body">
            The article you are looking for does not exist or may have been removed.
          </p>

          <Button
            onClick={() => navigate('blog')}
            className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-6 h-11 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="block w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <span className="block w-1.5 h-1.5 rotate-45 border border-gold/40" />
            <span className="block w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ========== Hero Image ========== */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden"
      >
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/60 to-transparent h-32" />

        {/* Back button overlay */}
        <div className="absolute top-24 left-4 sm:left-6 lg:left-8 z-10">
          <button
            onClick={() => navigate('blog')}
            className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors duration-300 text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Blog
          </button>
        </div>
      </motion.section>

      {/* ========== Article Content ========== */}
      <article className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40 pb-20">
        {/* Meta badges */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          <Badge className="bg-gold text-charcoal-dark hover:bg-gold-light border-0 px-3 py-1 text-xs font-semibold">
            {post.category}
          </Badge>
          <span className="flex items-center gap-1.5 text-cream/40 text-sm">
            <Calendar className="w-4 h-4" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5 text-cream/40 text-sm">
            <Clock className="w-4 h-4" />
            {post.readTime}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-cream leading-tight mb-8 font-display"
        >
          {post.title}
        </motion.h1>

        {/* Divider */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="luxury-divider mb-10"
        />

        {/* Content paragraphs */}
        <div className="space-y-6">
          {post.content.map((paragraph, index) => (
            <motion.p
              key={index}
              custom={index + 3}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-cream/70 text-base md:text-lg leading-relaxed font-body"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        {/* Divider before share section */}
        <div className="luxury-divider my-12" />

        {/* ========== Social Share Section ========== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-bold text-cream font-display">Share This Article</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-charcoal-light/50 border border-gold/10 text-cream/60 hover:text-cream hover:border-gold/30 transition-all duration-300 text-sm font-medium"
              aria-label="Share on Facebook"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-charcoal-light/50 border border-gold/10 text-cream/60 hover:text-cream hover:border-gold/30 transition-all duration-300 text-sm font-medium"
              aria-label="Share on Twitter"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-charcoal-light/50 border border-gold/10 text-cream/60 hover:text-cream hover:border-gold/30 transition-all duration-300 text-sm font-medium"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-charcoal-light/50 border border-gold/10 text-cream/60 hover:text-cream hover:border-gold/30 transition-all duration-300 text-sm font-medium"
              aria-label="Copy link"
            >
              <Link2 className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </motion.section>

        {/* ========== Back to Blog CTA ========== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mt-16 p-8 rounded-2xl bg-charcoal-light/30 border border-gold/10 text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/20 mb-4">
            <CheckCircle className="w-6 h-6 text-gold" />
          </div>
          <h3 className="text-xl font-bold text-cream mb-2 font-display">
            Enjoyed This Article?
          </h3>
          <p className="text-cream/50 text-sm mb-6 font-body max-w-md mx-auto">
            Explore more insights, trends, and expert tips from the world of luxury celebrations in our journal.
          </p>
          <Button
            onClick={() => navigate('blog')}
            className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-6 h-11 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </motion.section>
      </article>
    </div>
  );
}