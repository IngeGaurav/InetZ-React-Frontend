import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { EyeIcon } from '@/components/icons';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/validations/authValidations';
import { ROUTES } from '@/constants/routes';

const LoginPage = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setFormError('');
    try {
      await login(data);
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <>
      <PageTitle title="Sign In" />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box>
          <Typography variant="h2">Welcome back</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Sign in to your account to continue
          </Typography>
        </Box>

        {formError && <Alert severity="error">{formError}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <TextField
            label="Username"
            autoComplete="username"
            autoFocus
            error={!!errors.userName}
            helperText={errors.userName?.message}
            {...register('userName')}
          />

          <Box>
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        <EyeIcon size={16} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('password')}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Link component={RouterLink} to={ROUTES.FORGOT_PASSWORD} variant="body2">
                Forgot password?
              </Link>
            </Box>
          </Box>

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;
