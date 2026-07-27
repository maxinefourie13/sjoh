import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";

const Privacy = () => {
  return (
    <SiteLayout>
      <SeoHead
        title="Privacy Policy | Sjoh"
        description="Privacy Policy describing how Sjoh processes personal information in compliance with the Protection of Personal Information Act 4 of 2013 (POPIA)."
        canonical="https://sjoh.co.za/privacy"
      />
      <article className="container max-w-3xl py-12 md:py-16">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Effective date: 30 April 2026 &nbsp;·&nbsp; Last updated: 30 April 2026
          </p>
        </header>

        <section className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
          <h2 className="font-display text-xl font-bold">1. Introduction</h2>
          <p>
            Sjoh (Pty) Ltd (&ldquo;<strong>Sjoh</strong>&rdquo;, &ldquo;<strong>we</strong>&rdquo;,
            &ldquo;<strong>us</strong>&rdquo;, &ldquo;<strong>our</strong>&rdquo;) is committed to protecting the privacy
            of users of its website, mobile application and related services (the &ldquo;<strong>Platform</strong>&rdquo;).
            This Privacy Policy describes the manner in which we collect, use, disclose, store and otherwise process personal
            information in accordance with the Protection of Personal Information Act 4 of 2013 (&ldquo;<strong>POPIA</strong>&rdquo;)
            and other applicable South African laws.
          </p>
          <p>
            For purposes of POPIA, Sjoh is the responsible party in respect of the personal information processed via the
            Platform. Our Information Officer may be contacted at <a className="text-primary underline" href="mailto:privacy@sjoh.co.za">privacy@sjoh.co.za</a>.
          </p>

          <h2 className="font-display text-xl font-bold">2. Categories of Personal Information We Collect</h2>
          <p>We may collect and process the following categories of personal information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Contact data:</strong> postal address, email address, mobile telephone number.</li>
            <li><strong>Account data:</strong> full name, username, password (in encrypted form), profile photograph, biographical description, geographic location.</li>
            <li><strong>Transactional data:</strong> service requests, quotations, communications between Users, ratings and reviews, deal memoranda, completion records.</li>
            <li><strong>Financial data:</strong> billing details, subscription history. Card data is processed directly by our payment service provider and is not stored on our systems.</li>
            <li><strong>Qualification data:</strong> trade or professional certificates voluntarily submitted for applicable profile features.</li>
            <li><strong>Technical data:</strong> IP address, device identifiers, browser type, operating system, log files, cookie data.</li>
            <li><strong>Marketing data:</strong> communication preferences and consents.</li>
          </ul>

          <h2 className="font-display text-xl font-bold">3. Sources of Personal Information</h2>
          <p>We collect personal information directly from you when you register, use or interact with the Platform; from publicly available sources (such as Google&rsquo;s Places API for business listings); and from operators such as payment processors acting on our instruction.</p>

          <h2 className="font-display text-xl font-bold">4. Lawful Basis and Purposes of Processing</h2>
          <p>We process personal information on one or more of the following lawful bases recognised under POPIA:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Performance of a contract</strong> with the data subject, including operation of the Platform and provision of requested services.</li>
            <li><strong>Compliance with a legal obligation</strong> to which Sjoh is subject.</li>
            <li><strong>The legitimate interests</strong> of Sjoh or a third party, including fraud prevention, platform security, service improvement and direct marketing of similar services to existing customers.</li>
            <li><strong>Consent</strong> of the data subject, where required (for example, for direct marketing to non-customers, or processing of special personal information).</li>
          </ul>
          <p>The specific purposes for which we process personal information include: account creation and management; matching Customers with Service Providers; facilitating communications between Users; processing payments; supporting optional professional-qualification features; preventing and detecting fraud, abuse and unlawful activity; complying with legal and regulatory obligations; conducting analytics; and providing customer support.</p>

          <h2 className="font-display text-xl font-bold">5. Disclosure to Third Parties</h2>
          <p>We may disclose personal information to the following categories of recipients:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Other Users of the Platform,</strong> to the extent necessary to facilitate Transactions (e.g. a Customer&rsquo;s contact details are disclosed to a Service Provider only after the Customer has expressly accepted that Service Provider&rsquo;s quotation).</li>
            <li><strong>Operators</strong> processing personal information on our behalf under written contract, including cloud-hosting providers, document-processing tools, payment processors, email-delivery providers and analytics providers.</li>
            <li><strong>Regulatory and law-enforcement authorities,</strong> where disclosure is required or permitted by law.</li>
            <li><strong>Professional advisors,</strong> including legal, accounting and audit professionals bound by duties of confidentiality.</li>
            <li><strong>Acquirers or successors</strong> in the event of a sale, merger, restructuring or insolvency of Sjoh.</li>
          </ul>

          <h2 className="font-display text-xl font-bold">6. Cross-Border Transfers</h2>
          <p>
            Some of our operators are located outside the Republic of South Africa. Where personal information is transferred
            across borders, Sjoh ensures that the transfer complies with section 72 of POPIA, including by relying on (i)
            the recipient being subject to laws or binding rules providing an adequate level of protection, or (ii)
            appropriate contractual safeguards.
          </p>

          <h2 className="font-display text-xl font-bold">7. Retention</h2>
          <p>
            We retain personal information only for as long as is necessary to fulfil the purposes for which it was
            collected, to comply with our legal and regulatory obligations, and to resolve disputes or enforce our rights.
            Transactional and tax-related records are retained for a minimum of five (5) years in accordance with the Tax
            Administration Act 28 of 2011.
          </p>

          <h2 className="font-display text-xl font-bold">8. Security Safeguards</h2>
          <p>
            Sjoh implements appropriate technical and organisational measures to safeguard personal information against
            loss, unauthorised access, alteration or disclosure, including encryption in transit and at rest, role-based
            access controls, audit logging, regular security testing, and personnel confidentiality undertakings. In the
            event of a security compromise affecting personal information, we will notify the Information Regulator and
            affected data subjects in accordance with section 22 of POPIA.
          </p>

          <h2 className="font-display text-xl font-bold">9. Cookies and Similar Technologies</h2>
          <p>
            The Platform uses cookies and similar technologies to operate essential functionality, remember preferences,
            measure performance and (where permitted) deliver relevant content. You may manage cookie preferences via your
            browser settings. Disabling certain cookies may affect Platform functionality.
          </p>

          <h2 className="font-display text-xl font-bold">10. Direct Marketing</h2>
          <p>
            We will only send direct marketing communications to you where permitted by law. You may opt out of receiving
            such communications at any time by using the unsubscribe link provided in each communication or by emailing
            <a className="text-primary underline ml-1" href="mailto:privacy@sjoh.co.za">privacy@sjoh.co.za</a>.
          </p>

          <h2 className="font-display text-xl font-bold">11. Your Rights as a Data Subject</h2>
          <p>Subject to POPIA, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>be notified that personal information about you is being collected or has been accessed by an unauthorised person;</li>
            <li>request confirmation of, and access to, the personal information we hold about you;</li>
            <li>request the correction, deletion or destruction of personal information that is inaccurate, irrelevant, excessive, out of date, incomplete, misleading or unlawfully obtained;</li>
            <li>object, on reasonable grounds, to the processing of your personal information;</li>
            <li>object to processing for purposes of direct marketing;</li>
            <li>not be subject to a decision based solely on the automated processing of personal information; and</li>
            <li>lodge a complaint with the Information Regulator (South Africa).</li>
          </ul>
          <p>To exercise any of these rights, please contact our Information Officer at <a className="text-primary underline" href="mailto:privacy@sjoh.co.za">privacy@sjoh.co.za</a>.</p>

          <h2 className="font-display text-xl font-bold">12. Complaints to the Information Regulator</h2>
          <p>
            If you believe that we have processed your personal information in a manner that is unlawful or in breach of
            POPIA, you may lodge a complaint with the Information Regulator: The Information Regulator (South Africa),
            JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001;
            <a className="text-primary underline ml-1" href="mailto:complaints.IR@justice.gov.za">complaints.IR@justice.gov.za</a>.
          </p>

          <h2 className="font-display text-xl font-bold">13. Children</h2>
          <p>
            The Platform is not directed at persons under the age of eighteen (18) years. We do not knowingly process
            personal information of children. If we become aware that we have collected personal information of a child
            without verifiable parental consent, we will take steps to delete such information.
          </p>

          <h2 className="font-display text-xl font-bold">14. Amendments to this Policy</h2>
          <p>
            We may amend this Privacy Policy from time to time. The date of the most recent revision is set out at the top
            of this Policy. Material amendments will be communicated to registered Users by email or via a prominent notice
            on the Platform.
          </p>

          <h2 className="font-display text-xl font-bold">15. Contact Us</h2>
          <p>
            Information Officer: <a className="text-primary underline" href="mailto:privacy@sjoh.co.za">privacy@sjoh.co.za</a><br />
            General queries: <a className="text-primary underline" href="mailto:hello@sjoh.co.za">hello@sjoh.co.za</a>
          </p>
        </section>
      </article>
    </SiteLayout>
  );
};

export default Privacy;
