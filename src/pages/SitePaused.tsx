import { Helmet } from "react-helmet-async";
import { SjohWordmark } from "@/components/SjohWordmark";

// Holding page shown on every public route while Sjoh is paused.
// Toggle with SITE_PAUSED in src/lib/sitePause.ts.
const SitePaused = () => (
  <main className="min-h-screen bg-foreground text-background flex items-center justify-center px-4 py-16">
    <Helmet>
      <title>Sjoh! is taking a short break</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="w-full max-w-lg text-center">
      <SjohWordmark className="text-5xl justify-center" />
      <div
        className="mx-auto mt-10 h-1.5 w-16 rounded-full"
        style={{ background: "var(--grad-1)" }}
        aria-hidden="true"
      />
      <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
        We're rebuilding Sjoh.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-background/75 sm:text-lg">
        Sjoh is offline while we work on something new. All subscriptions have
        been cancelled, so no further payments will be taken.
      </p>
      <p className="mt-8 text-sm text-background/60">
        Questions? Email{" "}
        <a
          href="mailto:hello@sjoh.co.za"
          className="font-semibold text-background underline underline-offset-4 hover:text-primary"
        >
          hello@sjoh.co.za
        </a>
      </p>
    </div>
  </main>
);

export default SitePaused;
