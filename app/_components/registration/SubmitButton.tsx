'use client';

interface SubmitButtonProps {
  children: React.ReactNode;
}

export function SubmitButton({ children }: SubmitButtonProps): JSX.Element {
  return (
    <button
      type="submit"
      className="w-full text-light py-3 px-6 rounded-lg transition-all duration-300 
                bg-gradient-to-r from-purple to-blue bg-[length:200%_100%] bg-[position:0%] 
                hover:bg-[position:100%]
                font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
}
