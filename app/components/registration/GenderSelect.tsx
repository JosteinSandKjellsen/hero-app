import { FC, ChangeEvent } from 'react';

interface GenderSelectProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const genderOptions = [
  { value: 'male', label: 'Mann' },
  { value: 'female', label: 'Kvinne' },
];

export const GenderSelect: FC<GenderSelectProps> = ({ 
  value, 
  onChange, 
  error 
}): JSX.Element => {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1">
        Kjønn
      </label>
      <div className="flex gap-4">
        {genderOptions.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="radio"
              name="gender"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500 bg-white/10 border-white/20"
            />
            <span className="ml-2 text-white">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-300">{error}</p>
      )}
    </div>
  );
};
