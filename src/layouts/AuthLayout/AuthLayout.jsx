import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

/**
 * Wraps public auth pages (Login, Forgot Password, Reset Password).
 * Centres content vertically and horizontally, with a split-panel design.
 */
const AuthLayout = () => (
  <div className={styles.container}>
    <aside className={styles.brand}>
      <div className={styles.brandContent}>
        <h1 className={styles.logo}>Ienerz</h1>
        <p className={styles.tagline}>Enterprise-grade management, simplified.</p>
      </div>
    </aside>
    <main className={styles.form}>
      <div className={styles.formInner}>
        <Outlet />
      </div>
    </main>
  </div>
);

export { AuthLayout };
