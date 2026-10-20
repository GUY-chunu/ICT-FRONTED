import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { parseNum } from "@/lib/utils";

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{label}</span>
      {children}
      {hint ? <span className="text-xs text-subtle">{hint}</span> : null}
    </div>
  );
}

export function NumField({
  label,
  value,
  onChange,
  step = "any",
  placeholder,
  className,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
  step?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <Input
        inputMode="decimal"
        step={step}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(parseNum(e.target.value))}
      />
    </Field>
  );
}

export interface PanelProps {
  title?: string;
  kicker?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Panel({
  title,
  kicker,
  children,
  action,
  className,
}: PanelProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card/95 via-card/80 to-card/60 p-5 shadow-lg shadow-black/25 backdrop-blur-md transition-all duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent sm:p-6",
        className,
      )}
    >
      {(title || action || kicker) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {kicker ? (
              <p className="text-xs font-semibold tracking-wider text-accent/80 uppercase">{kicker}</p>
            ) : null}
            {title ? <h2 className="font-display text-2xl font-normal tracking-wide text-foreground">{title}</h2> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
  multiple = false,
}: {
  options: readonly T[] | readonly { value: T; label: string }[];
  value: T | T[] | "";
  onChange: (next: T | T[]) => void;
  multiple?: boolean;
}) {
  const items = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);

  function toggle(v: T) {
    if (multiple) {
      const next = new Set(selected);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      onChange([...next] as T[]);
    } else {
      onChange(v);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((o) => {
        const on = selected.has(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={cn(
              "h-9 rounded-full px-3.5 text-xs font-medium border transition-all duration-150 active:scale-95",
              on
                ? "bg-accent text-accent-foreground border-accent font-semibold shadow-sm shadow-accent/15"
                : "bg-surface-2/90 text-foreground/80 border-white/[0.08] hover:bg-surface-2 hover:border-white/[0.2] hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function BoolRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex h-11 items-center justify-between rounded-xl px-3.5 text-left text-sm border transition-all duration-150 active:scale-[0.99]",
        value
          ? "bg-up/[0.08] text-foreground border-up/30 shadow-sm shadow-up/5"
          : "bg-surface-2/90 text-foreground/80 border-white/[0.08] hover:border-white/[0.18]",
      )}
    >
      <span>{label}</span>
      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", value ? "text-up bg-up/10 border-up/20" : "text-subtle bg-white/[0.04] border-white/[0.06]")}>
        {value ? "Yes" : "No"}
      </span>
    </button>
  );
}

export function TriRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-surface-2/60 px-3.5 py-2.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1.5">
        {(
          [
            [true, "Correct"],
            [false, "Wrong"],
            [null, "—"],
          ] as const
        ).map(([v, lab]) => (
          <button
            key={lab}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-medium border transition-all active:scale-95",
              value === v
                ? v === true
                  ? "bg-up/15 text-up border-up/30 shadow-sm shadow-up/10 font-semibold"
                  : v === false
                    ? "bg-down/15 text-down border-down/30 shadow-sm shadow-down/10 font-semibold"
                    : "bg-accent text-accent-foreground border-accent shadow-sm font-semibold"
                : "bg-surface-2/90 text-foreground/75 border-white/[0.08] hover:border-white/[0.2] hover:text-foreground",
            )}
          >
            {lab}
          </button>
        ))}
      </div>
    </div>
  );
}
