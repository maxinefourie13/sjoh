import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";

const Returns = () => {
  return (
    <SiteLayout>
      <SeoHead
        title="Returns, Refunds and Cancellation Policy | Sjoh"
        description="How refunds, subscription cancellations and service disputes are handled on Sjoh."
        canonical="https://sjoh.co.za/returns"
      />
      <article className="container max-w-3xl py-12 md:py-16 prose prose-neutral dark:prose-invert">
        <header className="mb-10 not-prose">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            Returns, Refunds and Cancellation Policy
          </h1>
          <p className="text-sm text-muted-foreground mt-3">Last updated: 20 May 2026</p>
        </header>

        <section className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
          <h2 className="font-display text-xl font-bold">Provider subscription cancellations</h2>
          <p>
            Providers may cancel their Sjoh subscription by emailing{" "}
            <a className="text-primary underline" href="mailto:hello@sjoh.co.za">hello@sjoh.co.za</a> from the email
            address on their account. During launch, Sjoh will manually confirm the cancellation once the PayFast
            subscription has been stopped.
          </p>
          <p>
            Monthly subscriptions remain active until the end of the paid billing period. Annual subscriptions remain
            active until the end of the annual term.
          </p>

          <h2 className="font-display text-xl font-bold">Refunds for Sjoh platform fees</h2>
          <p>
            Sjoh provider subscription fees and optional platform fees are billed in advance and are generally
            non-refundable, except where required by South African consumer law or where Sjoh confirms an error in
            billing.
          </p>

          <h2 className="font-display text-xl font-bold">No returns of services through Sjoh</h2>
          <p>
            Sjoh does not sell or ship physical goods, so product returns do not apply to the platform itself. Work
            performed by a provider is governed by the quote, invoice and agreement between the customer and provider.
          </p>

          <h2 className="font-display text-xl font-bold">Refunds for service work</h2>
          <p>
            Because customers pay providers directly for actual service work, any refund, rework, cancellation fee or
            deposit dispute must be resolved directly between the customer and the provider. Sjoh does not hold customer
            funds and cannot release, reverse or transfer funds paid directly to a provider.
          </p>

          <h2 className="font-display text-xl font-bold">Disputes and moderation</h2>
          <p>
            If a dispute is reported, Sjoh may review platform records, contact the parties, request supporting documents,
            moderate reviews, hide a listing, suspend a provider, or remove users who repeatedly breach platform rules.
            Sjoh does not replace a court, ombud, regulator, insurer or professional body.
          </p>
        </section>
      </article>
    </SiteLayout>
  );
};

export default Returns;
