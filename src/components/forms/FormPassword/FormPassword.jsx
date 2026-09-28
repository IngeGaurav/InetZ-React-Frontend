import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import styles from './FormPassword.module.css';

const FormPassword = ({
  name,
  label,
  placeholder = 'Enter password',
  hint,
  required,
  disabled,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <Label htmlFor={name} className={cn(styles.label, required && styles.required)}>
          {label}
        </Label>
      )}
      <div className={styles.inputWrapper}>
        <Input
          id={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={cn(styles.input, error && styles.inputError)}
          {...register(name)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={styles.toggle}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p id={`${name}-error`} role="alert" className={styles.error}>
          {error.message}
        </p>
      )}
    </div>
  );
};

export { FormPassword };
