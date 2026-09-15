import * as React from 'react';
import { ImageIcon, Loader2, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from './FormField';
import { validateForm, required, validatePositiveNumber } from '@/utils/validation';
import { searchProducts } from '@/constants/productCatalog';
import { detectLocation } from '@/utils/geo';

export const CATEGORY_ICONS = [
  { value: '🌾', label: '🌾 Grain' },
  { value: '🍅', label: '🍅 Vegetable' },
  { value: '🍇', label: '🍇 Fruit' },
  { value: '🧡', label: '🧡 Spice' },
  { value: '🫒', label: '🫒 Oilseed' },
  { value: '🥛', label: '🥛 Dairy' },
  { value: '🥜', label: '🥜 Pulse / Nut' },
];

export const UNITS = ['kg', 'quintal', 'bag', 'piece', 'litre'];
export const QUALITIES = ['Standard', 'Premium', 'A+'];

const EMPTY = {
  name: '', variety: '', category: '', unit: 'kg', pricePerUnit: '', stockQuantity: '',
  minOrderQuantity: '', quality: 'Standard', icon: '🌾', description: '', certification: '',
  latitude: '', longitude: '', locationText: '', image: '',
};

export default function ProductForm({ initial, submitLabel = 'Save product', submitting, onSubmit }) {
  const [values, setValues] = React.useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = React.useState({});
  const [detecting, setDetecting] = React.useState(false);
  const [detectedMsg, setDetectedMsg] = React.useState('');

  const detectPickup = async () => {
    setDetecting(true);
    setDetectedMsg('');
    try {
      const loc = await detectLocation();
      setValues((v) => ({
        ...v,
        latitude: loc.latitude,
        longitude: loc.longitude,
        locationText: loc.locationText || v.locationText,
      }));
      setDetectedMsg(
        loc.locationText
          ? `Detected pickup location: ${loc.locationText}`
          : `Detected pickup coordinates: ${Number(loc.latitude).toFixed(6)}, ${Number(loc.longitude).toFixed(6)}`
      );
    } catch (err) {
      setDetectedMsg(`Could not detect location — ${err.message}`);
    } finally {
      setDetecting(false);
    }
  };
  const [openSuggestions, setOpenSuggestions] = React.useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const setSelect = (key) => (value) => setValues((v) => ({ ...v, [key]: value }));

  const suggestions = React.useMemo(() => searchProducts(values.name), [values.name]);

  const applySuggestion = (s) => {
    setValues((v) => ({
      ...v,
      name: s.name,
      variety: s.variety,
      category: s.category,
      icon: s.icon,
      image: s.image,
    }));
    setOpenSuggestions(false);
  };

  const submit = (e) => {
    e.preventDefault();
    const rules = {
      name: (v) => required(v, 'Product name'),
      variety: (v) => required(v, 'Variety'),
      category: (v) => required(v, 'Category'),
      pricePerUnit: (v) => validatePositiveNumber(v, 'Price per unit'),
      stockQuantity: (v) => validatePositiveNumber(v, 'Available stock'),
      minOrderQuantity: (v) => validatePositiveNumber(v, 'Minimum order'),
      description: (v) => required(v, 'Description'),
    };
    const validation = validateForm(values, rules);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    onSubmit(values);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Product name"
          required
          error={errors.name}
          htmlFor="name"
          hint="Start typing to see suggestions — the product image is picked automatically."
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              value={values.name}
              onChange={set('name')}
              onFocus={() => setOpenSuggestions(true)}
              onBlur={() => setTimeout(() => setOpenSuggestions(false), 150)}
              placeholder="Type to search — e.g. Basmati Rice"
              className="pl-9"
              autoComplete="off"
            />
            {openSuggestions && suggestions.length > 0 ? (
              <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-lg">
                {suggestions.map((s) => (
                  <li key={s.image}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applySuggestion(s);
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
                    >
                      <img src={s.image} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{s.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {s.variety} · {s.category}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </FormField>
        <FormField label="Variety / Grade" required error={errors.variety} htmlFor="variety">
          <Input id="variety" value={values.variety} onChange={set('variety')} placeholder="e.g. Pusa 1121" />
        </FormField>
      </div>

      {values.image ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-2 pr-3">
          <img src={values.image} alt="Product image" className="h-14 w-14 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <ImageIcon className="h-4 w-4 text-primary" />
              Product image auto-picked
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {values.name || 'This product'} — choose a different suggestion to change it.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setValues((v) => ({ ...v, image: '' }))}
            aria-label="Remove image"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Category" required error={errors.category} htmlFor="category">
          <Select value={values.category || 'none'} onValueChange={(v) => setSelect('category')(v === 'none' ? '' : v)}>
            <SelectTrigger id="category"><SelectValue placeholder="Choose category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Choose category</SelectItem>
              <SelectItem value="Grains & Pulses">Grains & Pulses</SelectItem>
              <SelectItem value="Vegetables">Vegetables</SelectItem>
              <SelectItem value="Fruits">Fruits</SelectItem>
              <SelectItem value="Spices">Spices</SelectItem>
              <SelectItem value="Oilseeds">Oilseeds</SelectItem>
              <SelectItem value="Dairy">Dairy</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Icon" htmlFor="icon">
          <Select value={values.icon} onValueChange={setSelect('icon')}>
            <SelectTrigger id="icon"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORY_ICONS.map((i) => (
                <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Unit" required htmlFor="unit">
          <Select value={values.unit} onValueChange={setSelect('unit')}>
            <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Price per unit (₹)" required error={errors.pricePerUnit} htmlFor="pricePerUnit">
          <Input id="pricePerUnit" type="number" min={0} value={values.pricePerUnit} onChange={set('pricePerUnit')} placeholder="e.g. 145" />
        </FormField>
        <FormField label={`Available stock (${values.unit})`} required error={errors.stockQuantity} htmlFor="stockQuantity">
          <Input id="stockQuantity" type="number" min={0} value={values.stockQuantity} onChange={set('stockQuantity')} placeholder="e.g. 500" />
        </FormField>
        <FormField label={`Minimum order (${values.unit})`} required error={errors.minOrderQuantity} htmlFor="minOrderQuantity">
          <Input id="minOrderQuantity" type="number" min={0} value={values.minOrderQuantity} onChange={set('minOrderQuantity')} placeholder="e.g. 10" />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Quality grade" htmlFor="quality">
          <Select value={values.quality} onValueChange={setSelect('quality')}>
            <SelectTrigger id="quality"><SelectValue /></SelectTrigger>
            <SelectContent>
              {QUALITIES.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Certification (comma separated)" htmlFor="certification" hint="e.g. NPOP Organic, FSSAI, GI">
          <Input id="certification" value={values.certification} onChange={set('certification')} placeholder="Optional" />
        </FormField>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Pickup address</p>
            <p className="text-xs text-muted-foreground">Auto-detect your current location or enter coordinates manually.</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={detectPickup} disabled={detecting}>
            {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {detecting ? 'Detecting…' : 'Detect my location'}
          </Button>
        </div>
        {detectedMsg ? (
          <p className={`mb-3 text-xs ${detectedMsg.startsWith('Could not') ? 'text-red-500' : 'text-emerald-600'}`}>
            {detectedMsg}
          </p>
        ) : values.locationText ? (
          <p className="mb-3 text-xs text-emerald-600">Pickup address: {values.locationText}</p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Pickup latitude" htmlFor="latitude" hint="Real coordinates where this produce is picked up.">
            <Input id="latitude" type="number" step="any" min={-90} max={90} value={values.latitude} onChange={set('latitude')} placeholder="e.g. 30.9010" />
          </FormField>
          <FormField label="Pickup longitude" htmlFor="longitude" hint="Real coordinates where this produce is picked up.">
            <Input id="longitude" type="number" step="any" min={-180} max={180} value={values.longitude} onChange={set('longitude')} placeholder="e.g. 75.8573" />
          </FormField>
        </div>
      </div>

      <FormField label="Description" required error={errors.description} htmlFor="description">
        <Textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={set('description')}
          placeholder="Describe quality, harvesting, packaging, and best use of this produce."
        />
      </FormField>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}