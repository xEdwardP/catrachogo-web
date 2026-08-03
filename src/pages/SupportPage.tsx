import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roleRoutes';
import { LEGAL_DOCUMENTS } from '../data/legalContent';
import type { LegalDocId } from '../data/legalContent';
import { ThemeToggle } from '../components/ThemeToggle';

const LEGAL_DOC_IDS = Object.keys(LEGAL_DOCUMENTS) as LegalDocId[];

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
    <div className="border-b border-gray-100 py-3 last:border-0 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-gray-800 dark:text-gray-100"
      >
        {question}
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition dark:text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{answer}</p>}
    </div>
  );
}

export function SupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream p-4 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-md lg:max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          {user ? (
            <Link
              to={homePathForRole(user.role)}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
          )}
          <ThemeToggle />
        </div>

        <h1 className="mb-4 text-xl font-bold text-gray-800 lg:mb-6 dark:text-gray-100">Ayuda y soporte</h1>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
            <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">¿Necesitas ayuda?</p>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Escríbenos y te responderemos lo antes posible.
            </p>
            {SUPPORT_EMAIL && (
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-2 rounded-lg bg-brand-pale px-3 py-2.5 text-sm font-medium text-brand dark:bg-brand/15"
              >
                <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
              </a>
            )}
          </div>

          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm lg:row-span-2 lg:mb-0 dark:bg-gray-900">
            <p className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">Preguntas frecuentes</p>
            <div>
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
            <p className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">Legal</p>
            <div className="flex flex-col">
              {LEGAL_DOC_IDS.map((id) => (
                <Link
                  key={id}
                  to={`/legal/${id}`}
                  className="flex items-center justify-between border-b border-gray-100 py-3 text-sm text-gray-700 last:border-0 hover:text-brand dark:border-gray-800 dark:text-gray-200"
                >
                  {LEGAL_DOCUMENTS[id].title}
                  <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
