'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Search, Trash2, ChevronLeft, ChevronRight, Shield, Download } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { bookings: number; estimates: number; payments: number };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// ─── Component ───────────────────────────────────────────────────────────────

export default function UsersSection() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      });
      if (!res.ok) throw new Error();
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/admin/export/users', '_blank');
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Filters + Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10 bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 h-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44 bg-charcoal-light border-gold/10 text-cream h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-charcoal border-gold/20">
            <SelectItem value="all" className="text-cream focus:bg-gold/10 focus:text-gold">All Roles</SelectItem>
            <SelectItem value="admin" className="text-cream focus:bg-gold/10 focus:text-gold">Admin</SelectItem>
            <SelectItem value="client" className="text-cream focus:bg-gold/10 focus:text-gold">Client</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="border-gold/20 text-gold hover:bg-gold/10 hover:text-gold h-9 px-3"
          onClick={handleExportCSV}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      <p className="text-xs text-cream/40">{total} user{total !== 1 ? 's' : ''} found</p>

      {/* Table */}
      <Card className="bg-charcoal border-gold/10 overflow-hidden">
        <ScrollArea className="max-h-[520px]">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-charcoal-light" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-cream/20 mx-auto mb-3" />
              <p className="text-cream/40 text-sm">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold/10 hover:bg-transparent">
                  <TableHead className="text-cream/40 text-xs">User</TableHead>
                  <TableHead className="text-cream/40 text-xs hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="text-cream/40 text-xs">Role</TableHead>
                  <TableHead className="text-cream/40 text-xs hidden md:table-cell">Bookings</TableHead>
                  <TableHead className="text-cream/40 text-xs hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-cream/40 text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-gold/5 hover:bg-charcoal-light/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 bg-gold/20 shrink-0">
                          <AvatarFallback className="text-gold text-xs font-semibold">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-cream text-sm font-medium truncate">{u.name || '-'}</p>
                          <p className="text-cream/40 text-xs truncate">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-cream/60 text-sm hidden sm:table-cell">{u.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          u.role === 'admin'
                            ? 'bg-gold/20 text-gold border-gold/30'
                            : 'bg-charcoal-light text-cream/70 border-charcoal-light'
                        }
                      >
                        {u.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-cream/60 text-sm hidden md:table-cell">{u._count.bookings}</TableCell>
                    <TableCell className="text-cream/50 text-sm hidden lg:table-cell">{fmtDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-2.5 text-xs ${
                            u.role === 'admin'
                              ? 'text-gold hover:text-gold-light'
                              : 'text-cream/50 hover:text-cream'
                          }`}
                          onClick={() => toggleRole(u.id, u.role)}
                        >
                          <Shield className="w-3.5 h-3.5 mr-1" />
                          {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-red-400" onClick={() => setDeleteId(u.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="border-gold/10 text-cream/60 hover:text-gold h-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 ${pageNum === page ? 'bg-gold text-charcoal-dark' : 'border-gold/10 text-cream/60 hover:text-gold'}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" className="border-gold/10 text-cream/60 hover:text-gold h-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cream">Delete User</DialogTitle>
            <DialogDescription className="text-cream/50">
              Are you sure? This will permanently delete the user and all their associated data (bookings, payments, estimates).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && deleteUser(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
