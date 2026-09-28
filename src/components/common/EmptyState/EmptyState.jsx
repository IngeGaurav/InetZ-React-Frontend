import { cn } from '@/lib/utils';
import styles from './EmptyState.module.css';

const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={cn(styles.container, className)}>
    {Icon && <Icon className={styles.icon} aria-hidden />}
    <h3 className={styles.title}>{title}</h3>
    {description && <p className={styles.description}>{description}</p>}
    {action && <div className={styles.action}>{action}</div>}
  </div>
);

export { EmptyState };
