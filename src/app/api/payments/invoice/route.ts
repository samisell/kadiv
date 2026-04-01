import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-helper';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/lib/env';

// GET /api/payments/invoice?bookingId=xxx — Generate HTML invoice for a booking
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('bookingId');

  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId query parameter is required' }, { status: 400 });
  }

  try {
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        // Owner or admin can view
        ...(auth.payload.role !== 'admin' ? { userId: auth.payload.userId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Parse services and add-ons JSON
    let services: Array<{ name: string; price: number; quantity?: number }> = [];
    let addOns: Array<{ name: string; price: number; quantity?: number }> = [];

    try {
      services = JSON.parse(booking.services);
    } catch { /* services stays empty */ }

    try {
      if (booking.addOns) {
        addOns = JSON.parse(booking.addOns);
      }
    } catch { /* addOns stays empty */ }

    const servicesSubtotal = services.reduce((sum, s) => sum + (s.price * (s.quantity || 1)), 0);
    const addOnsSubtotal = addOns.reduce((sum, a) => sum + (a.price * (a.quantity || 1)), 0);
    const subtotal = servicesSubtotal + addOnsSubtotal;
    const serviceFee = Math.round(booking.totalCost - subtotal);
    const totalPaid = booking.payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = Number(booking.totalCost) - totalPaid;

    const invoiceRef = `KAD-${booking.id.substring(0, 8).toUpperCase()}`;
    const invoiceDate = new Date(booking.createdAt).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const statusColors: Record<string, string> = {
      pending: '#EAB308',
      confirmed: '#22C55E',
      completed: '#3B82F6',
      cancelled: '#EF4444',
    };
    const statusColor = statusColors[booking.status] || '#9CA3AF';

    const fmtNaira = (n: number) =>
      `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    const html = generateInvoiceHTML({
      invoiceRef,
      invoiceDate,
      client: booking.user,
      event: {
        name: booking.eventName,
        type: booking.eventType,
        date: booking.eventDate
          ? new Date(booking.eventDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
          : 'TBD',
        location: booking.location || 'TBD',
        venueType: booking.venueType || '-',
        cateringPackage: booking.cateringPackage || '-',
        guestCount: booking.guestCount,
      },
      services,
      addOns,
      subtotal,
      serviceFee,
      total: Number(booking.totalCost),
      totalPaid,
      balance,
      status: booking.status,
      statusColor,
      payments: booking.payments.map((p) => ({
        id: p.id.substring(0, 8).toUpperCase(),
        amount: Number(p.amount),
        method: p.method.replace(/_/g, ' '),
        gateway: p.gateway,
        status: p.status,
        date: new Date(p.createdAt).toLocaleDateString('en-NG', {
          year: 'numeric', month: 'short', day: 'numeric',
        }),
        transactionId: p.transactionId || p.reference || '-',
      })),
      companyInfo: {
        name: 'KADIV Events',
        email: publicEnv.companyEmail,
        phone: publicEnv.companyPhone,
        address: publicEnv.companyAddress,
      },
      notes: booking.notes,
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${invoiceRef}.html"`,
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}

// ─── Invoice HTML Template ──────────────────────────────────────────────────

interface InvoiceData {
  invoiceRef: string;
  invoiceDate: string;
  client: { name: string | null; email: string; phone: string | null };
  event: {
    name: string;
    type: string;
    date: string;
    location: string;
    venueType: string;
    cateringPackage: string;
    guestCount: number;
  };
  services: Array<{ name: string; price: number; quantity?: number }>;
  addOns: Array<{ name: string; price: number; quantity?: number }>;
  subtotal: number;
  serviceFee: number;
  total: number;
  totalPaid: number;
  balance: number;
  status: string;
  statusColor: string;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    gateway: string;
    status: string;
    date: string;
    transactionId: string;
  }>;
  companyInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  notes: string | null;
}

function generateInvoiceHTML(data: InvoiceData): string {
  const fmt = (n: number) =>
    `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const servicesRows = data.services.map((s) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;">${s.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;text-align:center;">${s.quantity || 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;text-align:right;">${fmt(s.price)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;text-align:right;font-weight:600;">${fmt(s.price * (s.quantity || 1))}</td>
    </tr>`).join('');

  const addOnsRows = data.addOns.map((a) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;">${a.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;text-align:center;">${a.quantity || 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;text-align:right;">${fmt(a.price)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;text-align:right;font-weight:600;">${fmt(a.price * (a.quantity || 1))}</td>
    </tr>`).join('');

  const paymentsRows = data.payments.map((p) => {
    const pStatusColor = p.status === 'paid' ? '#22C55E' : p.status === 'pending' ? '#EAB308' : p.status === 'failed' ? '#EF4444' : '#3B82F6';
    return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;">${p.id}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;text-align:right;">${fmt(p.amount)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;">${p.method.charAt(0).toUpperCase() + p.method.slice(1)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ebe0;"><span style="color:${pStatusColor};font-weight:600;text-transform:capitalize;">${p.status}</span></td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ebe0;color:#44403c;">${p.date}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${data.invoiceRef} — ${data.companyInfo.name}</title>
<style>
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #faf7f2; color: #1c1917; }
  .container { max-width: 800px; margin: 0 auto; padding: 24px; }
  @media print { .container { padding: 0; } }

  .invoice-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04);
    overflow: hidden;
  }

  /* Header */
  .header {
    background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
    color: #fff;
    padding: 32px 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .logo { font-size: 28px; font-weight: 800; letter-spacing: 3px; color: #C8A456; }
  .logo-sub { font-size: 11px; color: #a8a29e; letter-spacing: 1px; margin-top: 4px; }
  .invoice-badge {
    text-align: right;
  }
  .invoice-badge h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #a8a29e; margin-bottom: 4px; }
  .invoice-badge .ref { font-size: 22px; font-weight: 700; color: #C8A456; }
  .invoice-badge .date { font-size: 12px; color: #a8a29e; margin-top: 2px; }
  .invoice-badge .status {
    display: inline-block; margin-top: 8px; padding: 4px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
    background: ${data.statusColor}22; color: ${data.statusColor};
  }

  /* Body */
  .body { padding: 32px 40px; }

  .parties { display: flex; gap: 40px; margin-bottom: 32px; }
  @media (max-width: 600px) { .parties { flex-direction: column; gap: 20px; } }
  .party h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #a8a29e; margin-bottom: 8px; }
  .party .name { font-size: 16px; font-weight: 700; color: #1c1917; }
  .party .detail { font-size: 13px; color: #78716c; margin-top: 2px; }

  /* Event Details */
  .event-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    background: #faf7f2;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 28px;
  }
  .event-detail .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #a8a29e; margin-bottom: 4px; }
  .event-detail .value { font-size: 14px; font-weight: 600; color: #1c1917; }

  /* Tables */
  .section-title {
    font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;
    color: #1c1917; margin-bottom: 12px; padding-bottom: 8px;
    border-bottom: 2px solid #C8A456;
  }

  table { width: 100%; border-collapse: collapse; }
  thead th {
    padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase;
    letter-spacing: 1.5px; color: #78716c; border-bottom: 2px solid #e7e5e4; background: #faf7f2;
  }
  thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }

  /* Totals */
  .totals {
    margin-top: 16px;
    padding: 16px 20px;
    background: #faf7f2;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .totals-row {
    display: flex; align-items: center; gap: 24px;
    font-size: 14px; color: #78716c; padding: 4px 0;
  }
  .totals-row.total {
    font-size: 20px; font-weight: 800; color: #1c1917;
    border-top: 2px solid #C8A456; padding-top: 10px; margin-top: 6px;
  }
  .totals-row .label { min-width: 120px; }
  .totals-row .value { min-width: 140px; text-align: right; font-weight: 600; }

  /* Payments */
  .payments-section { margin-top: 32px; }
  .payment-summary {
    display: flex; gap: 20px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .payment-summary-item {
    padding: 12px 20px; border-radius: 10px; flex: 1; min-width: 150px;
  }
  .payment-summary-item .ps-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #a8a29e; }
  .payment-summary-item .ps-value { font-size: 18px; font-weight: 700; margin-top: 4px; }

  /* Footer */
  .footer {
    margin-top: 40px;
    padding: 24px 40px;
    border-top: 1px solid #e7e5e4;
    text-align: center;
  }
  .footer p { font-size: 12px; color: #a8a29e; }
  .footer .company { color: #1c1917; font-weight: 700; }
  .footer .bank-info {
    margin-top: 12px;
    padding-top: 16px;
    border-top: 1px solid #f0ebe0;
    text-align: left;
  }
  .footer .bank-info h4 {
    font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;
    color: #78716c; margin-bottom: 6px;
  }
  .footer .bank-info p { font-size: 13px; color: #44403c; margin-bottom: 2px; }

  .print-btn {
    position: fixed; bottom: 24px; right: 24px; background: #C8A456; color: #1c1917;
    border: none; padding: 12px 24px; border-radius: 12px; font-size: 14px;
    font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(200,164,86,0.4);
    display: flex; align-items: center; gap: 8px; transition: all 0.2s;
  }
  .print-btn:hover { background: #d4b06a; transform: translateY(-1px); }

  .notes-section {
    margin-top: 24px; padding: 16px 20px; background: #faf7f2;
    border-radius: 12px; border-left: 4px solid #C8A456;
  }
  .notes-section h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #a8a29e; margin-bottom: 6px; }
  .notes-section p { font-size: 13px; color: #78716c; line-height: 1.6; }
</style>
</head>
<body>
<div class="container">
  <div class="invoice-card">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="logo">KADIV</div>
        <div class="logo-sub">PREMIUM EVENTS</div>
      </div>
      <div class="invoice-badge">
        <h2>Invoice</h2>
        <div class="ref">${data.invoiceRef}</div>
        <div class="date">Issued ${data.invoiceDate}</div>
        <div class="status">${data.status}</div>
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <!-- From / To -->
      <div class="parties">
        <div class="party">
          <h3>From</h3>
          <div class="name">${data.companyInfo.name}</div>
          <div class="detail">${data.companyInfo.address}</div>
          <div class="detail">${data.companyInfo.email}</div>
          <div class="detail">${data.companyInfo.phone}</div>
        </div>
        <div class="party">
          <h3>Bill To</h3>
          <div class="name">${data.client.name || 'Valued Client'}</div>
          <div class="detail">${data.client.email}</div>
          ${data.client.phone ? `<div class="detail">${data.client.phone}</div>` : ''}
        </div>
      </div>

      <!-- Event Details -->
      <div class="event-details">
        <div class="event-detail">
          <div class="label">Event</div>
          <div class="value">${data.event.name}</div>
        </div>
        <div class="event-detail">
          <div class="label">Type</div>
          <div class="value">${data.event.type}</div>
        </div>
        <div class="event-detail">
          <div class="label">Date</div>
          <div class="value">${data.event.date}</div>
        </div>
        <div class="event-detail">
          <div class="label">Guests</div>
          <div class="value">${data.event.guestCount}</div>
        </div>
        <div class="event-detail">
          <div class="label">Location</div>
          <div class="value">${data.event.location}</div>
        </div>
        <div class="event-detail">
          <div class="label">Venue</div>
          <div class="value">${data.event.venueType}</div>
        </div>
        <div class="event-detail">
          <div class="label">Catering</div>
          <div class="value">${data.event.cateringPackage}</div>
        </div>
      </div>

      <!-- Services Breakdown -->
      ${data.services.length > 0 ? `
      <div class="section-title">Services</div>
      <table>
        <thead>
          <tr><th>Service</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Total</th></tr>
        </thead>
        <tbody>${servicesRows}</tbody>
      </table>
      ` : ''}

      <!-- Add-ons Breakdown -->
      ${data.addOns.length > 0 ? `
      <div style="margin-top:24px;" class="section-title">Add-ons</div>
      <table>
        <thead>
          <tr><th>Add-on</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Total</th></tr>
        </thead>
        <tbody>${addOnsRows}</tbody>
      </table>
      ` : ''}

      <!-- Totals -->
      <div class="totals">
        <div class="totals-row">
          <div class="label">Subtotal</div>
          <div class="value">${fmt(data.subtotal)}</div>
        </div>
        <div class="totals-row">
          <div class="label">Service Fee</div>
          <div class="value">${fmt(data.serviceFee)}</div>
        </div>
        <div class="totals-row total">
          <div class="label">Total</div>
          <div class="value" style="color:#C8A456;">${fmt(data.total)}</div>
        </div>
      </div>

      ${data.notes ? `
      <div class="notes-section">
        <h4>Notes</h4>
        <p>${data.notes}</p>
      </div>
      ` : ''}

      <!-- Payments -->
      ${data.payments.length > 0 ? `
      <div class="payments-section">
        <div class="section-title">Payment History</div>
        <div class="payment-summary">
          <div class="payment-summary-item" style="background:#f0fdf4;">
            <div class="ps-label">Total Paid</div>
            <div class="ps-value" style="color:#22C55E;">${fmt(data.totalPaid)}</div>
          </div>
          <div class="payment-summary-item" style="background:${data.balance > 0 ? '#fefce8' : '#f0fdf4'};">
            <div class="ps-label">Balance</div>
            <div class="ps-value" style="color:${data.balance > 0 ? '#EAB308' : '#22C55E'};">${fmt(data.balance)}${data.balance <= 0 ? ' (Paid)' : ''}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>Reference</th><th style="text-align:right;">Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>${paymentsRows}</tbody>
        </table>
      </div>
      ` : `
      <div class="payments-section">
        <div class="section-title">Payment Status</div>
        <div class="payment-summary">
          <div class="payment-summary-item" style="background:#fefce8;">
            <div class="ps-label">Total Due</div>
            <div class="ps-value" style="color:#EAB308;">${fmt(data.total)}</div>
          </div>
        </div>
        <p style="font-size:13px;color:#78716c;text-align:center;padding:16px;">No payments have been recorded yet.</p>
      </div>
      `}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for choosing <span class="company">${data.companyInfo.name}</span></p>
      <p style="margin-top:4px;">For questions about this invoice, contact <a href="mailto:${data.companyInfo.email}" style="color:#C8A456;">${data.companyInfo.email}</a></p>
      <div class="bank-info">
        <h4>Payment Details</h4>
        <p><strong>Bank:</strong> Guarantee Trust Bank (GTBank)</p>
        <p><strong>Account Name:</strong> KADIV Events Ltd</p>
        <p><strong>Account Number:</strong> 0123456789</p>
      </div>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Print / Save as PDF
  </button>
</div>
</body>
</html>`;
}
