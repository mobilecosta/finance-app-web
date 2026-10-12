import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** Cabeçalho de página responsivo: empilha título + ação no celular. */
export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="min-w-0">
        <h1 className="page-title truncate sm:whitespace-normal">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
