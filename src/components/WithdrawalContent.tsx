import { LEGAL_INFO } from "@/lib/legal-info";
import { LastUpdated, LegalBody, List, PostalAddress, Section } from "./LegalText";

// Follows the statutory model (Anlage 1 und 2 zu Art. 246a EGBGB) as
// closely as possible - including the formal "Sie", because deviating from
// the model forfeits its legal presumption of correctness.
//
// TODO (Stripe): Seit 19.06.2026 ist zusätzlich eine elektronische
// Widerrufsfunktion ("Widerrufsbutton", RL (EU) 2023/2673) nötig. Beim Bau
// des Checkouts umsetzen und dann hier darauf hinweisen.
export function WithdrawalContent() {
  return (
    <LegalBody>
      <p>
        Verbraucherinnen und Verbrauchern steht beim Kauf kostenpflichtiger
        Erweiterungen ein Widerrufsrecht nach folgender Maßgabe zu.
      </p>

      <Section title="Widerrufsrecht">
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen.
        </p>
        <p>
          Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des
          Vertragsabschlusses.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
        </p>
        <p>
          <PostalAddress />
          <br />
          Telefon: {LEGAL_INFO.phone}
          <br />
          E-Mail: {LEGAL_INFO.email}
        </p>
        <p>
          mittels einer eindeutigen Erklärung (z. B. ein mit der Post
          versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen
          Vertrag zu widerrufen, informieren. Sie können dafür das unten
          stehende Muster-Widerrufsformular verwenden, das jedoch nicht
          vorgeschrieben ist.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung
          über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist
          absenden.
        </p>
      </Section>

      <Section title="Folgen des Widerrufs">
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit
          Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie
          eine andere Art der Lieferung als die von uns angebotene, günstigste
          Standardlieferung gewählt haben), unverzüglich und spätestens binnen
          vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
          Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese
          Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
          ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen
          wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden
          Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
        <p>
          Haben Sie verlangt, dass die Dienstleistungen während der
          Widerrufsfrist beginnen sollen, so haben Sie uns einen angemessenen
          Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie
          uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags
          unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum
          Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
        </p>
      </Section>

      <Section title="Vorzeitiges Erlöschen des Widerrufsrechts">
        <p>
          Das Widerrufsrecht erlischt bei einem Vertrag über die Bereitstellung
          von nicht auf einem körperlichen Datenträger befindlichen digitalen
          Inhalten, wenn wir mit der Ausführung des Vertrags begonnen haben,
          nachdem Sie
        </p>
        <List>
          <li>
            ausdrücklich zugestimmt haben, dass wir mit der Ausführung des
            Vertrags vor Ablauf der Widerrufsfrist beginnen,
          </li>
          <li>
            Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre Zustimmung
            mit Beginn der Ausführung des Vertrags Ihr Widerrufsrecht verlieren,
            und
          </li>
          <li>
            wir Ihnen eine Bestätigung des Vertrags zur Verfügung gestellt
            haben, in der Ihre Zustimmung und Kenntnisnahme festgehalten sind.
          </li>
        </List>
        <p>
          Bei einem Vertrag über die Erbringung von Dienstleistungen erlischt
          das Widerrufsrecht, wenn wir die Dienstleistung vollständig erbracht
          haben und mit der Ausführung erst begonnen haben, nachdem Sie dazu
          Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis
          davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger
          Vertragserfüllung durch uns verlieren.
        </p>
      </Section>

      <Section title="Muster-Widerrufsformular">
        <p>
          (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses
          Formular aus und senden Sie es zurück.)
        </p>
        <div className="rounded-2xl border border-leaf/20 p-4">
          <p>
            An:
            <br />
            <PostalAddress />
            <br />
            E-Mail: {LEGAL_INFO.email}
          </p>
          <p className="mt-3">
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen
            Vertrag über den Kauf der folgenden digitalen Inhalte (*) / die
            Erbringung der folgenden Dienstleistung (*):
          </p>
          <p className="mt-3">
            ______________________________________
            <br />
            Bestellt am (*) / erhalten am (*): ______________
            <br />
            Name des/der Verbraucher(s): ______________
            <br />
            Anschrift des/der Verbraucher(s): ______________
            <br />
            Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):
            ______________
            <br />
            Datum: ______________
          </p>
          <p className="mt-3">(*) Unzutreffendes streichen.</p>
        </div>
      </Section>

      <LastUpdated date="September 2026" />
    </LegalBody>
  );
}
