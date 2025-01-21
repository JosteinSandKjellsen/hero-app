'use client';

interface SubmitButtonProps {
  children: React.ReactNode;
}

export function SubmitButton({ children }: SubmitButtonProps): JSX.Element {
  return (
    <button
      type="submit"
      className="w-full text-light py-3 px-6 rounded-lg transition-all duration-300 
                bg-dark
                font-medium
                transform hover:-translate-y-0.5
                animate-glow-wave
                relative
                hover:bg-opacity-90
                border border-white/40
                outline-none
                focus:outline-none"
    >
      {children}
    </button>
  );
}
