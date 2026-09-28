import { useFormContext, Controller } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import styles from './FormSwitch.module.css';

const FormSwitch = ({ name, label, hint, disabled, className }) => {
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
            <Switch
              id={name}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
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

export { FormSwitch };
