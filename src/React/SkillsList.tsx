import { useState } from "react";

/**
 * "What I do" — recruiter-scannable. Three expandable rows;
 * first row starts open so the section is never empty on load.
 */

const CategoryIcons = {
  "Web Development": (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--acid)]">
      <path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>
    </svg>
  ),
  "Mobile & Cross-Platform": (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--acid)]">
      <rect width="7" height="12" x="9" y="2" rx="2"/><path d="M12 18v2"/>
    </svg>
  ),
  "Systems & Tooling": (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--acid)]">
      <path d="M4 17V7"/><path d="M8 17V9"/><path d="M12 17V13"/><path d="M16 17V5"/><path d="M20 17v-3"/>
    </svg>
  ),
} as const;

const SkillsList = () => {
  const [openItem, setOpenItem] = useState<string>("Web Development");

  const skills: Record<string, { items: string[]; proof: string }> = {
    "Web Development": {
      items: [
        "React / Next.js SPAs and marketing sites",
        "Astro for fast, content-first pages",
        "TypeScript, TailwindCSS, accessible markup",
      ],
      proof: "HRMS/POS — live",
    },
    "Mobile & Cross-Platform": {
      items: [
        "Android apps with Capacitor + WebView",
        "Push notifications (FCM) and deep links",
        "Mobile-first responsive interfaces",
      ],
      proof: "Barangay Resolve — live on web + Android",
    },
    "Systems & Tooling": {
      items: [
        "MySQL schemas, Prisma, REST APIs",
        "Firebase / Supabase auth & realtime",
        "CI/CD on GitHub Actions, deploys on Vercel/Render",
      ],
      proof: "Deployed & maintained",
    },
  };

  return (
    <div>
      <h3 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
        What I do
      </h3>
      <p className="mt-3 max-w-lg text-[var(--ink-dim)]">
        Three lanes, one standard: it works, it's fast, and nobody has
        to babysit it.
      </p>

      <ul className="mt-8 space-y-3">
        {Object.entries(skills).map(([category, { items, proof }]) => {
          const open = openItem === category;
          return (
            <li key={category}>
              <button
                type="button"
                onClick={() => setOpenItem(open ? "" : category)}
                aria-expanded={open}
                className="flex w-full items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-left transition-all duration-300 hover:border-[var(--acid)]/35"
              >
                <span className="shrink-0">
                  {CategoryIcons[category as keyof typeof CategoryIcons]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-medium text-[var(--ink)]">
                    {category}
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
                    {proof}
                  </span>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 text-[var(--ink-dim)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              <div
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                style={{
                  gridTemplateRows: open ? "1fr" : "0fr",
                  opacity: open ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <ul className="space-y-2 px-5 pb-5 pt-1 text-[var(--ink-dim)]">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--acid)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SkillsList;
