import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#DCEEE1] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-[#E8532E]/40 text-xs text-gray-400">
            Logo
          </div>
          <h1 className="text-2xl font-bold text-[#E8532E]">CatrachoGo</h1>
          <p className="text-sm text-gray-500">Tu viaje, a tu manera</p>
        </div>
        {children}
      </div>
    </div>
  );
}
