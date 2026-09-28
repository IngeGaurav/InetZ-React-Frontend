import { cn } from '@/lib/utils';
import styles from './Spinner.module.css';

const Spinner = ({ size = 'md', className }) => {
  const sizeMap = { sm: styles.sm, md: styles.md, lg: styles.lg };
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(styles.spinner, sizeMap[size], className)}
    />
  );
};

export { Spinner };
