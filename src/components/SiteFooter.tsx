import { Link } from "react-router-dom";

const cols = [
  {
    title: "Platform",
    links: [
      { to: "/directory", label: "Browse Directory" },
      { to: "/requests", label: "Post a Job" },
      { to: "/leads", label: "Opportunities (find work)" },
      { to: "/pricing", label: "Pricing" },
      { to: "/list", label: "List Your Business" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms of Service" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/acceptable-use", label: "Acceptable Use" },
      { to: "/shipping", label: "Service Delivery" },
      { to: "/returns", label: "Refunds & Cancellations" },
    ],
  },
];

export const SiteFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-[#050505] text-white">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-4">
            <Link to="/" className="inline-block" aria-label="Sjoh home">
              <span className="font-display text-4xl font-black tracking-normal text-white">
                sjoh<span className="text-sa-gold">!</span>
              </span>
            </Link>
            <p className="text-sm text-white/55 max-w-xs leading-relaxed">
              Find someone who can do it properly. Help proper local pros get found. Just sorted.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4 font-sans">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/68 hover:text-sa-gold transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Sjoh. Proudly built in South Africa.
          </p>
          <p className="text-xs text-white/45">
            POPIA-compliant. We protect your personal information under South African law.
          </p>
        </div>
      </div>
    </footer>
  );
};
