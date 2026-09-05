"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "@/data/content";
import { useActiveSection } from "@/lib/useActiveSection";
import { Button } from "../ui/Button";

export function Logo({ light }: { light?: boolean }) {
  return (
    <a href="#top" className={`group flex items-center gap-2.5 font-serif text-xl font-semibold ${light ? "text-white" : "text-ivory"}`} aria-label="Global Scholars home">
      <span className="grid size-9 place-items-center rounded-full bg-royal text-white transition-transform duration-500 group-hover:rotate-[20deg]">
        <Globe2 aria-hidden className="size-5" />
      </span>
      Global Scholars
    </a>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(navLinks.map((l) => l.href.slice(1)), "");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-void/70 shadow-[0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl" : "bg-transparent"}`}>
      <nav aria-label="Main" className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 sm:px-8 ${scrolled ? "py-3" : "py-6"}`}>
        <Logo />
        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((l) => {
            const on = active === l.href.slice(1);
            return (
              <li key={l.href}>
                <a href={l.href} aria-current={on ? "true" : undefined}
                  className={`relative py-1 text-sm font-medium transition-colors duration-200 ${on ? "text-ivory" : "text-mist hover:text-ivory"}`}>
                  {l.label}
                  {on && <motion.span layoutId="nav-active" aria-hidden className="absolute -bottom-0.5 left-0 h-px w-full bg-royal-lit" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="hidden lg:block">
          <Button href="#counsellors" magnetic className="min-h-11 px-6">Book Free Counselling</Button>
        </div>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-11 cursor-pointer place-items-center rounded-full text-ivory transition-colors hover:bg-white/10 lg:hidden">
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-void/95 backdrop-blur-xl lg:hidden">
            <ul className="space-y-1 px-5 py-4">
              {navLinks.map((l) => {
                const on = active === l.href.slice(1);
                return (
                  <li key={l.href}>
                    <a href={l.href} onClick={() => setOpen(false)} aria-current={on ? "true" : undefined}
                      className={`block rounded-xl border-l-2 px-3 py-3 text-base font-medium transition-colors ${on ? "border-royal-lit bg-white/[0.06] text-ivory" : "border-transparent text-mist hover:bg-white/5"}`}>
                      {l.label}
                    </a>
                  </li>
                );
              })}
              <li className="pt-2"><Button href="#counsellors" className="w-full" onClick={() => setOpen(false)}>Book Free Counselling</Button></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
