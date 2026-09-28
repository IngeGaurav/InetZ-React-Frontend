import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import styles from './FormInput.module.css';

/**
 * Controlled text input wired to React Hook Form via context.
 *
 * MUST be used inside a <FormProvider> (or <form> returned by useForm()).
 * The `name` prop maps to the field name in the schema and form values.
 */
const FormInput = ({
  name,
  label,
  placeholder,
  type = 'text',
  hint,
  required,
  disabled,
  className,
  inputClassName,
  ...rest
}) => {
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
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={cn(error && styles.inputError, inputClassName)}
        {...register(name)}
        {...rest}
      />
      {hint && !error && (
        <p id={`${name}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} role="alert" className={styles.error}>
          {error.message}
        </p>
      )}
    </div>
  );
};

export { FormInput };
