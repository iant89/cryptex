import { IconButton } from '@enterprise-ui/react';
import { Moon, Sun } from 'lucide-react';
import { useThemePreference } from './ThemePreference';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemePreference();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <IconButton
      icon={theme === 'dark' ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
      label={`Switch to ${next} theme`}
      onClick={toggleTheme}
    />
  );
}
