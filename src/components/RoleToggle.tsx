interface RoleToggleProps {
  value: 'passenger' | 'driver';
  onChange: (role: 'passenger' | 'driver') => void;
}

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
      <button
        type="button"
        onClick={() => onChange('passenger')}
        className={`rounded-lg py-2 text-sm font-medium transition ${
          value === 'passenger' ? 'bg-brand text-white shadow' : 'text-gray-600 dark:text-gray-300'
        }`}
      >
        Pasajero
      </button>
      <button
        type="button"
        onClick={() => onChange('driver')}
        className={`rounded-lg py-2 text-sm font-medium transition ${
          value === 'driver' ? 'bg-brand text-white shadow' : 'text-gray-600 dark:text-gray-300'
        }`}
      >
        Conductor
      </button>
    </div>
  );
}
