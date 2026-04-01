'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useCurrency } from '@/lib/currency';
import { useAuth } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Package, Plus, Edit, Trash2, MapPin, UtensilsCrossed, Sparkles, MapPinned, CalendarHeart } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  icon?: string;
  image?: string;
}

interface VenueItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface CateringItem {
  id: string;
  name: string;
  description: string;
  pricePerGuest: number;
}

interface AddonItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface LocationGroup {
  id: string;
  name: string;
  locations: { id: string; value: string; label: string }[];
}

interface EventTypeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
}

const ICON_OPTIONS = [
  'MapPin', 'Sparkles', 'UtensilsCrossed', 'Cake', 'Video', 'Disc',
  'Camera', 'Shield', 'Music', 'Star', 'Heart', 'Palette',
  'Wand2', 'Gem', 'Crown', 'PartyPopper',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ServicesSection() {
  const { format } = useCurrency();
  const { getToken } = useAuth();

  const authHeaders = useCallback((): HeadersInit => {
    const token = getToken();
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  }, [getToken]);

  const authHeadersGet = useCallback((): HeadersInit => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  // ── Services Tab State ──────────────────────────────────────────────────
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [svcForm, setSvcForm] = useState({ name: '', description: '', startingPrice: '', icon: 'Sparkles', image: '' });
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const res = await fetch('/api/admin/services', { headers: authHeadersGet() });
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch { toast.error('Failed to load services'); }
    finally { setServicesLoading(false); }
  }, [authHeadersGet]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openServiceCreate = () => { setEditingService(null); setSvcForm({ name: '', description: '', startingPrice: '', icon: 'Sparkles', image: '' }); setServiceDialog(true); };
  const openServiceEdit = (s: ServiceItem) => { setEditingService(s); setSvcForm({ name: s.name, description: s.description, startingPrice: String(s.startingPrice), icon: s.icon || 'Sparkles', image: s.image || '' }); setServiceDialog(true); };

  const saveService = async () => {
    if (!svcForm.name.trim() || !svcForm.description.trim()) { toast.error('Name and description required'); return; }
    try {
      if (editingService) {
        const res = await fetch('/api/admin/services', {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ id: editingService.id, name: svcForm.name, description: svcForm.description, startingPrice: Number(svcForm.startingPrice) || 0, icon: svcForm.icon, image: svcForm.image }),
        });
        if (!res.ok) throw new Error();
        toast.success('Service updated');
      } else {
        const res = await fetch('/api/admin/services', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ name: svcForm.name, description: svcForm.description, startingPrice: Number(svcForm.startingPrice) || 0, icon: svcForm.icon, image: svcForm.image }),
        });
        if (!res.ok) throw new Error();
        toast.success('Service created');
      }
      setServiceDialog(false);
      fetchServices();
    } catch { toast.error('Failed to save service'); }
  };

  const deleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE', headers: authHeadersGet() });
      if (!res.ok) throw new Error();
      toast.success('Service deleted');
      setDeleteTarget(null);
      fetchServices();
    } catch { toast.error('Failed to delete service'); }
  };

  // ── Venues Tab State ────────────────────────────────────────────────────
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [venueDialog, setVenueDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueItem | null>(null);
  const [venueForm, setVenueForm] = useState({ name: '', description: '', price: '' });

  const fetchVenues = useCallback(async () => {
    setVenuesLoading(true);
    try {
      const res = await fetch('/api/admin/venues', { headers: authHeadersGet() });
      if (res.ok) { const data = await res.json(); setVenues(data.venues || []); }
    } catch { toast.error('Failed to load venues'); }
    finally { setVenuesLoading(false); }
  }, [authHeadersGet]);

  const openVenueCreate = () => { setEditingVenue(null); setVenueForm({ name: '', description: '', price: '' }); setVenueDialog(true); };
  const openVenueEdit = (v: VenueItem) => { setEditingVenue(v); setVenueForm({ name: v.name, description: v.description, price: String(v.price) }); setVenueDialog(true); };

  const saveVenue = async () => {
    if (!venueForm.name.trim()) { toast.error('Name is required'); return; }
    try {
      const action = editingVenue ? 'update' : 'add';
      const payload = editingVenue
        ? { id: editingVenue.id, name: venueForm.name, description: venueForm.description, price: Number(venueForm.price) || 0 }
        : { name: venueForm.name, description: venueForm.description, price: Number(venueForm.price) || 0 };
      const res = await fetch('/api/admin/venues', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action, venue: payload }) });
      if (!res.ok) throw new Error();
      toast.success(editingVenue ? 'Venue updated' : 'Venue added');
      setVenueDialog(false);
      fetchVenues();
    } catch { toast.error('Failed to save venue'); }
  };

  const deleteVenue = async (v: VenueItem) => {
    try {
      const res = await fetch('/api/admin/venues', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action: 'delete', venue: { id: v.id } }) });
      if (!res.ok) throw new Error();
      toast.success('Venue deleted');
      setDeleteTarget(null);
      fetchVenues();
    } catch { toast.error('Failed to delete venue'); }
  };

  // ── Catering Tab State ──────────────────────────────────────────────────
  const [catering, setCatering] = useState<CateringItem[]>([]);
  const [cateringLoading, setCateringLoading] = useState(true);
  const [cateringDialog, setCateringDialog] = useState(false);
  const [editingCatering, setEditingCatering] = useState<CateringItem | null>(null);
  const [cateringForm, setCateringForm] = useState({ name: '', description: '', pricePerGuest: '' });

  const fetchCatering = useCallback(async () => {
    setCateringLoading(true);
    try {
      const res = await fetch('/api/admin/catering', { headers: authHeadersGet() });
      if (res.ok) { const data = await res.json(); setCatering(data.packages || []); }
    } catch { toast.error('Failed to load catering'); }
    finally { setCateringLoading(false); }
  }, [authHeadersGet]);

  const openCateringCreate = () => { setEditingCatering(null); setCateringForm({ name: '', description: '', pricePerGuest: '' }); setCateringDialog(true); };
  const openCateringEdit = (c: CateringItem) => { setEditingCatering(c); setCateringForm({ name: c.name, description: c.description, pricePerGuest: String(c.pricePerGuest) }); setCateringDialog(true); };

  const saveCatering = async () => {
    if (!cateringForm.name.trim()) { toast.error('Name is required'); return; }
    try {
      const action = editingCatering ? 'update' : 'add';
      const payload = editingCatering
        ? { id: editingCatering.id, name: cateringForm.name, description: cateringForm.description, pricePerGuest: Number(cateringForm.pricePerGuest) || 0 }
        : { name: cateringForm.name, description: cateringForm.description, pricePerGuest: Number(cateringForm.pricePerGuest) || 0 };
      const res = await fetch('/api/admin/catering', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action, pkg: payload }) });
      if (!res.ok) throw new Error();
      toast.success(editingCatering ? 'Package updated' : 'Package added');
      setCateringDialog(false);
      fetchCatering();
    } catch { toast.error('Failed to save package'); }
  };

  const deleteCatering = async (c: CateringItem) => {
    try {
      const res = await fetch('/api/admin/catering', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action: 'delete', pkg: { id: c.id } }) });
      if (!res.ok) throw new Error();
      toast.success('Package deleted');
      setDeleteTarget(null);
      fetchCatering();
    } catch { toast.error('Failed to delete package'); }
  };

  // ── Add-ons Tab State ───────────────────────────────────────────────────
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [addonsLoading, setAddonsLoading] = useState(true);
  const [addonDialog, setAddonDialog] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddonItem | null>(null);
  const [addonForm, setAddonForm] = useState({ name: '', description: '', price: '' });

  const fetchAddons = useCallback(async () => {
    setAddonsLoading(true);
    try {
      const res = await fetch('/api/admin/addons', { headers: authHeadersGet() });
      if (res.ok) { const data = await res.json(); setAddons(data.addons || []); }
    } catch { toast.error('Failed to load add-ons'); }
    finally { setAddonsLoading(false); }
  }, [authHeadersGet]);

  const openAddonCreate = () => { setEditingAddon(null); setAddonForm({ name: '', description: '', price: '' }); setAddonDialog(true); };
  const openAddonEdit = (a: AddonItem) => { setEditingAddon(a); setAddonForm({ name: a.name, description: a.description, price: String(a.price) }); setAddonDialog(true); };

  const saveAddon = async () => {
    if (!addonForm.name.trim()) { toast.error('Name is required'); return; }
    try {
      const action = editingAddon ? 'update' : 'add';
      const payload = editingAddon
        ? { id: editingAddon.id, name: addonForm.name, description: addonForm.description, price: Number(addonForm.price) || 0 }
        : { name: addonForm.name, description: addonForm.description, price: Number(addonForm.price) || 0 };
      const res = await fetch('/api/admin/addons', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action, addon: payload }) });
      if (!res.ok) throw new Error();
      toast.success(editingAddon ? 'Add-on updated' : 'Add-on added');
      setAddonDialog(false);
      fetchAddons();
    } catch { toast.error('Failed to save add-on'); }
  };

  const deleteAddon = async (a: AddonItem) => {
    try {
      const res = await fetch('/api/admin/addons', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action: 'delete', addon: { id: a.id } }) });
      if (!res.ok) throw new Error();
      toast.success('Add-on deleted');
      setDeleteTarget(null);
      fetchAddons();
    } catch { toast.error('Failed to delete add-on'); }
  };

  // ── Event Types Tab State ─────────────────────────────────────────────
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = useState(true);
  const [eventTypeDialog, setEventTypeDialog] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventTypeItem | null>(null);
  const [etForm, setEtForm] = useState({ name: '', description: '', icon: 'Heart', image: '' });

  const fetchEventTypes = useCallback(async () => {
    setEventTypesLoading(true);
    try {
      const res = await fetch('/api/admin/event-types', { headers: authHeadersGet() });
      if (res.ok) { const data = await res.json(); setEventTypes(data.eventTypes || []); }
    } catch { toast.error('Failed to load event types'); }
    finally { setEventTypesLoading(false); }
  }, [authHeadersGet]);

  const openEventTypeCreate = () => { setEditingEventType(null); setEtForm({ name: '', description: '', icon: 'Heart', image: '' }); setEventTypeDialog(true); };
  const openEventTypeEdit = (et: EventTypeItem) => { setEditingEventType(et); setEtForm({ name: et.name, description: et.description, icon: et.icon || 'Heart', image: et.image || '' }); setEventTypeDialog(true); };

  const saveEventType = async () => {
    if (!etForm.name.trim() || !etForm.description.trim()) { toast.error('Name and description required'); return; }
    try {
      if (editingEventType) {
        const res = await fetch('/api/admin/event-types', {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ id: editingEventType.id, name: etForm.name, description: etForm.description, icon: etForm.icon, image: etForm.image }),
        });
        if (!res.ok) throw new Error();
        toast.success('Event type updated');
      } else {
        const res = await fetch('/api/admin/event-types', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ name: etForm.name, description: etForm.description, icon: etForm.icon, image: etForm.image }),
        });
        if (!res.ok) throw new Error();
        toast.success('Event type created');
      }
      setEventTypeDialog(false);
      fetchEventTypes();
    } catch { toast.error('Failed to save event type'); }
  };

  const deleteEventType = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/event-types?id=${id}`, { method: 'DELETE', headers: authHeadersGet() });
      if (!res.ok) throw new Error();
      toast.success('Event type deleted');
      setDeleteTarget(null);
      fetchEventTypes();
    } catch { toast.error('Failed to delete event type'); }
  };

  // ── Locations Tab State ─────────────────────────────────────────────────
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locGroupDialog, setLocGroupDialog] = useState(false);
  const [locGroupForm, setLocGroupForm] = useState('');
  const [locDialog, setLocDialog] = useState(false);
  const [locForm, setLocForm] = useState({ groupId: '', value: '', label: '', editId: '' });
  const [deleteLocTarget, setDeleteLocTarget] = useState<{ groupId: string; locationId: string; label: string } | null>(null);

  const fetchLocations = useCallback(async () => {
    setLocationsLoading(true);
    try {
      const res = await fetch('/api/admin/locations', { headers: authHeadersGet() });
      if (res.ok) { const data = await res.json(); setLocationGroups(data.groups || []); }
    } catch { toast.error('Failed to load locations'); }
    finally { setLocationsLoading(false); }
  }, [authHeadersGet]);

  const addLocationGroup = async () => {
    if (!locGroupForm.trim()) { toast.error('Group name required'); return; }
    try {
      const res = await fetch('/api/admin/locations', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action: 'add_group', name: locGroupForm.trim() }) });
      if (!res.ok) throw new Error();
      toast.success('Group added');
      setLocGroupDialog(false);
      setLocGroupForm('');
      fetchLocations();
    } catch { toast.error('Failed to add group'); }
  };

  const deleteLocationGroup = async (groupId: string) => {
    try {
      const res = await fetch('/api/admin/locations', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action: 'delete_group', groupId }) });
      if (!res.ok) throw new Error();
      toast.success('Group deleted');
      setDeleteTarget(null);
      fetchLocations();
    } catch { toast.error('Failed to delete group'); }
  };

  const openAddLocation = (groupId: string) => { setLocForm({ groupId, value: '', label: '', editId: '' }); setLocDialog(true); };
  const openEditLocation = (groupId: string, loc: { id: string; value: string; label: string }) => { setLocForm({ groupId, value: loc.value, label: loc.label, editId: loc.id }); setLocDialog(true); };

  const saveLocation = async () => {
    if (!locForm.value.trim() || !locForm.label.trim()) { toast.error('Value and label required'); return; }
    try {
      const action = locForm.editId ? 'update_location' : 'add_location';
      const body = locForm.editId
        ? { action, groupId: locForm.groupId, locationId: locForm.editId, value: locForm.value, label: locForm.label }
        : { action, groupId: locForm.groupId, value: locForm.value, label: locForm.label };
      const res = await fetch('/api/admin/locations', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success(locForm.editId ? 'Location updated' : 'Location added');
      setLocDialog(false);
      fetchLocations();
    } catch { toast.error('Failed to save location'); }
  };

  const deleteLocation = async () => {
    if (!deleteLocTarget) return;
    try {
      const res = await fetch('/api/admin/locations', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action: 'delete_location', groupId: deleteLocTarget.groupId, locationId: deleteLocTarget.locationId }) });
      if (!res.ok) throw new Error();
      toast.success('Location deleted');
      setDeleteLocTarget(null);
      fetchLocations();
    } catch { toast.error('Failed to delete location'); }
  };

  // ── Shared delete handler ───────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'service') { await deleteService(deleteTarget.id); return; }
    if (deleteTarget.type === 'event-type') { await deleteEventType(deleteTarget.id); return; }
    toast.success('Deleted');
    setDeleteTarget(null);
  };

  // ── Loading skeleton ────────────────────────────────────────────────────
  const TableSkeleton = () => (
    <div className="p-6 space-y-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-charcoal-light" />)}
    </div>
  );

  // ── Tab change handler (lazy fetch) ─────────────────────────────────────
  const handleTabChange = (tab: string) => {
    if (tab === 'event-types' && eventTypes.length === 0) fetchEventTypes();
    if (tab === 'venues' && venues.length === 0) fetchVenues();
    if (tab === 'catering' && catering.length === 0) fetchCatering();
    if (tab === 'addons' && addons.length === 0) fetchAddons();
    if (tab === 'locations' && locationGroups.length === 0) fetchLocations();
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <Tabs defaultValue="services" onValueChange={handleTabChange}>
        <TabsList className="bg-charcoal-light border border-gold/10 h-10 w-full sm:w-auto flex flex-wrap">
          <TabsTrigger value="event-types" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark gap-1.5">
            <CalendarHeart className="w-3.5 h-3.5" /> Event Types
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark gap-1.5">
            <Package className="w-3.5 h-3.5" /> Services
          </TabsTrigger>
          <TabsTrigger value="venues" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Venues
          </TabsTrigger>
          <TabsTrigger value="catering" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5" /> Catering
          </TabsTrigger>
          <TabsTrigger value="addons" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Add-ons
          </TabsTrigger>
          <TabsTrigger value="locations" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark gap-1.5">
            <MapPinned className="w-3.5 h-3.5" /> Locations
          </TabsTrigger>
        </TabsList>

        {/* ─── Event Types Tab ────────────────────────────────────────── */}
        <TabsContent value="event-types" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-cream/40">{eventTypes.length} event type{eventTypes.length !== 1 ? 's' : ''}</p>
            <Button onClick={openEventTypeCreate} className="bg-gold hover:bg-gold-light text-charcoal-dark text-sm h-9">
              <Plus className="w-4 h-4 mr-1.5" /> Add Event Type
            </Button>
          </div>
          <Card className="bg-charcoal border-gold/10 overflow-hidden">
            <div className="max-h-[520px] overflow-y-auto">
              {eventTypesLoading ? <TableSkeleton /> : eventTypes.length === 0 ? (
                <div className="py-16 text-center"><CalendarHeart className="w-12 h-12 text-cream/20 mx-auto mb-3" /><p className="text-cream/40 text-sm">No event types yet</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                  {eventTypes.map((et) => (
                    <div key={et.id} className="p-4 bg-charcoal-light/50 border border-gold/5 rounded-lg hover:border-gold/20 transition-all group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                            <CalendarHeart className="w-4 h-4 text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-cream">{et.name}</p>
                            <p className="text-[10px] text-cream/30 font-mono">{et.icon}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-cream/50 hover:text-gold" onClick={() => openEventTypeEdit(et)}><Edit className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-cream/50 hover:text-red-400" onClick={() => setDeleteTarget({ type: 'event-type', id: et.id, name: et.name })}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                      <p className="text-xs text-cream/50 line-clamp-2 leading-relaxed">{et.description}</p>
                      {et.image && <p className="text-[10px] text-cream/20 mt-2 truncate font-mono">{et.image}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ─── Services Tab ─────────────────────────────────────────────── */}
        <TabsContent value="services" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-cream/40">{services.length} service{services.length !== 1 ? 's' : ''}</p>
            <Button onClick={openServiceCreate} className="bg-gold hover:bg-gold-light text-charcoal-dark text-sm h-9">
              <Plus className="w-4 h-4 mr-1.5" /> Add Service
            </Button>
          </div>
          <Card className="bg-charcoal border-gold/10 overflow-hidden">
            <div className="max-h-[520px] overflow-y-auto">
              {servicesLoading ? <TableSkeleton /> : services.length === 0 ? (
                <div className="py-16 text-center"><Package className="w-12 h-12 text-cream/20 mx-auto mb-3" /><p className="text-cream/40 text-sm">No services yet</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="text-cream/40 text-xs">Name</TableHead>
                      <TableHead className="text-cream/40 text-xs hidden md:table-cell">Price</TableHead>
                      <TableHead className="text-cream/40 text-xs hidden lg:table-cell">Description</TableHead>
                      <TableHead className="text-cream/40 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((s) => (
                      <TableRow key={s.id} className="border-gold/5 hover:bg-charcoal-light/30">
                        <TableCell>
                          <div>
                            <p className="text-cream text-sm font-medium">{s.name}</p>
                            <p className="text-[11px] text-cream/30">{s.icon || 'Sparkles'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gold text-sm font-medium hidden md:table-cell">{format(s.startingPrice)}</TableCell>
                        <TableCell className="text-cream/50 text-sm hidden lg:table-cell max-w-[200px] truncate">{s.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-gold" onClick={() => openServiceEdit(s)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-red-400" onClick={() => setDeleteTarget({ type: 'service', id: s.id, name: s.name })}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ─── Venues Tab ───────────────────────────────────────────────── */}
        <TabsContent value="venues" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-cream/40">{venues.length} venue{venues.length !== 1 ? 's' : ''}</p>
            <Button onClick={openVenueCreate} className="bg-gold hover:bg-gold-light text-charcoal-dark text-sm h-9"><Plus className="w-4 h-4 mr-1.5" /> Add Venue</Button>
          </div>
          <Card className="bg-charcoal border-gold/10 overflow-hidden">
            <div className="max-h-[520px] overflow-y-auto">
              {venuesLoading ? <TableSkeleton /> : venues.length === 0 ? (
                <div className="py-16 text-center"><MapPin className="w-12 h-12 text-cream/20 mx-auto mb-3" /><p className="text-cream/40 text-sm">No venues yet</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="text-cream/40 text-xs">Name</TableHead>
                      <TableHead className="text-cream/40 text-xs hidden md:table-cell">Price</TableHead>
                      <TableHead className="text-cream/40 text-xs hidden lg:table-cell">Description</TableHead>
                      <TableHead className="text-cream/40 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {venues.map((v) => (
                      <TableRow key={v.id} className="border-gold/5 hover:bg-charcoal-light/30">
                        <TableCell className="text-cream text-sm font-medium">{v.name}</TableCell>
                        <TableCell className="text-gold text-sm font-medium hidden md:table-cell">{format(v.price)}</TableCell>
                        <TableCell className="text-cream/50 text-sm hidden lg:table-cell max-w-[200px] truncate">{v.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-gold" onClick={() => openVenueEdit(v)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-red-400" onClick={() => deleteVenue(v)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ─── Catering Tab ─────────────────────────────────────────────── */}
        <TabsContent value="catering" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-cream/40">{catering.length} package{catering.length !== 1 ? 's' : ''}</p>
            <Button onClick={openCateringCreate} className="bg-gold hover:bg-gold-light text-charcoal-dark text-sm h-9"><Plus className="w-4 h-4 mr-1.5" /> Add Package</Button>
          </div>
          <Card className="bg-charcoal border-gold/10 overflow-hidden">
            <div className="max-h-[520px] overflow-y-auto">
              {cateringLoading ? <TableSkeleton /> : catering.length === 0 ? (
                <div className="py-16 text-center"><UtensilsCrossed className="w-12 h-12 text-cream/20 mx-auto mb-3" /><p className="text-cream/40 text-sm">No packages yet</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="text-cream/40 text-xs">Name</TableHead>
                      <TableHead className="text-cream/40 text-xs hidden md:table-cell">Price/Guest</TableHead>
                      <TableHead className="text-cream/40 text-xs hidden lg:table-cell">Description</TableHead>
                      <TableHead className="text-cream/40 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catering.map((c) => (
                      <TableRow key={c.id} className="border-gold/5 hover:bg-charcoal-light/30">
                        <TableCell className="text-cream text-sm font-medium">{c.name}</TableCell>
                        <TableCell className="text-gold text-sm font-medium hidden md:table-cell">{format(c.pricePerGuest)}<span className="text-cream/30 text-xs"> /guest</span></TableCell>
                        <TableCell className="text-cream/50 text-sm hidden lg:table-cell max-w-[200px] truncate">{c.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-gold" onClick={() => openCateringEdit(c)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-red-400" onClick={() => deleteCatering(c)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ─── Add-ons Tab ──────────────────────────────────────────────── */}
        <TabsContent value="addons" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-cream/40">{addons.length} add-on{addons.length !== 1 ? 's' : ''}</p>
            <Button onClick={openAddonCreate} className="bg-gold hover:bg-gold-light text-charcoal-dark text-sm h-9"><Plus className="w-4 h-4 mr-1.5" /> Add On</Button>
          </div>
          <Card className="bg-charcoal border-gold/10 overflow-hidden">
            <div className="max-h-[520px] overflow-y-auto">
              {addonsLoading ? <TableSkeleton /> : addons.length === 0 ? (
                <div className="py-16 text-center"><Sparkles className="w-12 h-12 text-cream/20 mx-auto mb-3" /><p className="text-cream/40 text-sm">No add-ons yet</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="text-cream/40 text-xs">Name</TableHead>
                      <TableHead className="text-cream/40 text-xs hidden md:table-cell">Price</TableHead>
                      <TableHead className="text-cream/40 text-xs hidden lg:table-cell">Description</TableHead>
                      <TableHead className="text-cream/40 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addons.map((a) => (
                      <TableRow key={a.id} className="border-gold/5 hover:bg-charcoal-light/30">
                        <TableCell className="text-cream text-sm font-medium">{a.name}</TableCell>
                        <TableCell className="text-gold text-sm font-medium hidden md:table-cell">{format(a.price)}</TableCell>
                        <TableCell className="text-cream/50 text-sm hidden lg:table-cell max-w-[200px] truncate">{a.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-gold" onClick={() => openAddonEdit(a)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-red-400" onClick={() => deleteAddon(a)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ─── Locations Tab ────────────────────────────────────────────── */}
        <TabsContent value="locations" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-cream/40">{locationGroups.length} group{locationGroups.length !== 1 ? 's' : ''}</p>
            <Button onClick={() => setLocGroupDialog(true)} className="bg-gold hover:bg-gold-light text-charcoal-dark text-sm h-9"><Plus className="w-4 h-4 mr-1.5" /> Add Group</Button>
          </div>
          {locationsLoading ? (
            <Card className="bg-charcoal border-gold/10"><CardContent className="p-6"><TableSkeleton /></CardContent></Card>
          ) : locationGroups.length === 0 ? (
            <div className="py-16 text-center"><MapPinned className="w-12 h-12 text-cream/20 mx-auto mb-3" /><p className="text-cream/40 text-sm">No location groups yet</p></div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {locationGroups.map((group) => (
                <Card key={group.id} className="bg-charcoal border-gold/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-cream">{group.name}</h4>
                        <span className="text-[11px] text-cream/30 bg-charcoal-light px-2 py-0.5 rounded-full">{group.locations.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-gold hover:text-gold-light" onClick={() => openAddLocation(group.id)}><Plus className="w-3 h-3 mr-1" />Add</Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-cream/30 hover:text-red-400" onClick={() => setDeleteTarget({ type: 'locGroup', id: group.id, name: group.name })}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                    {group.locations.length === 0 ? (
                      <p className="text-xs text-cream/30 py-2">No locations in this group</p>
                    ) : (
                      <div className="space-y-1">
                        {group.locations.map((loc) => (
                          <div key={loc.id} className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-charcoal-light/50 group/loc">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm text-cream/70 truncate">{loc.label}</span>
                              <span className="text-[10px] text-cream/25 font-mono">{loc.value}</span>
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover/loc:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-cream/40 hover:text-gold" onClick={() => openEditLocation(group.id, loc)}><Edit className="w-3 h-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-cream/40 hover:text-red-400" onClick={() => setDeleteLocTarget({ groupId: group.id, locationId: loc.id, label: loc.label })}><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Event Type Create/Edit Dialog ──────────────────────────────── */}
      <Dialog open={eventTypeDialog} onOpenChange={setEventTypeDialog}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gold font-display text-lg">{editingEventType ? 'Edit Event Type' : 'Add Event Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Name *</Label>
              <Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" placeholder="e.g., Weddings" value={etForm.name} onChange={(e) => setEtForm({ ...etForm, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Description *</Label>
              <Textarea className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 resize-none" rows={3} placeholder="Describe this event type..." value={etForm.description} onChange={(e) => setEtForm({ ...etForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-cream/70 text-xs">Icon</Label>
                <Select value={etForm.icon} onValueChange={(v) => setEtForm({ ...etForm, icon: v })}>
                  <SelectTrigger className="bg-charcoal-light border-gold/10 text-cream"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-charcoal border-gold/20">{ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic} className="text-cream focus:bg-gold/10 focus:text-gold">{ic}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-cream/70 text-xs">Image URL</Label>
                <Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" placeholder="/images/..." value={etForm.image} onChange={(e) => setEtForm({ ...etForm, image: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setEventTypeDialog(false)}>Cancel</Button>
            <Button onClick={saveEventType} className="bg-gold hover:bg-gold-light text-charcoal-dark">{editingEventType ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Service Create/Edit Dialog ─────────────────────────────────── */}
      <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gold font-display text-lg">{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Name *</Label>
              <Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" placeholder="Service name" value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Description *</Label>
              <Textarea className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 resize-none" rows={3} placeholder="Brief description..." value={svcForm.description} onChange={(e) => setSvcForm({ ...svcForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-cream/70 text-xs">Starting Price (NGN)</Label>
                <Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" type="number" placeholder="0" value={svcForm.startingPrice} onChange={(e) => setSvcForm({ ...svcForm, startingPrice: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-cream/70 text-xs">Icon</Label>
                <Select value={svcForm.icon} onValueChange={(v) => setSvcForm({ ...svcForm, icon: v })}>
                  <SelectTrigger className="bg-charcoal-light border-gold/10 text-cream"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-charcoal border-gold/20">{ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic} className="text-cream focus:bg-gold/10 focus:text-gold">{ic}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-cream/70 text-xs">Image URL</Label>
              <Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" placeholder="https://..." value={svcForm.image} onChange={(e) => setSvcForm({ ...svcForm, image: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setServiceDialog(false)}>Cancel</Button>
            <Button onClick={saveService} className="bg-gold hover:bg-gold-light text-charcoal-dark">{editingService ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Venue Create/Edit Dialog ───────────────────────────────────── */}
      <Dialog open={venueDialog} onOpenChange={setVenueDialog}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader><DialogTitle className="text-gold font-display text-lg">{editingVenue ? 'Edit Venue' : 'Add Venue'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Name *</Label><Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" placeholder="Venue name" value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Description</Label><Textarea className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 resize-none" rows={2} placeholder="Description..." value={venueForm.description} onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Price (NGN)</Label><Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" type="number" placeholder="0" value={venueForm.price} onChange={(e) => setVenueForm({ ...venueForm, price: e.target.value })} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setVenueDialog(false)}>Cancel</Button>
            <Button onClick={saveVenue} className="bg-gold hover:bg-gold-light text-charcoal-dark">{editingVenue ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Catering Create/Edit Dialog ────────────────────────────────── */}
      <Dialog open={cateringDialog} onOpenChange={setCateringDialog}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader><DialogTitle className="text-gold font-display text-lg">{editingCatering ? 'Edit Package' : 'Add Package'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Name *</Label><Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" placeholder="Package name" value={cateringForm.name} onChange={(e) => setCateringForm({ ...cateringForm, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Description</Label><Textarea className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 resize-none" rows={2} placeholder="Description..." value={cateringForm.description} onChange={(e) => setCateringForm({ ...cateringForm, description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Price per Guest (NGN)</Label><Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" type="number" placeholder="0" value={cateringForm.pricePerGuest} onChange={(e) => setCateringForm({ ...cateringForm, pricePerGuest: e.target.value })} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setCateringDialog(false)}>Cancel</Button>
            <Button onClick={saveCatering} className="bg-gold hover:bg-gold-light text-charcoal-dark">{editingCatering ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add-on Create/Edit Dialog ─────────────────────────────────── */}
      <Dialog open={addonDialog} onOpenChange={setAddonDialog}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader><DialogTitle className="text-gold font-display text-lg">{editingAddon ? 'Edit Add-on' : 'Add On'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Name *</Label><Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" placeholder="Add-on name" value={addonForm.name} onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Description</Label><Textarea className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 resize-none" rows={2} placeholder="Description..." value={addonForm.description} onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Price (NGN)</Label><Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" type="number" placeholder="0" value={addonForm.price} onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setAddonDialog(false)}>Cancel</Button>
            <Button onClick={saveAddon} className="bg-gold hover:bg-gold-light text-charcoal-dark">{editingAddon ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Location Group Dialog ──────────────────────────────────────── */}
      <Dialog open={locGroupDialog} onOpenChange={setLocGroupDialog}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-sm">
          <DialogHeader><DialogTitle className="text-gold font-display text-lg">Add Location Group</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Group Name *</Label><Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" placeholder="e.g., Lagos" value={locGroupForm} onChange={(e) => setLocGroupForm(e.target.value)} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setLocGroupDialog(false)}>Cancel</Button>
            <Button onClick={addLocationGroup} className="bg-gold hover:bg-gold-light text-charcoal-dark">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Location Add/Edit Dialog ───────────────────────────────────── */}
      <Dialog open={locDialog} onOpenChange={setLocDialog}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-sm">
          <DialogHeader><DialogTitle className="text-gold font-display text-lg">{locForm.editId ? 'Edit Location' : 'Add Location'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Value (URL slug) *</Label><Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 font-mono text-sm" placeholder="e.g., victoria-island" value={locForm.value} onChange={(e) => setLocForm({ ...locForm, value: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-cream/70 text-xs">Label (Display name) *</Label><Input className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30" placeholder="e.g., Victoria Island (VI)" value={locForm.label} onChange={(e) => setLocForm({ ...locForm, label: e.target.value })} /></div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setLocDialog(false)}>Cancel</Button>
            <Button onClick={saveLocation} className="bg-gold hover:bg-gold-light text-charcoal-dark">{locForm.editId ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ─────────────────────────────────── */}
      <Dialog open={!!deleteTarget || !!deleteLocTarget} onOpenChange={() => { setDeleteTarget(null); setDeleteLocTarget(null); }}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader><DialogTitle className="text-cream">Delete</DialogTitle></DialogHeader>
          <p className="text-cream/50 text-sm">
            Are you sure you want to delete {deleteTarget?.name || deleteLocTarget?.label || 'this item'}? This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => { setDeleteTarget(null); setDeleteLocTarget(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (deleteTarget) {
                if (deleteTarget.type === 'service') { deleteService(deleteTarget.id); return; }
                if (deleteTarget.type === 'locGroup') { deleteLocationGroup(deleteTarget.id); return; }
              }
              if (deleteLocTarget) { deleteLocation(); return; }
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}