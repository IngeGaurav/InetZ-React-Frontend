import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import styles from './ErrorPage.module.css';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageTitle title="Something went wrong" />
      <div className={styles.container}>
        <AlertTriangle className={styles.icon} />
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.message}>An unexpected error occurred. Our team has been notified.</p>
        <div className={styles.actions}>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go back
          </Button>
          <Button onClick={() => navigate('/')}>Go home</Button>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
