'use client';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, ...props }: FormFieldProps): JSX.Element {
  return (
    <div>
      <label htmlFor={props.id} className="flex items-center text-lg text-dark mb-2 uppercase min-h-[2rem] font-wild-words">
        {label}
      </label>
      <input
        {...props}
        className="comic-input"
      />
      {error && (
        <p className="mt-2 text-sm font-bold text-red-600">{error}</p>
      )}
    </div>
  );
}
