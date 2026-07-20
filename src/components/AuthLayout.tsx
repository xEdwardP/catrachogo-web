import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F1EC] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center gap-2">
          <img src="/logo_without_text.png" alt="CatrachoGo" className="h-16 w-16" />
          <h1 className="text-2xl font-bold text-[#E8532E]">CatrachoGo</h1>
          <p className="text-sm text-gray-500">Tu viaje, a tu manera</p>
        </div>
        {children}
      </div>
    </div>
  );
}
