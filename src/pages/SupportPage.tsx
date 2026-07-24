import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roleRoutes';

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: '¿Cómo recargo mi wallet?',
    answer:
      'Ve a la sección Wallet desde el ícono en la parte superior y usa el botón "Recargar con PayPal". El saldo se refleja de inmediato después de confirmar el pago.',
  },
  {
    question: '¿Por qué necesito saldo antes de pedir un viaje?',
    answer:
      'CatrachoGo cobra la tarifa desde tu wallet al completar el viaje, así que necesitas saldo suficiente para cubrir la tarifa estimada antes de solicitarlo.',
  },
  {
    question: '¿Qué pasa si cancelo un viaje?',
    answer:
      'Cancelar mientras buscas conductor es gratis. Si ya tienes un conductor en camino, se aplica un cargo fijo como compensación para el conductor.',
  },
  {
    question: '¿Cómo me convierto en conductor?',
    answer:
      'Regístrate como conductor y completa tu perfil con tus documentos y los de tu vehículo. Un administrador revisa y aprueba tu cuenta antes de que puedas conectarte a recibir viajes.',
  },
  {
    question: '¿Cuándo puedo ver el teléfono de mi conductor o pasajero?',
    answer:
      'Por seguridad, el número de teléfono solo se muestra una vez que el viaje fue aceptado por un conductor y mientras está en curso.',
  },
  {
    question: '¿Cómo retiro mis ganancias como conductor?',
    answer:
      'Desde la sección Wallet, usa el botón "Solicitar retiro" e indica tu correo de PayPal y el monto. Un administrador procesa la solicitud.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-gray-800"
      >
        {question}
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <p className="mt-2 text-sm text-gray-500">{answer}</p>}
    </div>
  );
}

export function SupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="mx-auto max-w-md">
        {user ? (
          <Link
            to={homePathForRole(user.role)}
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        )}

        <h1 className="mb-4 text-xl font-bold text-gray-800">Ayuda y soporte</h1>

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-gray-700">¿Necesitas ayuda?</p>
          <p className="mb-3 text-sm text-gray-500">
            Escríbenos y te responderemos lo antes posible.
          </p>
          {SUPPORT_EMAIL && (
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-2 rounded-lg bg-brand-pale px-3 py-2.5 text-sm font-medium text-brand"
            >
              <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
            </a>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-gray-700">Preguntas frecuentes</p>
          <div>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
