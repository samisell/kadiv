---
## Task ID: 5 - ServicesPage Component Builder
### Work Task
Build the KADIV luxury event management website's Services Page component at `/home/z/my-project/src/components/services/ServicesPage.tsx`.

### Work Summary
Created the complete ServicesPage component with all 4 required sections:

1. **Hero Banner**: Dark gradient background with gold gradient text, "Our Premium Services" headline, decorative accent lines, pill badge with sparkle icons, and trust indicators (2500+ Events, 15 Years Experience, 1800+ Happy Clients).

2. **Services Grid**: Alternating image-left/image-right layout for all 8 services (venue, decoration, catering, pastry, media, music, photography, security). Each service block includes:
   - Service image with Next.js Image (4:3 aspect ratio, hover zoom effect)
   - Service icon overlay badge
   - "Starting from $X,XXX" price badge on image
   - Numbered service heading with gradient divider
   - Large service name (font-display, gold hover effect)
   - Description text
   - Key feature chips (first 3 features shown)
   - "Add to Event Plan" button (gold, hover glow effect)
   - Toast notification on add: "Service added to your event plan!"
   - Checkmark + "Added to Plan" disabled state when service is already in plan

3. **Service Comparison Table**: Styled shadcn/ui Table with gold headers, all 8 services showing icon, name, starting price, key features (first 2), and add-to-plan action button. Responsive design hides price/features columns on smaller screens.

4. **CTA Section**: "Not Sure What You Need?" with Sparkles icon, gold divider, descriptive text, "Open Cost Calculator" button (navigates to 'calculator'), and secondary "Contact Us" button (navigates to 'contact').

**Technical details:**
- `'use client'` directive
- Framer Motion scroll animations via `useInView` + `AnimatedSection` wrapper component
- Icon mapping from string names in SERVICES data to Lucide icon components
- `useEventPlan` store integration with `addService` and plan state checking
- `useNavigation` for CTA navigation to calculator/contact pages
- `toast` from 'sonner' for notifications
- Design tokens: charcoal-dark/charcoal/cream/gold luxury palette, Playfair Display + Inter fonts, luxury-divider, gold-glow, text-gold-gradient CSS classes
- shadcn/ui components: Button, Badge, Table (Table, TableHeader, TableBody, TableHead, TableRow, TableCell)
- Lucide icons: Plus, Check, Sparkles, ArrowRight, MapPin, UtensilsCrossed, Cake, Video, Disc, Camera, Shield, Star, Users, Clock, Award
- ESLint passes with zero errors
