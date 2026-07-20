import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowDownCircle, ArrowLeft, ArrowUpCircle } from 'lucide-react';
import { getWalletBalance, getWalletTransactions, requestWithdrawal } from '../api/wallet';
import { translateWithdrawalError } from '../api/walletErrorMessages';
import { PayPalTopupButtons } from '../components/PayPalTopupButtons';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roleRoutes';
import type { WalletTransaction } from '../types/wallet';

const TRANSACTION_LABELS: Record<string, string> = {
  paypal_topup: 'Recarga PayPal',
  trip_charge: 'Pago de viaje',
  trip_payout: 'Cobro de viaje',
  withdrawal_adjustment: 'Retiro',
};

const PAGE_SIZE = 20;

export function WalletPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [topupAmount, setTopupAmount] = useState('200');
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalEmail, setWithdrawalEmail] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  const fetchBalance = useCallback(() => {
    getWalletBalance()
      .then((result) => setBalance(result.balance))
      .catch(() => toast.error('No se pudo cargar el saldo.'))
      .finally(() => setIsLoadingBalance(false));
  }, []);

  const refreshBalance = useCallback(() => {
    setIsLoadingBalance(true);
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    getWalletTransactions(page, PAGE_SIZE)
      .then((result) => {
        setTransactions(result.data);
        setTotal(result.total);
      })
      .catch(() => toast.error('No se pudo cargar el historial.'))
      .finally(() => setIsLoadingTransactions(false));
  }, [page]);

  function goToPage(newPage: number) {
    setIsLoadingTransactions(true);
    setPage(newPage);
  }

  async function handleWithdrawalSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(withdrawalAmount);
    if (!withdrawalEmail || !amount || amount <= 0) {
      toast.error('Completa el correo de PayPal y un monto válido.');
      return;
    }
    setIsSubmittingWithdrawal(true);
    try {
      await requestWithdrawal(withdrawalEmail, amount);
      toast.success('Solicitud de retiro enviada.');
      setShowWithdrawalForm(false);
      setWithdrawalEmail('');
      setWithdrawalAmount('');
      refreshBalance();
    } catch (error) {
      toast.error(translateWithdrawalError(error));
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const parsedTopupAmount = Number(topupAmount);

  return (
    <div className="min-h-screen bg-[#F6F1EC] p-4">
      <div className="mx-auto max-w-md">
        <Link
          to={user ? homePathForRole(user.role) : '/'}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="mb-4 text-xl font-bold text-gray-800">Mi Wallet</h1>

        <div className="mb-4 rounded-2xl bg-[#2DBE87] p-6 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Saldo disponible</p>
          <p className="mt-1 text-3xl font-bold">
            {isLoadingBalance || balance === null ? '...' : `L. ${balance.toFixed(2)}`}
          </p>
        </div>

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <label htmlFor="topup-amount" className="mb-2 block text-sm font-medium text-gray-700">
            Recargar con PayPal
          </label>
          <input
            id="topup-amount"
            type="number"
            min={1}
            step="0.01"
            value={topupAmount}
            onChange={(event) => setTopupAmount(event.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
          />
          <PayPalTopupButtons
            amount={parsedTopupAmount}
            onSuccess={(newBalance) => {
              setBalance(newBalance);
              setPage(1);
            }}
          />
        </div>

        {user?.role === 'driver' && (
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
            {!showWithdrawalForm ? (
              <button
                type="button"
                onClick={() => setShowWithdrawalForm(true)}
                className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Solicitar retiro
              </button>
            ) : (
              <form onSubmit={handleWithdrawalSubmit} className="flex flex-col gap-3">
                <div>
                  <label htmlFor="withdrawal-email" className="mb-1 block text-xs font-medium text-gray-600">
                    Correo de PayPal
                  </label>
                  <input
                    id="withdrawal-email"
                    type="email"
                    required
                    value={withdrawalEmail}
                    onChange={(event) => setWithdrawalEmail(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
                  />
                </div>
                <div>
                  <label htmlFor="withdrawal-amount" className="mb-1 block text-xs font-medium text-gray-600">
                    Monto (L.)
                  </label>
                  <input
                    id="withdrawal-amount"
                    type="number"
                    min={1}
                    step="0.01"
                    required
                    value={withdrawalAmount}
                    onChange={(event) => setWithdrawalAmount(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E8532E] focus:outline-none focus:ring-1 focus:ring-[#E8532E]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawalForm(false)}
                    className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingWithdrawal}
                    className="flex-1 rounded-lg bg-[#E8532E] py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isSubmittingWithdrawal ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Historial de movimientos</p>
          {isLoadingTransactions ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-gray-400">Todavía no tienes movimientos.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {tx.amount >= 0 ? (
                      <ArrowDownCircle className="h-5 w-5 text-[#2DBE87]" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm text-gray-800">{TRANSACTION_LABELS[tx.type] ?? tx.type}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('es-HN')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-[#2DBE87]' : 'text-red-500'}`}>
                    {tx.amount >= 0 ? '+' : ''}
                    L. {tx.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="text-gray-600 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-gray-400">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="text-gray-600 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
