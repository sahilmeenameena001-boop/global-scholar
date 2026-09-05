"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { motion } from "framer-motion";

type Item = { label: string; href: string };

/**
 * Split-flap departures board. Each row flips down from the back once,
 * the first time the footer scrolls into view.
 */
export function FlipList({ items }: { items: Item[] }) {
  const reduce = useReducedMotion();
  return (
    <motion.ul
      className="mt-4 space-y-2.5"
      initial="rest"
      whileInView="flip"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ rest: {}, flip: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
    >
      {items.map((l) => (
        <li key={l.label} className="[perspective:520px]">
          <motion.span
            className="block origin-top"
            variants={{
              rest: reduce ? {} : { rotateX: -92, opacity: 0 },
              flip: { rotateX: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
            }}
          >
            <a href={l.href} className="inline-block py-1.5 text-sm text-mist hover:text-royal-lit">{l.label}</a>
          </motion.span>
        </li>
      ))}
    </motion.ul>
  );
}
