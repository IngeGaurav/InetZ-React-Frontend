import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { FormInput } from '@/components/forms/FormInput/FormInput';
import { FormPassword } from '@/components/forms/FormPassword/FormPassword';
import { FormCheckbox } from '@/components/forms/FormCheckbox/FormCheckbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/validations/authValidations';
import { ROUTES } from '@/constants/routes';
import { getApiErrorMessage } from '@/api/helpers';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { login } = useAuth();

  const methods = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <PageTitle title="Sign In" />
      <div className={styles.container}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to your account to continue</p>
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
            <FormPassword
              name="password"
              label="Password"
              placeholder="Enter your password"
              required
            />
            <div className={styles.formRow}>
              <FormCheckbox name="rememberMe" label="Remember me" />
              <Link to={ROUTES.FORGOT_PASSWORD} className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </FormProvider>
      </div>
    </>
  );
};

export default LoginPage;
