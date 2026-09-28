import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { FormInput } from '@/components/forms/FormInput/FormInput';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema } from '@/validations/authValidations';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import { getApiErrorMessage } from '@/api/helpers';
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const methods = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (submitted) {
    return (
      <div className={styles.successContainer}>
        <CheckCircle className={styles.successIcon} />
        <h2 className={styles.title}>Check your email</h2>
        <p className={styles.subtitle}>We've sent a password reset link to your email address.</p>
        <Link to={ROUTES.LOGIN}>
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Forgot Password" />
      <div className={styles.container}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Forgot your password?</h2>
          <p className={styles.subtitle}>Enter your email and we'll send you a reset link.</p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            <FormInput
              name="email"
              label="Email address"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        </FormProvider>

        <Link to={ROUTES.LOGIN} className={styles.backLink}>
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
