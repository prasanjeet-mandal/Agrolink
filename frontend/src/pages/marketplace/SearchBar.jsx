import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { marketplaceService } from '@/services/marketplaceService';
import { cn } from '@/utils/cn';

const TRENDING_SEARCHES = ['basmati', 'turmeric', 'tomato', 'grapes', 'potato', 'onion'];

export default function SearchBar({ value, onChange, onSearch, className, showTrending = false }) {
  const [suggestions, setSuggestions] = React.useState([]);
  const [focused, setFocused] = React.useState(false);
  const timer = React.useRef(null);

  React.useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }
    timer.current = setTimeout(async () => {
      try {
        const data = await marketplaceService.suggestions(value.trim());
        setSuggestions(data.slice(0, 5));
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer.current);
  }, [value]);

  const submit = (q) => {
    onSearch(q ?? value);
    setSuggestions([]);
    setFocused(false);
  };

  return (
    <div className={cn('relative', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-2 rounded-xl border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring"
      >
        <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Search produce, variety or category…"
          className="border-0 shadow-none focus-visible:ring-0"
        />
        <Button type="submit" className="shrink-0">
          Search
        </Button>
      </form>

      {focused && suggestions.length > 0 ? (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border bg-popover shadow-lg">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  submit(s.label.split(' (')[0]);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{s.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{s.category}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showTrending ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">Trending:</span>
          {TRENDING_SEARCHES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => submit(t)}
              className="rounded-full border px-2.5 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}