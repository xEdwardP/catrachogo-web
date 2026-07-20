import { useAuth } from '../hooks/useAuth';

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F6F1EC] p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <p className="text-sm text-gray-500">Hola, {user?.name}</p>
        <h1 className="mt-1 text-xl font-bold text-[#E8532E]">{title}</h1>
        <p className="mt-3 text-sm text-gray-600">{description}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
