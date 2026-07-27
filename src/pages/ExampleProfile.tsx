import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Globe,
  Star,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";

/**
 * Public preview of what a client sees when they land on a real Sjoh business
 * profile. Linked from sample cards across the directory.
 * Pure presentation — no DB, no SEO indexing.
 */
const ExampleProfile = () => {
  return (
    <SiteLayout>
      {/* Sample banner */}
      <div className="sample-gradient text-background">
        <div className="container py-2.5 text-center text-xs font-bold tracking-wide uppercase">
          Sample profile · This is what your listing will look like to a client
        </div>
      </div>

      <div className="container py-8 max-w-5xl">
        <Link
          to="/directory"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" /> Back to directory
        </Link>

        {/* Cover */}
        <div className="rounded-2xl overflow-hidden border border-border shadow-card">
          <div className="sample-gradient h-44 md:h-56 relative">
            <span className="absolute top-4 left-4 bg-background/95 text-foreground text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded shadow-soft">
              Sample listing
            </span>
          </div>

          {/* Header */}
          <div className="bg-card px-5 md:px-8 pb-6 -mt-10 relative">
            <div className="size-20 rounded-2xl bg-card border-4 border-card shadow-soft flex items-center justify-center font-display font-extrabold text-3xl text-foreground">
              E
            </div>
            <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-display text-3xl md:text-4xl tracking-tight">
                  Preview Listing
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Your category · Your city, Your province
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Star className="size-4 fill-accent text-accent" />
                  <span className="font-semibold tabular-nums">4.9</span>
                  <span className="text-muted-foreground">
                    (your real reviews appear here)
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" asChild>
                  <Link to="/directory">See real profiles →</Link>
                </Button>
                <Button asChild>
                  <Link to="/list">List your business →</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 mt-8">
          {/* Left: about + services + reviews */}
          <div className="space-y-8">
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl mb-3">About</h2>
              <p className="text-ink-2 leading-relaxed">
                This is where your story lives. Tell clients what you do, who you do
                it for, and why okes choose you over the chancer down the road.
                Your description, service area, and qualifications all go here.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="size-9 rounded-lg bg-secondary flex items-center justify-center">
                    <ShieldCheck className="size-4 text-primary" />
                  </span>
                  <div>
                    <p className="font-semibold">ID & phone verified</p>
                    <p className="text-xs text-muted-foreground">Checked at the door</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="size-9 rounded-lg bg-secondary flex items-center justify-center">
                    <Clock className="size-4 text-primary" />
                  </span>
                  <div>
                    <p className="font-semibold">Mon–Sat, 7am–6pm</p>
                    <p className="text-xs text-muted-foreground">Your trading hours</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl mb-4">Services</h2>
              <ul className="divide-y divide-border">
                {[
                  { name: "Your service one", from: 450 },
                  { name: "Your service two", from: 1200 },
                  { name: "Your service three", from: 2800 },
                ].map((s) => (
                  <li key={s.name} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Short description for the client
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      from R {s.from.toLocaleString("en-ZA")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl mb-4">Reviews</h2>
              <div className="space-y-5">
                {[
                  {
                    name: "Thandi M.",
                    body: "Showed up on time, did exactly what was quoted. No nonsense.",
                  },
                  {
                    name: "Pieter v.d.M.",
                    body: "Sjoh — finally an oke who actually pitches. Quality work.",
                  },
                ].map((r) => (
                  <div key={r.name} className="border-l-2 border-primary/40 pl-4">
                    <div className="flex items-center gap-2">
                      <Star className="size-3.5 fill-accent text-accent" />
                      <Star className="size-3.5 fill-accent text-accent" />
                      <Star className="size-3.5 fill-accent text-accent" />
                      <Star className="size-3.5 fill-accent text-accent" />
                      <Star className="size-3.5 fill-accent text-accent" />
                      <span className="text-xs text-muted-foreground ml-1">
                        Verified hire
                      </span>
                    </div>
                    <p className="text-sm text-ink-2 mt-2">"{r.body}"</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      — {r.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: contact rail */}
          <aside className="space-y-4 lg:sticky lg:top-24 self-start">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Direct contact
              </p>
              <p className="text-xs text-ink-2 mt-2">
                On Sjoh, clients click <strong>Reveal</strong> to see your phone
                and email. No middleman, no commission.
              </p>
              <div className="mt-4 space-y-2">
                <Button asChild className="w-full">
                  <Link to="/list">
                    <Phone className="size-4" /> List your business to get real contacts
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/directory">
                    <MessageCircle className="size-4" /> Browse real profiles instead
                  </Link>
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground italic mt-3 leading-relaxed">
                Heads up — this is a sample, so the buttons above just send you to the real thing.
                On a real profile, customers tap Reveal to see your phone, email and WhatsApp. No middleman.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Globe className="size-3.5" /> yourwebsite.co.za
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="size-3.5" /> Your address, your city
                </li>
              </ul>
            </div>

            <div className="bg-foreground text-background rounded-2xl p-6">
              <p className="font-display text-lg leading-snug">
                Like what you see?
              </p>
              <p className="text-sm text-background/75 mt-1">
                Get your own profile up in under 5 minutes.
              </p>
              <Button asChild variant="secondary" className="mt-4 w-full">
                <Link to="/list">List your business →</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
};

export default ExampleProfile;
