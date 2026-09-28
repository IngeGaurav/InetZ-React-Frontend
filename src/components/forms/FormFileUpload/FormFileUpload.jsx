import { useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Upload, X, File } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/utils/formatUtils';
import styles from './FormFileUpload.module.css';

const FormFileUpload = ({ name, label, accept, hint, required, disabled, className }) => {
  const inputRef = useRef(null);
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={cn(styles.field, className)}>
      {label && <Label className={cn(styles.label, required && styles.required)}>{label}</Label>}
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <>
            <div
              className={cn(styles.dropzone, error && styles.dropzoneError)}
              onClick={() => !disabled && inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
            >
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                disabled={disabled}
                className={styles.hiddenInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(file);
                  }
                }}
              />
              {value ? (
                <div className={styles.fileInfo}>
                  <File className={styles.fileIcon} />
                  <div className={styles.fileMeta}>
                    <span className={styles.fileName}>{value.name}</span>
                    <span className={styles.fileSize}>{formatFileSize(value.size)}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(null);
                      if (inputRef.current) {
                        inputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className={styles.placeholder}>
                  <Upload className={styles.uploadIcon} />
                  <p className={styles.uploadText}>
                    Click to upload <span className={styles.uploadLink}>or drag & drop</span>
                  </p>
                  {accept && <p className={styles.acceptedTypes}>{accept}</p>}
                </div>
              )}
            </div>
          </>
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

export { FormFileUpload };
