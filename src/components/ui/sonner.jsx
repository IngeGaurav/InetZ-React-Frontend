import { Toaster as Sonner } from 'sonner';
import { useSelector } from 'react-redux';
import { selectIsDark } from '@/redux/slices/themeSlice';

/**
 * Toaster wrapper that syncs the Sonner theme with the Redux dark mode state.
 * Place this once in App.jsx (inside the Redux Provider).
 */
const Toaster = ({ ...props }) => {
  const isDark = useSelector(selectIsDark);

  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
