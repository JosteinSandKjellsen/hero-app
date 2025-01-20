'use client';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, ...props }: FormFieldProps): JSX.Element {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-light mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 
                  focus:ring-2 focus:ring-purple focus:border-transparent 
                  transition-colors text-light placeholder-light/50"
      />
      {error && (
        <p className="mt-1 text-sm text-red">{error}</p>
      )}
    </div>
  );
}
