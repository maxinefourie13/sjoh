import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";

const AcceptableUse = () => {
  return (
    <SiteLayout>
      <SeoHead
        title="Acceptable Use Policy | Sjoh"
        description="Rules for using Sjoh safely and lawfully as a South African service marketplace."
        canonical="https://sjoh.co.za/acceptable-use"
      />
      <article className="container max-w-3xl py-12 md:py-16 prose prose-neutral dark:prose-invert">
        <header className="mb-10 not-prose">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            Acceptable Use Policy
          </h1>
          <p className="text-sm text-muted-foreground mt-3">Last updated: 20 May 2026</p>
        </header>

        <section className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
          <p>
            Sjoh is a South African service marketplace for customers and independent local service providers. This
            policy explains what may and may not be offered, requested, posted or promoted on the platform.
          </p>

          <h2 className="font-display text-xl font-bold">Permitted use</h2>
          <p>
            You may use Sjoh to create a legitimate service profile, post real service requests, send quotes and invoices,
            compare providers, communicate about a job, and leave honest reviews about completed work.
          </p>

          <h2 className="font-display text-xl font-bold">Prohibited services and conduct</h2>
          <p>You may not use Sjoh to offer, request, arrange, promote or facilitate:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>illegal goods, illegal services, fraud, scams, money laundering, identity theft or document forgery;</li>
            <li>weapons, explosives, controlled substances, stolen goods or counterfeit products;</li>
            <li>adult sexual services, human trafficking, exploitation or abusive content;</li>
            <li>hate, harassment, threats, intimidation, extortion or discriminatory conduct;</li>
            <li>false reviews, misleading business claims, fake qualifications or impersonation;</li>
            <li>services that require a licence, permit, qualification or insurance where the provider does not hold it;</li>
            <li>spam, scraping, malware, phishing, automated account creation or attempts to bypass platform security.</li>
          </ul>

          <h2 className="font-display text-xl font-bold">Provider responsibility</h2>
          <p>
            Service providers are responsible for complying with South African law, industry rules, municipal
            requirements, safety standards and tax obligations that apply to their work. Sjoh ID Check is a platform trust
            check and does not replace professional licensing, criminal record checks, trade certification or customer due
            diligence.
          </p>

          <h2 className="font-display text-xl font-bold">Enforcement</h2>
          <p>
            Sjoh may remove content, hide listings, suspend accounts, block payments for platform subscriptions, or report
            suspected unlawful conduct where necessary. Serious or repeated breaches may result in permanent removal from
            the platform.
          </p>

          <h2 className="font-display text-xl font-bold">Reporting</h2>
          <p>
            To report a listing, request or user that appears to breach this policy, email{" "}
            <a className="text-primary underline" href="mailto:hello@sjoh.co.za">hello@sjoh.co.za</a>.
          </p>
        </section>
      </article>
    </SiteLayout>
  );
};

export default AcceptableUse;
