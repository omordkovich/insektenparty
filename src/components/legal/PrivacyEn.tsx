import { MIN_REGISTRATION_AGE, PRIVACY_VERSION } from "@/lib/legal-info";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";
import {
  EmailLink,
  ExternalLink,
  LastUpdated,
  LegalBody,
  List,
  PostalAddress,
  Section,
  SubHeading,
} from "../LegalText";

// English translation of PrivacyDe.tsx - same sections, paragraphs and list
// items; change both together (legal-parity.test.ts). UI labels quoted here
// are the English ones from messages/en.json.
export function PrivacyEn() {
  return (
    <LegalBody>
      <Section title="1. Controller">
        <p>The controller responsible for data processing on this website is:</p>
        <p>
          <PostalAddress locale="en" />
          <br />
          Email: <EmailLink />
        </p>
        <p>
          You can contact this address at any time with questions about data
          protection and to exercise your rights.
        </p>
      </Section>

      <Section title="2. Overview">
        <p>
          GASTZILLA lets you create digital invitations for events and keep
          guest lists. We only process personal data insofar as this is
          necessary to run the website and provide our services, we are
          legally obliged to, or you have given your consent.
        </p>
        <p>We rely on the following legal bases of the GDPR:</p>
        <List>
          <li>Art. 6(1)(a) – consent</li>
          <li>Art. 6(1)(b) – contract or pre-contractual measures (use of GASTZILLA)</li>
          <li>Art. 6(1)(c) – legal obligation (e.g. retention obligations under tax law)</li>
          <li>Art. 6(1)(f) – legitimate interests (e.g. secure and stable operation)</li>
        </List>
        <p>
          Storing information on your device and accessing it is additionally
          governed by § 25 TDDDG (German Telecommunications Digital Services
          Data Protection Act).
        </p>
      </Section>

      <Section title="3. Hosting and server log files">
        <p>
          This website is hosted by Vercel Inc., 440 N Barranca Ave #4133,
          Covina, CA 91723, USA. The server functions run in a data centre in
          Frankfurt am Main. Static content is delivered through Vercel’s
          worldwide network so that the site loads quickly.
        </p>
        <p>When you visit the website, the following data is processed automatically:</p>
        <List>
          <li>IP address</li>
          <li>date and time of access</li>
          <li>page or file requested</li>
          <li>referrer URL (previously visited page)</li>
          <li>browser, operating system and device type (user agent)</li>
        </List>
        <p>
          This processing is technically necessary to deliver the website and
          keep it secure (Art. 6(1)(f) GDPR). The log data is only stored
          briefly and then deleted automatically.
        </p>
        <p>
          We have a data processing agreement with Vercel (Art. 28 GDPR). Where
          data is transferred to the USA, this is based on the EU-US Data
          Privacy Framework, under which Vercel is certified, and additionally
          on the European Commission’s standard contractual clauses. More
          information: <ExternalLink href="https://vercel.com/legal/privacy-policy" />
        </p>
      </Section>

      <Section title="4. SSL/TLS encryption">
        <p>
          For security reasons, this website uses SSL/TLS encryption. You can
          recognise an encrypted connection by “https://” and the padlock icon
          in your browser’s address bar.
        </p>
      </Section>

      <Section title="5. Cookies and local storage">
        <p>
          We only use cookies and local storage that are necessary for
          operation and – only with your consent – Google reCAPTCHA. We do not
          use analytics, tracking or advertising cookies.
        </p>
        <SubHeading>Technically necessary</SubHeading>
        <List>
          <li>
            <strong>Login cookies (Supabase):</strong> keep your session alive
            while you are logged in. They are deleted when you log out or the
            session expires.
          </li>
          <li>
            <strong>Unlock cookie (password-protected events):</strong>{" "}
            remembers for up to 180 days that you entered an event’s password
            correctly, so you don’t have to enter it on every visit. It
            contains no password, only a checksum.
          </li>
          <li>
            <strong>Language cookie (NEXT_LOCALE):</strong> remembers for up to
            one year the language you chose for the site (German, English or Russian),
            so it stays the same on your next visit. It only contains the
            language code.
          </li>
          <li>
            <strong>Cookie choice (local storage):</strong> stores your decision
            in the cookie banner so we don’t have to ask again on every visit.
            The entry remains until you delete it in your browser.
          </li>
        </List>
        <p>
          The legal basis is § 25(2) no. 2 TDDDG and Art. 6(1)(b) or (f) GDPR.
        </p>
        <SubHeading>Only with consent</SubHeading>
        <List>
          <li>
            <strong>Google reCAPTCHA</strong> – see section 11.
          </li>
        </List>
        <p>
          You can change your choice at any time via the “Cookies” link at the
          bottom of the page and withdraw consent you have given with effect
          for the future.
        </p>
      </Section>

      <Section title="6. User account">
        <p>
          You need a user account to create events. For this we process your
          name, your email address and your password (stored only as an
          encrypted hash) as well as technical login data such as the time and
          IP address of logins to secure your account. We send you emails to
          confirm your registration and to reset your password. We also send
          notices about your events to this address: a reminder if an event
          has no date yet or your date poll is ending soon, and a reminder
          about seven days before an event is deleted automatically (see
          section 16). We also store the language you chose for the site in
          your account (only the language code), so that it applies on all
          your devices and we send you emails in that language.
        </p>
        <p>
          Alternatively, you can register and log in with your Google account
          (“Continue with Google”). Our authentication service provider
          Supabase then forwards you to Google (Google Ireland Limited, Gordon
          House, Barrow Street, Dublin 4, Ireland). After you confirm, Google
          transmits details of your Google account (including name, email
          address and profile picture) to our authentication service provider
          Supabase. Of these, we use your name (as display name), your email
          address and the ID of your Google account for logging in. We take
          the name from your Google account again each time you log in. In
          this case no password is stored with us. Which data Google itself
          processes is governed by Google’s privacy policy:{" "}
          <ExternalLink href="https://policies.google.com/privacy" />. The
          legal basis for our processing is Art. 6(1)(b) GDPR.
        </p>
        <p>
          When registering, you confirm that you accept the Terms, have taken
          note of this privacy policy and are at least {MIN_REGISTRATION_AGE}{" "}
          years old. For this we store in your account the time, the version
          of the Terms and of the privacy policy in force, and the age
          confirmation, so that we can prove the conclusion of the contract.
          We do not collect a date of birth or identity document. The
          confirmation is not consent to data processing – the processing of
          your account data is based on the user agreement.
        </p>
        <p>
          The legal basis is Art. 6(1)(b) GDPR (providing the account) and, for
          securing the account and proving the conclusion of the contract,
          Art. 6(1)(f) GDPR.
        </p>
        <p>
          For user management and the database we use Supabase (Supabase Inc.,
          USA). The data is stored in a data centre in Ireland (EU). We have a
          data processing agreement with Supabase; for possible access from the
          USA, the European Commission’s standard contractual clauses apply.
          More information: <ExternalLink href="https://supabase.com/privacy" />
        </p>
      </Section>

      <Section title="7. Creating events">
        <p>
          When you create an event, we store the content you enter, e.g.
          title, welcome text, date, time, location and the contact details
          (name, phone number, email address).
        </p>
        <p>
          <strong>Important:</strong> The event page can be opened by anyone
          who knows the invitation link. The contact details shown there are
          therefore visible to all invitees – and to anyone the link is passed
          on to. Please only enter details you want to share in this way.
        </p>
        <p>
          Optionally, you can protect your event with a password. Visitors
          without the password then only see the event’s title; content,
          contact details and guest list are only shown after entering the
          password. We store the password so that we can show it to you in
          your invitation text; we do not show it to guests.
        </p>
        <p>Events are deleted automatically after a fixed period (see section 16).</p>
        <p>The legal basis is Art. 6(1)(b) GDPR.</p>
      </Section>

      <Section title="8. Signing up as a guest">
        <p>
          When you add yourself as a guest on an event page, we process the
          details from the form:
        </p>
        <List>
          <li>name</li>
          <li>whether you accept or decline</li>
          <li>if you accept: number and names of further guests or companions</li>
          <li>if you accept: expected arrival time</li>
          <li>optional, if you accept: until when you stay</li>
          <li>optional, if you accept: what you bring</li>
          <li>optional: a message to the host</li>
        </List>
        <p>
          <strong>Important:</strong> The guest list is visible on the event
          page to everyone who knows the invitation link – for a
          password-protected event, to everyone who also knows the password.
          Please do not enter sensitive information (e.g. health data such as
          allergies in the message), and for children, stick to the first name
          where possible. If you add companions, please make sure they agree.
        </p>
        <p>
          The host is notified by email when someone signs up, declines, or
          changes or removes an entry; the notification contains the guest’s
          name.
        </p>
        <p>
          The legal basis is Art. 6(1)(b) GDPR (taking part in the guest list).
          You can change or delete your entry yourself until the event is over
          (from the day after the key date, see section 16). After that, please
          contact us (section 17); the host can then only delete the whole
          event. Your entry is deleted automatically together with the event
          no later than 90 days after the key date.
        </p>
        <SubHeading>Date poll</SubHeading>
        <p>
          If the host lets guests vote on the date, we process your name and
          the dates that suit you (or that none does). Like the guest list,
          your choice is visible to everyone who can open the event page. When
          the host fixes a date, we transfer your name to the guest list as an
          acceptance or refusal and delete the poll.
        </p>
        <SubHeading>Password request</SubHeading>
        <p>
          If an event is password-protected, you can ask the host for the
          password. For this we process your name, depending on your choice
          your email address or your phone number together with your preferred
          channel (e.g. SMS or WhatsApp), and an optional message.
        </p>
        <p>
          We send these details once by email to the host and do not store
          them in our database. For a request by email, the host can reply
          directly to your address.
        </p>
        <p>
          The legal basis is Art. 6(1)(b) GDPR (taking part in the event) or
          Art. 6(1)(f) GDPR (legitimate interest in getting in touch).
        </p>
      </Section>

      <Section title="9. Sending emails and contact">
        <p>
          We send system messages (registration confirmation, password reset,
          notifications about changes to the guest list, reminders and
          deletion notices about your events) via the email server of STRATO
          GmbH, Otto-Ostrowski-Straße 7, 10249 Berlin, Germany. We have a data
          processing agreement with STRATO. The legal basis is Art. 6(1)(b)
          GDPR.
        </p>
        <p>
          If you contact us by email, we process your details to answer your
          request (Art. 6(1)(b) or (f) GDPR). The data is deleted once the
          request has been dealt with and no statutory retention obligations
          prevent this.
        </p>
      </Section>

      <Section title="10. Feedback and reviews">
        <p>
          The day after an event with a fixed date and at least one acceptance,
          we email the host once to ask for a short review of GASTZILLA. The
          legal basis is our legitimate interest in improving our service and
          presenting it with real voices (Art. 6(1)(f) GDPR; § 7(3) UWG, German
          Unfair Competition Act). You can object at any time – via the “No more
          feedback emails” link in each of these emails or by email to{" "}
          <EmailLink />. This costs you nothing beyond the transmission costs at
          the basic rates.
        </p>
        <p>When you send the feedback form, we store:</p>
        <List>
          <li>your star rating (1 to 5) and your text,</li>
          <li>your first name – only if you explicitly enter it,</li>
          <li>the language of the form and the times it was received and approved.</li>
        </List>
        <p>
          The review is linked neither to your account nor to your event. With
          the event we only note that feedback has already been sent; this note
          is deleted together with the event.
        </p>
        <p>
          We read every review before it appears. Approved reviews are shown on
          gastzilla.de – on the start page and on the “Reviews” page, in every
          language version of the website and always in the language you wrote
          them in – with your first name or without a name. The legal basis for publishing is your consent in the form (Art.
          6(1)(a) GDPR). You can withdraw it at any time by email to{" "}
          <EmailLink />; please quote the text of your review, as we cannot link
          it to an account. We will then delete it. Reviews we do not publish
          are deleted after our check, no later than 30 days after they arrive.
        </p>
      </Section>

      <Section title="11. Google reCAPTCHA">
        <p>
          To protect our forms (registration, login, guest list) from spam and
          abuse, we use Google reCAPTCHA – only with your consent. The provider
          is Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
          Ireland.
        </p>
        <p>
          reCAPTCHA checks whether an entry comes from a human or an automated
          program. For this, data such as your IP address, browser and device
          information, time spent on the page and mouse or touch interactions
          is transmitted to Google; Google sets its own cookies. A transfer to
          Google LLC in the USA is possible; Google is certified under the
          EU-US Data Privacy Framework.
        </p>
        <p>
          The legal basis is your consent (Art. 6(1)(a) GDPR, § 25(1) TDDDG).
          Without consent, reCAPTCHA is not loaded; however, the protected
          forms cannot be used then. You can withdraw your consent at any time
          via the “Cookies” link.
        </p>
        <p>
          More information: <ExternalLink href="https://policies.google.com/privacy" />
        </p>
      </Section>

      <Section title="12. Images via Cloudinary">
        <p>
          We load some graphics (e.g. logos) from the image service Cloudinary
          (Cloudinary Ltd., 3400 Central Expressway, Suite 110, Santa Clara, CA
          95051, USA). Your IP address is transmitted to Cloudinary so that the
          images can be delivered to your browser. No cookies are set.
        </p>
        <p>
          The legal basis is our legitimate interest in fast and reliable
          delivery of the graphics (Art. 6(1)(f) GDPR). For transfers to the
          USA, the European Commission’s standard contractual clauses apply.
          More information: <ExternalLink href="https://cloudinary.com/privacy" />
        </p>
      </Section>

      <Section title="13. Fonts">
        <p>
          The fonts used (Nunito, Fredoka) are hosted locally on our server.
          Loading the page does not connect to servers of Google or other font
          providers.
        </p>
      </Section>

      <Section title="14. Our presence on Instagram">
        <p>
          We run a profile on Instagram ({INSTAGRAM_HANDLE}). The provider is
          Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5,
          Ireland (“Meta”).
        </p>
        <p>
          On GASTZILLA we only link to this profile with a simple link. As a
          result, visiting our pages transmits no data to Instagram and loads
          no content from Instagram. Only when you click the link are you
          forwarded to Instagram; Meta’s privacy policy applies there.
        </p>
        <p>
          When you visit our profile or interact with us (e.g. follow, like,
          comment, direct messages), Meta processes personal data – including
          IP address, device and browser information and your usage behaviour
          – and uses cookies or similar technologies for this, in some cases
          even if you have no Instagram account or are not logged in. A
          transfer to Meta Platforms, Inc. in the USA is possible; Meta is
          certified under the EU-US Data Privacy Framework.
        </p>
        <SubHeading>Joint controllership</SubHeading>
        <p>
          From this data, Meta compiles statistics on the use of our profile
          (“Insights”), which we can view in anonymised form. We and Meta are
          joint controllers for this processing (Art. 26 GDPR). In an
          agreement, Meta has undertaken to take primary responsibility for
          informing you about the processing and fulfilling your rights:{" "}
          <ExternalLink href="https://www.facebook.com/legal/terms/page_controller_addendum" />
          . We have no access to individual user profiles or the raw data.
        </p>
        <p>
          Content you send us yourself – such as comments or direct messages –
          we process in order to reply to you.
        </p>
        <p>
          The legal basis is our legitimate interest in making GASTZILLA known
          and communicating with interested people (Art. 6(1)(f) GDPR); if your
          message concerns the use of GASTZILLA, also Art. 6(1)(b) GDPR. You
          can exercise your rights (section 17) both with us and with Meta; we
          forward requests that only Meta can fulfil to Meta.
        </p>
        <p>
          Our profile: <ExternalLink href={INSTAGRAM_URL} />
          <br />
          Instagram’s privacy policy:{" "}
          <ExternalLink href="https://privacycenter.instagram.com/policy" />
        </p>
      </Section>

      <Section title="15. Payments via Stripe">
        <p>
          We process payments for paid extensions via Stripe. The provider is
          Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal
          Dock, Dublin, D02 H210, Ireland.
        </p>
        <p>
          When paying, you are forwarded to a Stripe payment page or enter your
          payment details directly with Stripe. Stripe processes in particular
          name, email address, payment details (e.g. card details), billing
          address, IP address and transaction data. We do not receive full
          payment details such as card numbers; Stripe only gives us the
          information needed to match the payment and for bookkeeping (e.g.
          amount, time, extension bought).
        </p>
        <p>
          The legal basis is Art. 6(1)(b) GDPR (performance of the contract)
          and Art. 6(1)(c) GDPR for statutory retention obligations. Stripe
          processes some data for fraud prevention and to meet its own legal
          obligations under its own responsibility. A transfer to Stripe, Inc.
          in the USA is possible; Stripe is certified under the EU-US Data
          Privacy Framework. More information:{" "}
          <ExternalLink href="https://stripe.com/privacy" />
        </p>
      </Section>

      <Section title="16. Storage period">
        <List>
          <li>
            <strong>User account:</strong> until your account is deleted.
          </li>
          <li>
            <strong>Unlocked extensions and use of the free event:</strong>{" "}
            until your account is deleted, even if the related event was
            deleted earlier.
          </li>
          <li>
            <strong>Events, guest entries and date polls:</strong> until the
            host deletes the event or individual entries or deletes their
            account, but no later than automatically 90 days after the event’s
            key date. The key date is the last day of the event; for a date
            poll still running, the latest proposed date; and for an event
            without a date, the day six months after it was created. From 30
            days after the key date, the invitation link no longer shows the
            event. About seven days before the deletion we remind the host of
            it by email.
          </li>
          <li>
            <strong>Your own guest entry:</strong> until you delete it yourself
            (possible until the event is over; after that on request to us, see
            section 17) or the event is deleted, no later than automatically 90
            days after the key date.
          </li>
          <li>
            <strong>Payment and invoice data:</strong> in accordance with the
            statutory retention periods (up to 10 years, § 147 AO, § 257 HGB).
          </li>
          <li>
            <strong>Server log files:</strong> only briefly, then deleted
            automatically.
          </li>
          <li>
            <strong>Reviews:</strong> published ones until you withdraw your
            consent; unpublished ones after our check, no later than 30 days
            after they arrive.
          </li>
        </List>
        <p>
          You can permanently delete your account yourself at any time under
          “My account” → “Delete account”; this also deletes your events and
          guest lists. Alternatively, you can request deletion informally by
          email to <EmailLink />.
        </p>
      </Section>

      <Section title="17. Your rights">
        <p>You have the following rights regarding your data:</p>
        <List>
          <li>access (Art. 15 GDPR)</li>
          <li>rectification (Art. 16 GDPR)</li>
          <li>erasure (Art. 17 GDPR)</li>
          <li>restriction of processing (Art. 18 GDPR)</li>
          <li>data portability (Art. 20 GDPR)</li>
          <li>withdrawal of consent with effect for the future (Art. 7(3) GDPR)</li>
        </List>
        <SubHeading>Right to object (Art. 21 GDPR)</SubHeading>
        <p>
          Where we process data on the basis of legitimate interests (Art.
          6(1)(f) GDPR), you can object to this processing at any time on
          grounds relating to your particular situation. We will then no longer
          process the data unless we can demonstrate compelling legitimate
          grounds that override your interests, or the processing serves the
          establishment, exercise or defence of legal claims.
        </p>
        <SubHeading>Right to lodge a complaint</SubHeading>
        <p>
          You have the right to lodge a complaint with a data protection
          supervisory authority, in particular in the member state of your
          habitual residence, place of work or place of the alleged
          infringement (Art. 77 GDPR).
        </p>
      </Section>

      <Section title="18. Obligation to provide data, automated decisions">
        <p>
          Providing your data is neither required by law nor by contract.
          Without the details marked as required, however, we cannot provide
          the respective function (e.g. account, guest entry). There is no
          automated decision-making, including profiling (Art. 22 GDPR).
        </p>
      </Section>

      <Section title="19. Changes">
        <p>
          We adapt this privacy policy when our services or the legal situation
          change. The version published here applies.
        </p>
      </Section>
      <LastUpdated date={PRIVACY_VERSION} locale="en" />
    </LegalBody>
  );
}
