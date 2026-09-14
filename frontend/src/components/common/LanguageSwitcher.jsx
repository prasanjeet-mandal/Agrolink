import { Languages } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGES } from '@/i18n/dict';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LanguageSwitcher({ className }) {
  const { lang, setLang } = useLanguage();
  return (
    <Select value={lang} onValueChange={setLang}>
      <SelectTrigger
        aria-label="Select language"
        className={cn('h-9 w-36 gap-1.5 border-transparent bg-muted/60 px-3', className)}
      >
        <Languages className="h-4 w-4 shrink-0 text-primary" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}