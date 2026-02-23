'use client';

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function GuessInput({ onSubmit, disabled, placeholder = '0123' }: GuessInputProps) {
  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<{ guess: string }>({
    defaultValues: { guess: '' },
  });

  const validate = (v: string) => {
    if (v.length !== 4) return 'Enter 4 digits';
    if (!/^\d+$/.test(v)) return 'Only numbers';
    if (new Set(v.split('')).size !== 4) return 'All digits must be unique';
    return true;
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const err = validate(data.guess);
        if (err !== true) {
          setError('guess', { message: err as string });
          return;
        }
        onSubmit(data.guess);
        setValue('guess', '');
      })}
      className="flex flex-wrap items-center justify-center gap-3"
    >
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        placeholder={placeholder}
        disabled={disabled}
        className="input-digit"
        {...register('guess', {
          required: 'Required',
          minLength: { value: 4, message: '4 digits' },
          maxLength: { value: 4, message: '4 digits' },
          pattern: { value: /^\d*$/, message: 'Numbers only' },
          validate: (v) => {
            if (!v || v.length !== 4) return true;
            if (new Set(v).size !== 4) return 'Unique digits only';
            return true;
          },
        })}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 4);
          e.target.value = v;
          setValue('guess', v, { shouldValidate: true });
        }}
      />
      <motion.button
        type="submit"
        disabled={disabled}
        className="btn-primary"
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        Guess
      </motion.button>
      {errors.guess && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 dark:text-red-400 text-sm w-full text-center"
        >
          {errors.guess.message}
        </motion.span>
      )}
    </form>
  );
}
