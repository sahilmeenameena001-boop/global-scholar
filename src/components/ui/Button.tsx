"use client";
import { ArrowRight } from "lucide-react";
import { useRef, type ComponentProps } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useFinePointer } from "./fx";

type Variant = "primary" | "secondary" | "ghost" | "coral";

const shell: Record<Variant, string> = {
  primary: "bg-royal text-white",
  coral: "bg-coral text-white",
  secondary: "bg-white/[0.04] text-ivory ring-1 ring-inset ring-white/15 backdrop-blur-sm",
  ghost: "text-mist",
};
const wipe: Record<Variant, string> = {
  primary: "bg-royal-lit",
  coral: "bg-[#ff8577]",
  secondary: "bg-white/10",
  ghost: "bg-white/5",
};

type Props = {
  variant?: Variant;
  arrow?: boolean;
  href?: string;
  magnetic?: boolean;
  className?: string;
} & Omit<ComponentProps<"button">, "ref">;

/**
 * Fill wipes up from the bottom edge, the label slides out while a duplicate
 * slides in behind it, and primary CTAs can be magnetic on fine pointers only.
 */
export function Button({
  variant = "primary", arrow, href, magnetic = false, className = "", children, onClick, ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const pull = magnetic && fine && !reduce;

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!pull || rest.disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    gsap.to(e.currentTarget, {
      x: (e.clientX - (r.left + r.width / 2)) * 0.3,
      y: (e.clientY - (r.top + r.height / 2)) * 0.3,
      duration: 0.6, ease: "power3.out",
    });
  };
  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    if (!pull) return;
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
  };

  const hoverable = !rest.disabled;
  const cls = `group relative isolate inline-flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full px-7 text-sm font-semibold transition-shadow duration-300 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none ${shell[variant]} ${className}`;

  const inner = (
    <>
      <span aria-hidden className={`absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${hoverable ? "group-hover:scale-y-100" : ""} ${wipe[variant]}`} />
      <span className="relative block overflow-hidden">
        <span className={`flex items-center gap-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${hoverable ? "group-hover:-translate-y-[130%]" : ""}`}>
          {children}{arrow && <ArrowRight aria-hidden className="size-4" />}
        </span>
        <span aria-hidden className={`absolute inset-0 flex translate-y-[130%] items-center gap-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${hoverable ? "group-hover:translate-y-0" : ""}`}>
          {children}{arrow && <ArrowRight aria-hidden className="size-4" />}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={cls}
        onPointerMove={onMove} onPointerLeave={onLeave}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>
        {inner}
      </a>
    );
  }
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} className={cls}
      onPointerMove={onMove} onPointerLeave={onLeave} onClick={onClick} {...(rest as object)}>
      {inner}
    </button>
  );
}

/** Editorial link: the underline wipes in from the edge the cursor is closest to. */
export function TextLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={`group relative inline-block cursor-pointer py-1 text-ivory transition-colors hover:text-white ${className}`}>
      {children}
      <span aria-hidden className="absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-royal-lit transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-left group-hover:scale-x-100 group-focus-visible:scale-x-100" />
    </a>
  );
}
