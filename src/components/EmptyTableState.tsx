import type { LucideIcon } from 'lucide-react';

interface EmptyTableStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  colSpan: number;
}

export function EmptyTableState({ icon: Icon, title, description, colSpan }: EmptyTableStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand">
            <Icon className="h-6 w-6" />
          </span>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
      </td>
    </tr>
  );
}
