import { Spinner } from '@/components/common/Spinner/Spinner';
import styles from './Loader.module.css';

/**
 * Full-page or section blocking loader.
 * Use for initial page loads and route transitions.
 * For inline loading states, use <Spinner> directly.
 */
const Loader = ({ text = 'Loading...' }) => (
  <div className={styles.container} role="status" aria-live="polite">
    <Spinner size="lg" />
    <p className={styles.text}>{text}</p>
  </div>
);

export { Loader };
