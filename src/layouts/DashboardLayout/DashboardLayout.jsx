import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSidebarCollapsed } from '@/redux/slices/sidebarSlice';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  const isCollapsed = useSelector(selectSidebarCollapsed);

  return (
    <div className={styles.root}>
      <Sidebar />
      <div className={cn(styles.body, isCollapsed && styles.bodyCollapsed)}>
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export { DashboardLayout };
