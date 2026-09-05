import { AtSign, Mail, MapPin, Phone, Share2, Video } from "lucide-react";
import { countries } from "@/data/countries";
import { activeSocials, brand, contact } from "@/data/site";
import { FlipList } from "../ui/FlipList";
import { LegalLinks } from "../ui/LegalLinks";
import { Logo } from "./Navbar";

const socialIcons = { instagram: AtSign, linkedin: Share2, youtube: Video } as const;

const cols = [
  { title: "Countries", links: countries.map((c) => ({ label: c.name, href: "#countries" })) },
  { title: "Services", links: [{ label: "Profile evaluation", href: "#quiz" }, { label: "University applications", href: "#journey" }, { label: "Scholarship guidance", href: "#scholarships" }, { label: "Visa support", href: "#journey" }, { label: "Pre-departure briefing", href: "#journey" }] },
  { title: "Resources", links: [{ label: "University match quiz", href: "#quiz" }, { label: "Student stories", href: "#stories" }, { label: "Meet the counsellors", href: "#counsellors" }, { label: "Book free counselling", href: "#counsellors" }] },
];

export function Footer() {
  return (
    <footer id="about" className="scroll-mt-24 border-t border-white/10 bg-raised pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">{brand.tagline}</p>
            <ul className="mt-6 space-y-2 text-sm text-mist">
              <li className="flex items-center gap-2"><Mail aria-hidden className="size-4 text-royal-lit" /><a href={`mailto:${contact.email}`} className="inline-block py-1.5 hover:text-royal-lit">{contact.email}</a></li>
              <li className="flex items-center gap-2"><Phone aria-hidden className="size-4 text-royal-lit" /><a href={`tel:${contact.phoneHref}`} className="inline-block py-1.5 hover:text-royal-lit">{contact.phone}</a></li>
              <li className="flex items-center gap-2"><MapPin aria-hidden className="size-4 text-royal-lit" /> {contact.address}</li>
            </ul>
            {activeSocials.length > 0 && (
              <ul className="mt-6 flex gap-3" aria-label="Social links">
                {activeSocials.map((s) => {
                  const I = socialIcons[s.icon];
                  return (
                    <li key={s.name}>
                      <a href={s.href} target="_blank" rel="me noopener noreferrer" aria-label={`${brand.name} on ${s.name}`} className="grid size-11 place-items-center rounded-full border border-white/15 text-ivory hover:border-royal hover:text-royal-lit">
                        <I aria-hidden className="size-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ivory">{c.title}</h2>
              {c.title === "Countries" ? (
                <FlipList items={c.links} />
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => <li key={l.label}><a href={l.href} className="inline-block py-1.5 text-sm text-mist hover:text-royal-lit">{l.label}</a></li>)}
                </ul>
              )}
            </nav>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-white/10 bg-surface p-5 text-xs leading-relaxed text-mist">
          <strong className="text-ivory">Disclaimer.</strong> Global Scholars provides counselling and application guidance only. University admission, scholarships and visas are subject to eligibility and to decisions by the relevant institutions and authorities. Country, tuition, scholarship, student and counsellor information on this page is illustrative demo content and must be verified before relying on it.
        </div>
        <div className="mt-8 flex flex-col gap-3 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. Fictional consultancy for demonstration.</p>
          <LegalLinks />
        </div>
      </div>
    </footer>
  );
}
