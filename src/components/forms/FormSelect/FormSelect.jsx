import { useFormContext, Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import styles from './FormSelect.module.css';

/**
 * @param {Array<{value: string, label: string}>} options
 */
const FormSelect = ({
  name,
  label,
  placeholder = 'Select an option',
  options = [],
  hint,
  required,
  disabled,
  className,
}) => {
  const {
    control,
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
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={disabled}>
            <SelectTrigger
              id={name}
              aria-invalid={!!error}
              className={cn(error && styles.triggerError)}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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

export { FormSelect };
