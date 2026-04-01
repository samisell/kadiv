'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCurrency } from '@/lib/currency';
import { useCurrencyStore, DEFAULT_RATE } from '@/store/currencyStore';
import { useAuth } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Building, Phone, MapPin, Globe, RefreshCw, Check, Database, RotateCcw } from 'lucide-react';

// ─── Component ───────────────────────────────────────────────────────────────

interface SettingsSectionProps {
  settings: Record<string, string>;
  onSettingsUpdated: () => void;
}

export default function SettingsSection({ settings, onSettingsUpdated }: SettingsSectionProps) {
  const { rate, setRate, setCurrency } = useCurrencyStore();
  const { currency } = useCurrency();
  const { getToken } = useAuth();

  const [companyName, setCompanyName] = useState(settings.companyName || 'KADIV Events');
  const [contactEmail, setContactEmail] = useState(settings.companyEmail || 'info@kadiv.com');
  const [phoneNumber, setPhoneNumber] = useState(settings.companyPhone || '+234 801 234 5678');
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress || 'Plot 12, Victoria Island, Lagos, Nigeria');
  const [conversionRate, setConversionRate] = useState(settings.currencyRate || String(rate));
  const [saving, setSaving] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Sync local state when props change
  useEffect(() => {
    if (settings.companyName) setCompanyName(settings.companyName);
    if (settings.companyEmail) setContactEmail(settings.companyEmail);
    if (settings.companyPhone) setPhoneNumber(settings.companyPhone);
    if (settings.companyAddress) setCompanyAddress(settings.companyAddress);
    if (settings.currencyRate) setConversionRate(settings.currencyRate);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          companyName,
          companyEmail: contactEmail,
          companyPhone: phoneNumber,
          companyAddress,
          currencyRate: conversionRate,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      // Update currency rate in Zustand store
      const newRate = parseFloat(conversionRate);
      if (!isNaN(newRate) && newRate > 0) {
        setRate(newRate);
      }

      setLastSynced(new Date().toLocaleTimeString());
      onSettingsUpdated();
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetRate = () => {
    setConversionRate(String(DEFAULT_RATE));
    setRate(DEFAULT_RATE);
    setCurrency('NGN');
    toast.success('Currency rate reset to default');
  };

  const handleResetAll = () => {
    setCompanyName('KADIV Events');
    setContactEmail('info@kadiv.com');
    setPhoneNumber('+234 801 234 5678');
    setCompanyAddress('Plot 12, Victoria Island, Lagos, Nigeria');
    setConversionRate(String(DEFAULT_RATE));
    setRate(DEFAULT_RATE);
    setCurrency('NGN');
    toast.success('All settings reset to defaults');
  };

  const previewRate = parseFloat(conversionRate) || DEFAULT_RATE;

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-2xl">
      {/* Sync Status Banner */}
      {lastSynced && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <Check className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-sm text-green-400">Settings synced to database at {lastSynced}</p>
        </div>
      )}

      {/* General Settings */}
      <Card className="bg-charcoal border-gold/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-cream text-base">
              <Building className="w-4 h-4 text-gold" />
              General Settings
            </CardTitle>
            <Badge variant="outline" className="bg-charcoal-light text-cream/50 border-gold/10 text-[10px] gap-1">
              <Database className="w-3 h-3" /> Persisted
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Company Name */}
          <div className="space-y-1.5">
            <Label className="text-cream/70 text-xs flex items-center gap-1.5">
              <Building className="w-3 h-3 text-cream/40" />
              Company Name
            </Label>
            <Input
              className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your company name"
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-1.5">
            <Label className="text-cream/70 text-xs flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-cream/40" />
              Contact Email
            </Label>
            <Input
              className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@company.com"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label className="text-cream/70 text-xs flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-cream/40" />
              Phone Number
            </Label>
            <Input
              className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+234 xxx xxx xxxx"
            />
          </div>

          {/* Company Address */}
          <div className="space-y-1.5">
            <Label className="text-cream/70 text-xs flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-cream/40" />
              Company Address
            </Label>
            <Input
              className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Full business address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card className="bg-charcoal border-gold/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cream text-base">
            <Globe className="w-4 h-4 text-gold" />
            Currency Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-cream/70 text-xs">Current Display Currency</Label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-lg text-gold text-sm font-medium">
                {currency}
              </span>
              <span className="text-[11px] text-cream/30"> Visitors can toggle between NGN and USD from the navbar</span>
            </div>
          </div>

          <Separator className="bg-gold/10" />

          <div className="space-y-1.5">
            <Label className="text-cream/70 text-xs">USD to NGN Conversion Rate</Label>
            <p className="text-[11px] text-cream/40 mb-2">
              This rate is used to convert prices displayed in USD. Currently: 1 USD = ₦{rate.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Input
                className="bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 flex-1"
                type="number"
                min="1"
                step="1"
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
                placeholder="1550"
              />
              <Button
                variant="outline"
                size="icon"
                className="border-gold/10 text-cream/60 hover:text-gold shrink-0"
                onClick={handleResetRate}
                title="Reset to default rate"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-4 bg-charcoal-light rounded-lg border border-gold/5">
            <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-3">Live Conversion Preview</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-cream/40 mb-0.5">₦1,550,000 in NGN</p>
                <p className="text-lg text-cream font-semibold">₦1,550,000</p>
              </div>
              <div>
                <p className="text-[11px] text-cream/40 mb-0.5">₦1,550,000 in USD</p>
                <p className="text-lg text-cream font-semibold">
                  ${Math.round(1550000 / previewRate).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gold/5">
              <div className="flex items-center gap-2 text-[11px] text-cream/30">
                <span>Rate:</span>
                <span className="text-gold font-medium">1 USD = ₦{previewRate.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-cream/40 hover:text-cream hover:bg-charcoal-light text-xs"
          onClick={handleResetAll}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gold hover:bg-gold-light text-charcoal-dark min-w-[160px]"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Info note */}
      <div className="p-4 rounded-lg bg-gold/5 border border-gold/10">
        <div className="flex items-start gap-3">
          <Settings className="w-4 h-4 text-gold mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-cream/70 font-medium">Settings Persistence</p>
            <p className="text-xs text-cream/40 mt-1 leading-relaxed">
              All settings are saved to the database and persist across sessions. Currency rate changes take effect immediately across the entire site for all visitors. The conversion rate determines how prices are displayed when users select USD in the currency toggle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
