'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera } from 'lucide-react';
import { GALLERY_IMAGES } from '@/data/content';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// ─── Type ───────────────────────────────────────────────────────────────────
type GalleryImage = (typeof GALLERY_IMAGES)[number];

// ─── Aspect ratio rotation for masonry variety ─────────────────────────────
const ASPECT_CLASSES = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-square'] as const;

function getAspectClass(index: number): string {
  return ASPECT_CLASSES[index % ASPECT_CLASSES.length];
}

// ─── Filter button ─────────────────────────────────────────────────────────
function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-5 py-2 rounded-full text-sm font-medium tracking-wide
        transition-all duration-300 whitespace-nowrap cursor-pointer
        ${
          isActive
            ? 'bg-gold text-charcoal-dark shadow-[0_0_20px_rgba(200,164,86,0.3)]'
            : 'bg-charcoal-light text-cream/70 border border-gold/20 hover:border-gold/50 hover:text-cream'
        }
      `}
    >
      {label}
    </button>
  );
}

// ─── Single gallery card ───────────────────────────────────────────────────
function GalleryCard({
  image,
  index,
  onOpen,
}: {
  image: GalleryImage;
  index: number;
  onOpen: (img: GalleryImage) => void;
}) {
  const aspect = getAspectClass(index);

  return (
    <motion.div
      layout
      layoutId={`card-${image.id}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-xl cursor-pointer break-inside-avoid mb-4"
      onClick={() => onOpen(image)}
    >
      {/* Image */}
      <div className={`${aspect} relative overflow-hidden`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/90 via-charcoal-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
          {/* Category badge */}
          <span className="inline-block self-start px-3 py-1 rounded-full bg-gold/90 text-charcoal-dark text-xs font-semibold tracking-wider uppercase mb-2">
            {image.category}
          </span>

          {/* Alt text */}
          <p className="text-cream text-sm font-medium leading-snug mb-3">
            {image.alt}
          </p>

          {/* View icon button */}
          <button className="self-start flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream/10 border border-cream/20 text-cream text-xs font-medium hover:bg-gold/20 hover:border-gold/40 transition-all duration-300 cursor-pointer">
            <ZoomIn className="size-3.5" />
            View
          </button>
        </div>

        {/* Always-visible subtle category indicator */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="size-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Camera className="size-4 text-gold" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Lightbox navigation button ────────────────────────────────────────────
function NavButton({
  direction,
  onClick,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute top-1/2 -translate-y-1/2 z-10 size-12 rounded-full bg-black/50 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-cream hover:bg-gold/20 hover:border-gold/40 transition-all duration-300 cursor-pointer"
      aria-label={direction === 'prev' ? 'Previous image' : 'Next image'}
    >
      <Icon className="size-5" />
    </button>
  );
}

// ─── Main GalleryPage ──────────────────────────────────────────────────────
export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Derive unique categories
  const categories = useMemo(() => {
    const unique = Array.from(new Set(GALLERY_IMAGES.map((img) => img.category)));
    return ['All', ...unique];
  }, []);

  // Filtered images
  const filteredImages = useMemo(() => {
    if (activeFilter === 'All') return GALLERY_IMAGES;
    return GALLERY_IMAGES.filter((img) => img.category === activeFilter);
  }, [activeFilter]);

  // Index of current lightbox image within filtered set
  const lightboxIndex = useMemo(() => {
    if (!lightboxImage) return -1;
    return filteredImages.findIndex((img) => img.id === lightboxImage.id);
  }, [lightboxImage, filteredImages]);

  const hasPrev = lightboxIndex > 0;
  const hasNext = lightboxIndex < filteredImages.length - 1;

  // ── Lightbox actions ────────────────────────────────────────────────────
  const openLightbox = useCallback((img: GalleryImage) => {
    setLightboxImage(img);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    // Delay clearing image so close animation plays
    setTimeout(() => setLightboxImage(null), 300);
  }, []);

  const goPrev = useCallback(() => {
    if (hasPrev) setLightboxImage(filteredImages[lightboxIndex - 1]);
  }, [hasPrev, lightboxIndex, filteredImages]);

  const goNext = useCallback(() => {
    if (hasNext) setLightboxImage(filteredImages[lightboxIndex + 1]);
  }, [hasNext, lightboxIndex, filteredImages]);

  // ── Keyboard navigation ─────────────────────────────────────────────────
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'Escape':
          e.preventDefault();
          closeLightbox();
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goPrev, goNext, closeLightbox]);

  return (
    <div className="min-h-screen">
      {/* ── 1. Hero Banner ───────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            Portfolio
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-gold-gradient">Our Gallery</span>
          </h1>
          <p className="text-cream/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Browse through our portfolio of extraordinary events
          </p>

          {/* Decorative line */}
          <div className="luxury-divider mt-10 max-w-xs mx-auto" />
        </motion.div>
      </section>

      {/* ── 2. Filter Bar ────────────────────────────────────────────────── */}
      <section className="px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <FilterChip
                key={cat}
                label={cat}
                isActive={activeFilter === cat}
                onClick={() => setActiveFilter(cat)}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 3. Image Count ───────────────────────────────────────────────── */}
      <section className="px-6 pb-6">
        <motion.p
          key={activeFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-cream/40 text-sm tracking-wide"
        >
          Showing{' '}
          <span className="text-gold font-semibold">
            {filteredImages.length}
          </span>{' '}
          of{' '}
          <span className="text-cream/60 font-medium">
            {GALLERY_IMAGES.length}
          </span>{' '}
          images
        </motion.p>
      </section>

      {/* ── 4. Masonry Grid ──────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <LayoutGroup>
            <motion.div
              layout
              className="masonry-grid"
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => (
                  <GalleryCard
                    key={image.id}
                    image={image}
                    index={index}
                    onOpen={openLightbox}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>

          {/* Empty state */}
          {filteredImages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Camera className="size-16 text-gold/20 mx-auto mb-4" />
              <p className="text-cream/40 text-lg">No images found for this category</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── 5. Lightbox Dialog ───────────────────────────────────────────── */}
      <Dialog open={lightboxOpen} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent
          showCloseButton={false}
          className="
            sm:max-w-4xl lg:max-w-6xl
            bg-charcoal-dark/95 backdrop-blur-xl
            border border-gold/20
            rounded-2xl
            p-0 overflow-hidden
            [&>button]:hidden
          "
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {/* Hidden accessible titles */}
          <DialogTitle className="sr-only">
            {lightboxImage ? `${lightboxImage.alt} - ${lightboxImage.category}` : 'Gallery Image'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {lightboxImage?.alt ?? 'Viewing gallery image'}
          </DialogDescription>

          <AnimatePresence mode="wait">
            {lightboxImage && (
              <motion.div
                key={lightboxImage.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col"
              >
                {/* Image area */}
                <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
                  <Image
                    src={lightboxImage.src}
                    alt={lightboxImage.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1100px"
                    className="object-contain"
                    priority
                  />

                  {/* Close button */}
                  <button
                    onClick={closeLightbox}
                    className="absolute top-4 right-4 z-10 size-10 rounded-full bg-black/50 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-cream hover:bg-gold/20 hover:border-gold/40 transition-all duration-300 cursor-pointer"
                    aria-label="Close lightbox"
                  >
                    <X className="size-5" />
                  </button>

                  {/* Previous */}
                  <AnimatePresence>
                    {hasPrev && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <NavButton direction="prev" onClick={goPrev} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Next */}
                  <AnimatePresence>
                    {hasNext && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <NavButton direction="next" onClick={goNext} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Info bar */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gold/10">
                  <div>
                    <h3 className="text-cream font-display text-lg font-semibold">
                      {lightboxImage.alt}
                    </h3>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-medium tracking-wider uppercase">
                      {lightboxImage.category}
                    </span>
                  </div>
                  <p className="text-cream/30 text-sm tabular-nums">
                    {lightboxIndex + 1} / {filteredImages.length}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
