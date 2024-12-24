interface SubmitButtonProps {
  children: React.ReactNode;
}

export function SubmitButton({ children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 
                rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 
                font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
}