import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { ROUTES } from '@/constants/routes';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => (
  <>
    <PageTitle title="404 — Page Not Found" />
    <div className={styles.container}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.message}>
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.DASHBOARD}>
        <Button>
          <Home className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </Link>
    </div>
  </>
);

export default NotFoundPage;
