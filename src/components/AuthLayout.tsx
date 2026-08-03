import type { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream p-4 dark:bg-gray-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-success/10 blur-3xl"
      />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-brand/5 ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10">
        <div className="mb-8 flex flex-col items-center gap-2">
          <img src="/logo_without_text.png" alt="CatrachoGo" className="h-16 w-16" />
          <h1 className="text-2xl font-bold text-brand">CatrachoGo</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tu viaje, a tu manera</p>
        </div>
        {children}
      </div>
    </div>
  );
}
