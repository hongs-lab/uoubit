import type { ReactNode } from 'react';
import * as s from './Panel.css';

interface Props {
  title?: ReactNode;
  note?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Panel({
  title,
  note,
  flush = false,
  className,
  children,
}: Props) {
  return (
    <section className={className ? `${s.panel} ${className}` : s.panel}>
      {title && (
        <header className={s.head}>
          <h2 className={s.title}>{title}</h2>
          {note && <span className={s.note}>{note}</span>}
        </header>
      )}
      {flush ? children : <div className={s.bodyPad}>{children}</div>}
    </section>
  );
}
