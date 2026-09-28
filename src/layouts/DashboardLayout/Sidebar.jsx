import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, Users, Settings, X, ChevronLeft } from 'lucide-react';
import {
  selectSidebarCollapsed,
  selectMobileSidebarOpen,
  toggleSidebar,
  closeMobileSidebar,
} from '@/redux/slices/sidebarSlice';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const isCollapsed = useSelector(selectSidebarCollapsed);
  const isMobileOpen = useSelector(selectMobileSidebarOpen);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => dispatch(closeMobileSidebar())}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          styles.sidebar,
          isCollapsed && styles.collapsed,
          isMobileOpen && styles.mobileOpen
        )}
        aria-label="Main navigation"
      >
        <div className={styles.header}>
          {!isCollapsed && <span className={styles.brand}>Ienerz</span>}
          <button
            className={cn(styles.toggleBtn, 'hidden md:flex')}
            onClick={() => dispatch(toggleSidebar())}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(styles.toggleIcon, isCollapsed && styles.toggleIconFlipped)}
            />
          </button>
          <button
            className={cn(styles.closeBtn, 'md:hidden')}
            onClick={() => dispatch(closeMobileSidebar())}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(styles.link, isActive && styles.linkActive)}
              title={isCollapsed ? label : undefined}
              onClick={() => dispatch(closeMobileSidebar())}
            >
              <Icon className={styles.linkIcon} aria-hidden />
              {!isCollapsed && <span className={styles.linkLabel}>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export { Sidebar };
