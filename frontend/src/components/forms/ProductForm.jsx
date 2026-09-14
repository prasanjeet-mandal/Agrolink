import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from './FormField';
import { validateForm, required, validatePositiveNumber } from '@/utils/validation';

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
};

export default function ProductForm({ initial, submitLabel = 'Save product', submitting, onSubmit }) {
  const [values, setValues] = React.useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = React.useState({});

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const setSelect = (key) => (value) => setValues((v) => ({ ...v, [key]: value }));

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
        <FormField label="Product name" required error={errors.name} htmlFor="name">
          <Input id="name" value={values.name} onChange={set('name')} placeholder="e.g. Basmati Rice (Premium)" />
        </FormField>
        <FormField label="Variety / Grade" required error={errors.variety} htmlFor="variety">
          <Input id="variety" value={values.variety} onChange={set('variety')} placeholder="e.g. Pusa 1121" />
        </FormField>
      </div>

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