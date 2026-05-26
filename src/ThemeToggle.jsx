import { useTheme } from './useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'var(--accent-bg)',
        border: '1px solid var(--accent)',
        padding: '8px 20px',
        borderRadius: '999px',
        cursor: 'pointer',
        color: 'var(--accent-text)',
        fontWeight: '700',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.1)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'var(--accent)';
        e.currentTarget.style.color = 'white';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'var(--accent-bg)';
        e.currentTarget.style.color = 'var(--accent-text)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

