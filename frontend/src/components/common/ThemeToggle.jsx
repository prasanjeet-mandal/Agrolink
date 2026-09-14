import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

export default function ThemeToggle({ className }) {
  const { dark, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn('relative group', className)}
      aria-label={dark ? 'Switch to day mode' : 'Switch to night mode'}
    >
      <Sun
        className={cn(
          'absolute h-5 w-5 transition-all duration-300 group-hover:rotate-45',
          dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
        )}
      />
      <Moon
        className={cn(
          'h-5 w-5 transition-all duration-300 group-hover:-rotate-12',
          dark ? 'rotate-0 scale-50 opacity-0' : '-rotate-0 scale-100 opacity-100'
        )}
      />
    </Button>
  );
}