import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// GET /api/admin/seed — Create admin user and sample data (dev only)
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // 1) Create admin user
    const existingAdmin = await db.user.findUnique({ where: { email: 'admin@kadiv.com' } });
    let admin;
    if (!existingAdmin) {
      admin = await db.user.create({
        data: {
          email: 'admin@kadiv.com',
          name: 'KADIV Admin',
          password: await bcrypt.hash('admin123', 12),
          phone: '+234 (1) 234-5678',
          role: 'admin',
        },
      });
    } else {
      admin = existingAdmin;
    }

    // 2) Create sample client users
    const clientEmails = [
      { name: 'Sarah Mitchell', email: 'sarah@example.com' },
      { name: 'David Chen', email: 'david@example.com' },
      { name: 'Amara Johnson', email: 'amara@example.com' },
      { name: 'Robert Park', email: 'robert@example.com' },
      { name: 'Lisa Torres', email: 'lisa@example.com' },
    ];

    const clients: { id: string; name: string; email: string }[] = [];

    for (const c of clientEmails) {
      const existing = await db.user.findUnique({ where: { email: c.email } });
      if (!existing) {
        const user = await db.user.create({
          data: {
            email: c.email,
            name: c.name,
            password: await bcrypt.hash('password123', 12),
            role: 'client',
          },
        });
        clients.push({ id: user.id, name: user.name!, email: user.email });
      } else {
        clients.push({ id: existing.id, name: existing.name!, email: existing.email });
      }
    }

    // 3) Create sample bookings
    const bookingData = [
      { userId: clients[0]?.id, eventType: 'Wedding', eventName: 'Mitchell Wedding Reception', guestCount: 250, eventDate: '2025-08-15', venueType: 'ballroom', cateringPackage: 'luxury', totalCost: 18500000, status: 'confirmed', location: 'Lekki Phase 1' },
      { userId: clients[1]?.id, eventType: 'Corporate', eventName: 'Aqua Corp Annual Gala', guestCount: 150, eventDate: '2025-09-22', venueType: 'rooftop', cateringPackage: 'premium', totalCost: 9800000, status: 'pending', location: 'Victoria Island (VI)' },
      { userId: clients[2]?.id, eventType: 'Private Party', eventName: "Sophia's 30th Birthday", guestCount: 80, eventDate: '2025-03-08', venueType: 'garden', cateringPackage: 'premium', totalCost: 4200000, status: 'completed', location: 'Ikoyi' },
      { userId: clients[3]?.id, eventType: 'Concert', eventName: 'Laurent Charity Concert', guestCount: 500, eventDate: '2025-10-10', venueType: 'indoor-hall', cateringPackage: 'basic', totalCost: 15000000, status: 'confirmed', location: 'Mainland' },
      { userId: clients[4]?.id, eventType: 'Birthday', eventName: "Ethan's Surprise 40th", guestCount: 60, eventDate: '2025-07-20', venueType: 'rooftop', cateringPackage: 'luxury', totalCost: 7500000, status: 'pending', location: 'Lekki' },
      { userId: clients[0]?.id, eventType: 'Corporate', eventName: 'Tech Summit 2025', guestCount: 300, eventDate: '2025-11-05', venueType: 'ballroom', cateringPackage: 'platinum', totalCost: 35000000, status: 'pending', location: 'Victoria Island (VI)' },
    ];

    for (const b of bookingData) {
      if (!b.userId) continue;
      const exists = await db.booking.findFirst({ where: { eventName: b.eventName } });
      if (!exists) {
        await db.booking.create({
          data: {
            userId: b.userId,
            eventType: b.eventType,
            eventName: b.eventName,
            guestCount: b.guestCount,
            eventDate: new Date(b.eventDate),
            venueType: b.venueType,
            cateringPackage: b.cateringPackage,
            services: JSON.stringify([]),
            location: b.location,
            totalCost: b.totalCost,
            status: b.status,
          },
        });
      }
    }

    // 4) Create sample payments
    const allBookings = await db.booking.findMany({ take: 4 });
    for (const booking of allBookings) {
      const existingPayment = await db.payment.findFirst({ where: { bookingId: booking.id } });
      if (!existingPayment) {
        const isPaid = booking.status === 'confirmed' || booking.status === 'completed';
        await db.payment.create({
          data: {
            userId: booking.userId,
            bookingId: booking.id,
            amount: booking.totalCost * 0.5,
            method: 'credit_card',
            status: isPaid ? 'paid' : 'pending',
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          },
        });
      }
    }

    // 5) Create sample contact messages
    const messages = [
      { name: 'Jennifer Lee', email: 'jennifer@corp.com', phone: '+1 555-0101', eventType: 'Corporate', message: 'We are planning our annual company retreat for 200 employees. Can you provide a quote for a 3-day event?' },
      { name: 'Michael Brown', email: 'michael@email.com', phone: '+1 555-0202', eventType: 'Wedding', message: 'My fiancee and I are looking for a luxury wedding venue. We expect about 300 guests and want the full premium package.' },
      { name: 'Emma Wilson', email: 'emma@startup.io', eventType: 'Corporate', message: 'Need a venue for a product launch event next quarter. Approximately 100 attendees, tech-themed.' },
      { name: 'Carlos Rivera', email: 'carlos@email.com', eventType: 'Birthday', message: 'Planning a surprise 50th birthday party for my mother. Around 75 guests. Latin-themed.' },
    ];

    for (const m of messages) {
      const exists = await db.contactMessage.findFirst({ where: { email: m.email } });
      if (!exists) {
        await db.contactMessage.create({ data: m });
      }
    }

    // 6) Create sample newsletter subscribers
    const subs = ['newsletter@fan.com', 'events@lovers.com', 'party@planner.com'];
    for (const email of subs) {
      await db.newsletter.upsert({ where: { email }, update: {}, create: { email } });
    }

    // 7) Seed default site settings and configurable data
    const defaultSettings: Record<string, string> = {
      companyName: 'KADIV',
      companyEmail: 'info@kadiv.com',
      companyPhone: '+234 (1) 234-5678',
      companyAddress: 'Plot 12, Victoria Island, Lagos, Nigeria',
      currencyRate: '1550',

      // ── Event Types ──
      event_types_data: JSON.stringify([
        { id: 'weddings', name: 'Weddings', description: 'Create your dream wedding with our full-service planning, from ceremony to reception.', icon: 'Heart', image: '/images/hero-wedding.png' },
        { id: 'corporate', name: 'Corporate Events', description: 'Elevate your brand with professionally organized conferences, galas, and team events.', icon: 'Briefcase', image: '/images/hero-corporate.png' },
        { id: 'birthdays', name: 'Birthdays', description: 'Celebrate milestones with unforgettable themed parties and luxury experiences.', icon: 'Cake', image: '/images/hero-birthday.png' },
        { id: 'concerts', name: 'Concerts', description: 'World-class entertainment events with professional staging and sound.', icon: 'Music', image: '/images/concert-venue.png' },
        { id: 'private-parties', name: 'Private Parties', description: 'Exclusive soirées and intimate gatherings crafted to perfection.', icon: 'GlassWater', image: '/images/private-party.png' },
        { id: 'religious', name: 'Religious Events', description: 'Respectful and beautiful ceremonies honoring your faith and traditions.', icon: 'Church', image: '/images/religious-event.png' },
        { id: 'galas', name: 'Galas & Awards', description: 'Prestigious gala nights and award ceremonies.', icon: 'Award', image: '' },
        { id: 'exhibitions', name: 'Exhibitions & Trade Shows', description: 'Professional exhibition booth setup and management.', icon: 'Presentation', image: '' },
        { id: 'baby-shower', name: 'Baby Showers', description: 'Beautiful baby shower celebrations with elegant themes.', icon: 'Baby', image: '' },
        { id: 'engagement', name: 'Engagement Parties', description: 'Memorable engagement celebrations.', icon: 'Gem', image: '' },
        { id: 'graduation', name: 'Graduation Parties', description: 'Celebrate academic achievements in style.', icon: 'GraduationCap', image: '' },
        { id: 'housewarming', name: 'Housewarming', description: 'Housewarming parties with perfect ambiance.', icon: 'Home', image: '' },
      ]),

      // ── Venues ──
      venues_data: JSON.stringify([
        { id: 'ballroom', name: 'Grand Ballroom', description: 'Elegant indoor ballroom for up to 500 guests', price: 2000000 },
        { id: 'garden', name: 'Garden Pavilion', description: 'Beautiful outdoor garden setting', price: 1500000 },
        { id: 'beach', name: 'Beach Front', description: 'Stunning beachfront venue', price: 5000000 },
        { id: 'rooftop', name: 'Rooftop Terrace', description: 'Panoramic city views from above', price: 3000000 },
        { id: 'indoor-hall', name: 'Indoor Hall', description: 'Classic indoor hall venue', price: 1000000 },
        { id: 'marquee', name: 'Luxury Marquee', description: 'Customizable marquee tent venue', price: 2500000 },
        { id: 'yacht', name: 'Private Yacht', description: 'Exclusive yacht venue for intimate events', price: 8000000 },
        { id: 'vineyard', name: 'Vineyard Estate', description: 'Picturesque vineyard setting', price: 4500000 },
      ]),

      // ── Catering Packages ──
      catering_data: JSON.stringify([
        { id: 'basic', name: 'Basic', description: 'Standard buffet with local dishes', pricePerGuest: 7500 },
        { id: 'premium', name: 'Premium', description: 'Enhanced menu with continental options', pricePerGuest: 15000 },
        { id: 'luxury', name: 'Luxury', description: 'Full-course fine dining experience', pricePerGuest: 30000 },
        { id: 'platinum', name: 'Platinum', description: 'World-class cuisine with VIP service', pricePerGuest: 50000 },
        { id: 'royal', name: 'Royal', description: 'Bespoke menu by celebrity chefs', pricePerGuest: 75000 },
      ]),

      // ── Add-Ons ──
      addons_data: JSON.stringify([
        { id: 'photography', name: 'Photography Package', description: 'Professional photographer for the event', price: 500000 },
        { id: 'videography', name: 'Videography Package', description: 'Professional video coverage', price: 750000 },
        { id: 'live-band', name: 'Live Band', description: 'Live musical performance', price: 800000 },
        { id: 'dj', name: 'DJ Services', description: 'Professional DJ with sound system', price: 350000 },
        { id: 'flowers', name: 'Floral Arrangements', description: 'Custom floral decorations', price: 300000 },
        { id: 'lighting', name: 'Special Lighting', description: 'Ambient and special effects lighting', price: 400000 },
        { id: 'fireworks', name: 'Fireworks Display', description: 'Professional fireworks show', price: 1500000 },
        { id: 'valet', name: 'Valet Parking', description: 'Valet parking service for guests', price: 200000 },
        { id: 'shuttle', name: 'Shuttle Service', description: 'Guest transportation/shuttle', price: 350000 },
        { id: 'mc', name: 'MC/Host', description: 'Professional event MC', price: 250000 },
        { id: 'red-carpet', name: 'Red Carpet', description: 'Red carpet entrance setup', price: 180000 },
        { id: 'photo-booth', name: 'Photo Booth', description: 'Instant photo booth with props', price: 200000 },
      ]),

      // ── Locations ──
      locations_data: JSON.stringify([
        { id: 'lagos', name: 'Lagos', locations: [
          { id: 'l1', value: 'lagos-vi', label: 'Victoria Island (VI)' },
          { id: 'l2', value: 'lagos-lekki', label: 'Lekki' },
          { id: 'l3', value: 'lagos-lekki-phase1', label: 'Lekki Phase 1' },
          { id: 'l4', value: 'lagos-ajah', label: 'Ajah' },
          { id: 'l5', value: 'lagos-ikeja', label: 'Ikeja' },
          { id: 'l6', value: 'lagos-mainland', label: 'Mainland' },
          { id: 'l7', value: 'lagos-surulere', label: 'Surulere' },
          { id: 'l8', value: 'lagos-yaba', label: 'Yaba' },
          { id: 'l9', value: 'lagos-banana-island', label: 'Banana Island' },
          { id: 'l10', value: 'lagos-ikoyi', label: 'Ikoyi' },
        ]},
        { id: 'other-cities', name: 'Other Cities', locations: [
          { id: 'o1', value: 'abuja', label: 'Abuja (FCT)' },
          { id: 'o2', value: 'port-harcourt', label: 'Port Harcourt' },
          { id: 'o3', value: 'ibadan', label: 'Ibadan' },
          { id: 'o4', value: 'enugu', label: 'Enugu' },
          { id: 'o5', value: 'benin', label: 'Benin City' },
          { id: 'o6', value: 'calabar', label: 'Calabar' },
          { id: 'o7', value: 'owerri', label: 'Owerri' },
          { id: 'o8', value: 'uyo', label: 'Uyo' },
          { id: 'o9', value: 'asaba', label: 'Asaba' },
          { id: 'o10', value: 'aba', label: 'Aba' },
        ]},
      ]),

      // ── Services ──
      services_data: JSON.stringify([
        { id: 'venue', name: 'Event Venue', description: 'Access to the most prestigious venues — from grand ballrooms to enchanting gardens and rooftop terraces.', startingPrice: 1500000, icon: 'MapPin', image: '/images/service-venue.png' },
        { id: 'decoration', name: 'Decoration', description: 'Breathtaking floral arrangements, elegant draping, custom centerpieces, and immersive themed environments.', startingPrice: 800000, icon: 'Sparkles', image: '/images/service-decoration.png' },
        { id: 'catering', name: 'Food & Catering', description: 'Exquisite cuisine crafted by world-class chefs. From canapés to multi-course galas, we cater to every palate.', startingPrice: 1200000, icon: 'UtensilsCrossed', image: '/images/service-catering.png' },
        { id: 'pastry', name: 'Pastry & Cakes', description: 'Custom-designed wedding cakes, dessert tables, and artisan pastries that are as beautiful as they are delicious.', startingPrice: 250000, icon: 'Cake', image: '/images/service-cake.png' },
        { id: 'media', name: 'Media Coverage', description: 'Professional videography and live streaming to capture and broadcast your event to the world.', startingPrice: 1000000, icon: 'Video', image: '/images/service-media.png' },
        { id: 'music', name: 'Music & DJ', description: 'From live bands to celebrity DJs, we curate the perfect soundtrack for your celebration.', startingPrice: 600000, icon: 'Disc', image: '/images/service-music.png' },
        { id: 'photography', name: 'Photography & Videography', description: 'Award-winning photographers and cinematographers who capture every precious moment.', startingPrice: 900000, icon: 'Camera', image: '/images/service-photo.png' },
        { id: 'security', name: 'Security', description: 'Discreet, professional security personnel to ensure the safety and privacy of your guests.', startingPrice: 400000, icon: 'Shield', image: '/images/service-security.png' },
      ]),
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await db.siteConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    // 8) Stats
    const [totalUsers, totalBookings, totalMessages, totalPayments, totalRevenue] = await Promise.all([
      db.user.count(),
      db.booking.count(),
      db.contactMessage.count({ where: { isRead: false } }),
      db.payment.count({ where: { status: 'paid' } }),
      db.payment.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
    ]);

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, role: admin.role },
      stats: {
        totalUsers,
        totalBookings,
        unreadMessages: totalMessages,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      seeded: true,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
