import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import styles from './FormTextarea.module.css';

const FormTextarea = ({
  name,
  label,
  placeholder,
  hint,
  required,
  disabled,
  rows = 4,
  className,
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
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className={cn(styles.textarea, error && styles.textareaError)}
        {...register(name)}
      />
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p role="alert" className={styles.error}>
          {error.message}
        </p>
      )}
    </div>
  );
};

export { FormTextarea };
