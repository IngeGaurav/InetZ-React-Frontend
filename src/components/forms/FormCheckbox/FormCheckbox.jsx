import { useFormContext, Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import styles from './FormCheckbox.module.css';

const FormCheckbox = ({ name, label, hint, disabled, className }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={cn(styles.field, className)}>
      <div className={styles.row}>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Checkbox
              id={name}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!error}
            />
          )}
        />
        {label && (
          <Label htmlFor={name} className={styles.label}>
            {label}
          </Label>
        )}
      </div>
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p role="alert" className={styles.error}>
          {error.message}
        </p>
      )}
    </div>
  );
};

export { FormCheckbox };
