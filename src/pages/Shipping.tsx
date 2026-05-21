import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";

const Shipping = () => {
  return (
    <SiteLayout>
      <SeoHead
        title="Shipping and Service Delivery Policy | Sjoh"
        description="How service delivery works on Sjoh. Sjoh is not a fulfilment centre and does not ship products."
        canonical="https://sjoh.co.za/shipping"
      />
      <article className="container max-w-3xl py-12 md:py-16 prose prose-neutral dark:prose-invert">
        <header className="mb-10 not-prose">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            Shipping and Service Delivery Policy
          </h1>
          <p className="text-sm text-muted-foreground mt-3">Last updated: 20 May 2026</p>
        </header>

        <section className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
          <h2 className="font-display text-xl font-bold">No physical shipping by Sjoh</h2>
          <p>
            Sjoh is a marketplace for local services, not a fulfilment centre, courier, warehouse or online store for
            physical goods. Sjoh does not pack, ship, deliver or store products for customers or service providers.
          </p>

          <h2 className="font-display text-xl font-bold">How service delivery works</h2>
          <p>
            Customers post service requests or browse provider profiles. Providers send quotes directly through Sjoh.
            Once a customer accepts a quote, the customer and provider arrange the work directly, including timing,
            location, access, materials and any on-site requirements.
          </p>

          <h2 className="font-display text-xl font-bold">Payments for actual service work</h2>
          <p>
            Sjoh does not receive, hold or disburse customer payments for the underlying service work. Customers pay
            providers directly according to the quote, invoice and terms agreed between them. Sjoh does not provide wallets
            or stored balances for customers or providers.
          </p>

          <h2 className="font-display text-xl font-bold">Provider subscriptions</h2>
          <p>
            PayFast is used for Sjoh provider subscription fees, such as the R250/month Verified Pro subscription. These
            fees pay for platform access and tools; they are separate from payments between customers and providers for
            actual jobs.
          </p>

          <h2 className="font-display text-xl font-bold">Service timing and fulfilment</h2>
          <p>
            Service timing, attendance, materials, guarantees and completion standards are agreed directly between the
            customer and the provider. Providers remain responsible for performing their services professionally and
            lawfully.
          </p>
        </section>
      </article>
    </SiteLayout>
  );
};

export default Shipping;
