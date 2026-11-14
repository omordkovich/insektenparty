import { LEGAL_INFO, WITHDRAWAL_VERSION } from "@/lib/legal-info";
import { LastUpdated, LegalBody, List, PostalAddress, Section } from "../LegalText";

// English translation of WithdrawalDe.tsx, worded after the English model
// instructions of Directive 2011/83/EU (Annex I) - same sections and
// paragraphs; change both together (legal-parity.test.ts).
export function WithdrawalEn() {
  return (
    <LegalBody>
      <p>
        Consumers have a right of withdrawal when buying paid extensions, as
        set out below.
      </p>

      <Section title="Right of withdrawal">
        <p>
          You have the right to withdraw from this contract within 14 days
          without giving any reason.
        </p>
        <p>
          The withdrawal period will expire after 14 days from the day of the
          conclusion of the contract.
        </p>
        <p>To exercise the right of withdrawal, you must inform us</p>
        <p>
          <PostalAddress locale="en" />
          <br />
          Email: {LEGAL_INFO.email}
        </p>
        <p>
          of your decision to withdraw from this contract by an unequivocal
          statement (e.g. a letter sent by post or an email). You may use the
          model withdrawal form below, but it is not obligatory.
        </p>
        <p>
          To meet the withdrawal deadline, it is sufficient for you to send
          your communication concerning your exercise of the right of
          withdrawal before the withdrawal period has expired.
        </p>
      </Section>

      <Section title="Effects of withdrawal">
        <p>
          If you withdraw from this contract, we shall reimburse to you all
          payments received from you, including the costs of delivery (with the
          exception of the supplementary costs resulting from your choice of a
          type of delivery other than the least expensive type of standard
          delivery offered by us), without undue delay and in any event not
          later than 14 days from the day on which we are informed about your
          decision to withdraw from this contract. We will carry out such
          reimbursement using the same means of payment as you used for the
          initial transaction, unless you have expressly agreed otherwise; in
          any event, you will not incur any fees as a result of such
          reimbursement.
        </p>
        <p>
          If you requested to begin the performance of services during the
          withdrawal period, you shall pay us an amount which is in proportion
          to what has been provided until you have communicated us your
          withdrawal from this contract, in comparison with the full coverage
          of the contract.
        </p>
      </Section>

      <Section title="Early expiry of the right of withdrawal">
        <p>
          For a contract for the supply of digital content which is not
          supplied on a tangible medium, the right of withdrawal expires once
          we have begun performing the contract after you
        </p>
        <List>
          <li>
            have expressly agreed that we begin performing the contract before
            the withdrawal period has expired,
          </li>
          <li>
            have confirmed that you are aware that by giving this consent you
            lose your right of withdrawal once performance of the contract has
            begun, and
          </li>
          <li>
            we have provided you with a confirmation of the contract that
            records your consent and acknowledgement.
          </li>
        </List>
        <p>
          For a contract for the provision of services, the right of
          withdrawal expires once we have fully provided the service, if we
          only began performance after you had given your express consent and
          at the same time confirmed that you are aware that you lose your
          right of withdrawal once we have fully performed the contract.
        </p>
      </Section>

      <Section title="Model withdrawal form">
        <p>
          (Complete and return this form only if you wish to withdraw from the
          contract.)
        </p>
        <div className="rounded-2xl border border-leaf/20 p-4">
          <p>
            To:
            <br />
            <PostalAddress locale="en" />
            <br />
            Email: {LEGAL_INFO.email}
          </p>
          <p className="mt-3">
            I/We (*) hereby give notice that I/We (*) withdraw from my/our (*)
            contract for the supply of the following digital content (*) / for
            the provision of the following service (*):
          </p>
          <p className="mt-3">
            ______________________________________
            <br />
            Ordered on (*) / received on (*): ______________
            <br />
            Name of consumer(s): ______________
            <br />
            Address of consumer(s): ______________
            <br />
            Signature of consumer(s) (only if this form is notified on paper):
            ______________
            <br />
            Date: ______________
          </p>
          <p className="mt-3">(*) Delete as appropriate.</p>
        </div>
      </Section>

      <LastUpdated date={WITHDRAWAL_VERSION} locale="en" />
    </LegalBody>
  );
}
