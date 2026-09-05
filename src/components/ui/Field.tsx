import type { ComponentProps } from "react";

type Base = { label: string; error?: string; id: string };
const inputCls = (err?: string) =>
  `mt-1.5 min-h-12 w-full rounded-xl bg-white/[0.04] px-4 text-sm text-ivory ring-1 ring-inset transition-shadow duration-200 placeholder:text-faint focus:ring-2 ${
    err ? "ring-coral" : "ring-white/15 focus:ring-royal-lit"
  }`;

export function Input({ label, error, id, ...rest }: Base & ComponentProps<"input">) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-mist">{label}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={inputCls(error)} {...rest} />
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-medium text-coral">{error}</p>}
    </div>
  );
}

export function Select({ label, error, id, children, ...rest }: Base & ComponentProps<"select">) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-mist">{label}</label>
      <select id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={`${inputCls(error)} [&>option]:bg-surface [&>option]:text-ivory`} {...rest}>
        {children}
      </select>
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-medium text-coral">{error}</p>}
    </div>
  );
}

export function SuccessState({ title, text }: { title: string; text: string }) {
  return (
    <div role="status" className="rounded-2xl bg-royal/10 p-6 text-center ring-1 ring-inset ring-royal-lit/30">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-royal text-white">
        <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
      </div>
      <h4 className="font-serif text-xl text-ivory">{title}</h4>
      <p className="mt-2 text-sm text-mist">{text}</p>
    </div>
  );
}
