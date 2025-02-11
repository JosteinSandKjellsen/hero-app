'use client';

interface SubmitButtonProps {
  children: React.ReactNode;
}

export function SubmitButton({ children }: SubmitButtonProps): JSX.Element {
  return (
    <button
      type="submit"
      className="comic-button"
    >
      {children}
    </button>
  );
}
