import { useDispatch, useSelector } from 'react-redux';
import { Menu, Sun, Moon, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleMobileSidebar } from '@/redux/slices/sidebarSlice';
import { toggleTheme, selectIsDark } from '@/redux/slices/themeSlice';
import { useAuth } from '@/hooks/useAuth';
import { initials } from '@/utils/formatUtils';
import styles from './Header.module.css';

const Header = () => {
  const dispatch = useDispatch();
  const isDark = useSelector(selectIsDark);
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => dispatch(toggleMobileSidebar())}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className={styles.right}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleTheme())}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={styles.avatarBtn} aria-label="User menu">
              <Avatar className={styles.avatar}>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{initials(user?.name ?? 'User')}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export { Header };
