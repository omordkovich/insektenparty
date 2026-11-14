import { LEGAL_INFO, MIN_REGISTRATION_AGE, TERMS_VERSION } from "@/lib/legal-info";
import { EmailLink, LastUpdated, LegalBody, List, PostalAddress, Section } from "../LegalText";

// English translation of TermsDe.tsx - same sections and paragraphs;
// change both together (legal-parity.test.ts). The German version is the
// binding one (§ 4).
export function TermsEn() {
  return (
    <LegalBody>
      <Section title="§ 1 Scope and provider">
        <p>
          These terms and conditions (“Terms”) apply to the use of the website
          gastzilla.de and all services offered through it (“GASTZILLA”). The
          provider is:
        </p>
        <p>
          <PostalAddress locale="en" />
          <br />
          Email: <EmailLink />
        </p>
        <p>
          Users’ own terms do not apply unless we expressly agree to them.
        </p>
      </Section>

      <Section title="§ 2 Services">
        <p>
          GASTZILLA lets you create digital invitation pages for events, share
          them by link and keep a guest list through them.
        </p>
        <p>
          Every account receives one free event, once. It needs a fixed date no
          more than three months after the event is created. If the free event
          is deleted or expires, there is no new one.
        </p>
        <p>
          In addition, we offer paid extensions, in particular further events,
          unlocking an event (all designs included, date poll, leaving the date
          open for now and a date up to twelve months after creation),
          individual premium designs and an event page without the “made with
          GASTZILLA” note. The scope and price of each extension are shown in
          its description during the ordering process.
        </p>
        <p>
          Every event, including a paid one, is deleted automatically 90 days
          after its key date, together with its guest list and date poll. The
          key date is the last day of the event; for a date poll still running,
          the latest proposed date; and for an event without a date, the day
          six months after it was created. From the day after the key date the
          event can no longer be changed, only deleted; from 30 days after the
          key date the invitation link no longer shows the event. About seven
          days before the deletion we remind you of it by email.
        </p>
        <p>
          Guests can add themselves to the guest list through the invitation
          link without an account of their own.
        </p>
      </Section>

      <Section title="§ 3 User account">
        <p>
          A free user account is required to create events. By registering you
          accept these Terms; the user agreement is concluded when you confirm
          your email address. The details you give when registering must be
          true and complete. Keep your login details secret and tell us
          immediately if you suspect your account is being misused.
        </p>
        <p>
          You can register from the age of {MIN_REGISTRATION_AGE}. By
          registering you confirm that you are at least {MIN_REGISTRATION_AGE}{" "}
          years old.
        </p>
        <p>
          Minors may only buy paid extensions with the consent of their parents
          or guardians. If the parents or guardians object to a purchase, we
          refund the price and the extension is removed again.
        </p>
      </Section>

      <Section title="§ 4 Conclusion of contract for paid extensions">
        <p>
          The presentation of the extensions on the website is not a legally
          binding offer but an invitation to order. By clicking the order
          button you make a binding offer to buy the selected extension. Before
          submitting, you can check and correct your details at any time or
          cancel the process.
        </p>
        <p>
          The contract is concluded when we unlock the extension in your
          account or send you an order confirmation by email – whichever
          happens first.
        </p>
        <p>
          The contract language is German. We store the text of the contract.
          We send you the order
          details, these Terms and the information on the right of withdrawal
          by email with the order confirmation.
        </p>
      </Section>

      <Section title="§ 5 Prices and payment">
        <p>
          The prices shown during the ordering process apply.{" "}
          {LEGAL_INFO.smallBusiness
            ? "In accordance with § 19 UStG (German small business rule), no VAT is charged."
            : "All prices are final prices including statutory VAT."}
        </p>
        <p>
          Payment is made through the payment service provider Stripe, using
          the payment methods offered there. The price is due immediately when
          the contract is concluded.
        </p>
      </Section>

      <Section title="§ 6 Duration of extensions">
        <p>
          Extensions are one-time purchases, not subscriptions. There are no
          recurring costs. An extension is available to you without time
          limit for as long as your account exists and GASTZILLA is operated.
          Extensions are tied to your account and cannot be transferred.
          Extensions for a specific event (such as unlocking an event or the
          event page without the GASTZILLA note) apply to that event and end
          when it is deleted (§ 2).
        </p>
      </Section>

      <Section title="§ 7 Right of withdrawal">
        <p>
          Consumers have a statutory right of withdrawal. Details, in
          particular on the early expiry of the right of withdrawal when an
          extension is unlocked immediately, can be found in the information
          on the right of withdrawal (link “Withdrawal” at the bottom of the
          page).
        </p>
      </Section>

      <Section title="§ 8 Users’ obligations and content">
        <p>
          You are responsible for the content you post on GASTZILLA (e.g. event
          texts, contact details, guest list entries). In particular, you must
          not
        </p>
        <List>
          <li>post unlawful, offensive or discriminatory content,</li>
          <li>infringe the rights of others (e.g. copyright, trademark or personality rights),</li>
          <li>misuse GASTZILLA for advertising, spam or automated access,</li>
          <li>disrupt the technical infrastructure or circumvent security measures.</li>
        </List>
        <p>
          Event pages and guest lists are visible to everyone who has the
          invitation link – for password-protected events, to everyone who
          also knows the password. As the host, you decide who gets the link
          and the password, and you make sure you are allowed to use other
          people’s data that you enter.
        </p>
        <p>
          We may remove content that breaks these rules and suspend accounts in
          the case of serious or repeated violations.
        </p>
      </Section>

      <Section title="§ 9 Availability">
        <p>
          We aim to keep GASTZILLA available with as few interruptions as
          possible. We cannot guarantee constant availability, for instance
          during maintenance or in case of disruptions beyond our control.
        </p>
      </Section>

      <Section title="§ 10 Warranty and liability">
        <p>
          For defects in paid extensions, the statutory provisions apply, in
          particular §§ 327 et seq. BGB (German Civil Code) for digital
          products.
        </p>
        <p>
          We are liable without limitation for intent and gross negligence, for
          injury to life, body or health, and under the German Product
          Liability Act. In case of slight negligence, we are only liable for
          breach of an essential contractual obligation whose fulfilment makes
          the proper performance of the contract possible in the first place
          and on whose observance you may regularly rely (cardinal
          obligation); in this case liability is limited to the foreseeable
          damage typical for the contract. Otherwise, liability for slight
          negligence is excluded.
        </p>
      </Section>

      <Section title="§ 11 Term, termination and deletion">
        <p>
          You can have your account deleted at any time without giving reasons
          by sending an email to <EmailLink />. Deleting it also deletes your
          events and their guest lists; extensions you bought lapse.
        </p>
        <p>
          We can terminate the use with four weeks’ notice as long as you have
          not bought a paid extension. The right to extraordinary termination
          for good cause remains unaffected. We will announce any
          discontinuation of GASTZILLA at least three months in advance. Your
          statutory rights remain unaffected.
        </p>
      </Section>

      <Section title="§ 12 Changes to these Terms">
        <p>
          We notify registered users of changes to these Terms by email in good
          time beforehand. For existing accounts they only apply once you
          agree to them. If you do not agree, the previous Terms continue to
          apply; we can then terminate the use in accordance with § 11.
          Extensions already paid for are not restricted by changes.
        </p>
      </Section>

      <Section title="§ 13 Final provisions">
        <p>
          The law of the Federal Republic of Germany applies, excluding the UN
          Convention on Contracts for the International Sale of Goods. For
          consumers, this choice of law only applies insofar as it does not
          deprive them of the protection of mandatory provisions of the law of
          the country in which they have their habitual residence.
        </p>
        <p>
          We are neither willing nor obliged to take part in dispute resolution
          proceedings before a consumer arbitration board.
        </p>
        <p>
          Should individual provisions of these Terms be invalid, the validity
          of the remaining provisions remains unaffected.
        </p>
      </Section>

      <LastUpdated date={TERMS_VERSION} locale="en" />
    </LegalBody>
  );
}
