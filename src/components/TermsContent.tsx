import { LEGAL_INFO } from "@/lib/legal-info";
import { EmailLink, LastUpdated, LegalBody, List, PostalAddress, Section } from "./LegalText";

// Allgemeine Geschäftsbedingungen. Written for one-time purchases of
// extensions (event slots, premium designs) paid via Stripe - no
// subscriptions. A subscription model would need additional clauses
// (term, cancellation, "Kündigungsbutton" § 312k BGB).
export function TermsContent() {
  return (
    <LegalBody>
      <Section title="§ 1 Geltungsbereich und Anbieter">
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung
          der Website gastzilla.de und aller darüber angebotenen Leistungen
          („GASTZILLA“). Anbieter ist:
        </p>
        <p>
          <PostalAddress />
          <br />
          E-Mail: <EmailLink />
        </p>
        <p>
          Abweichende Bedingungen der Nutzerinnen und Nutzer gelten nicht, es
          sei denn, wir stimmen ihrer Geltung ausdrücklich zu.
        </p>
      </Section>

      <Section title="§ 2 Leistungen">
        <p>
          GASTZILLA ermöglicht es, digitale Einladungsseiten für Events zu
          erstellen, per Link zu teilen und darüber eine Gästeliste zu führen.
        </p>
        <p>
          Die Grundfunktionen sind kostenlos. Darüber hinaus bieten wir
          kostenpflichtige Erweiterungen an, insbesondere zusätzliche Events
          über das kostenlose Kontingent hinaus sowie Premium-Designs. Umfang
          und Preis der jeweiligen Erweiterung ergeben sich aus der
          Beschreibung im Bestellvorgang.
        </p>
        <p>
          Gäste können sich ohne eigenes Konto über den Einladungslink in die
          Gästeliste eintragen.
        </p>
      </Section>

      <Section title="§ 3 Benutzerkonto">
        <p>
          Zum Erstellen von Events ist ein kostenloses Benutzerkonto
          erforderlich. Mit der Registrierung akzeptierst du diese AGB; der
          Nutzungsvertrag kommt mit der Bestätigung deiner E-Mail-Adresse
          zustande. Deine Angaben bei der Registrierung müssen wahr und
          vollständig sein. Halte deine Zugangsdaten geheim und informiere uns
          unverzüglich, wenn du einen Missbrauch deines Kontos vermutest.
        </p>
        <p>
          Kostenpflichtige Erweiterungen können nur volljährige Personen
          erwerben.
        </p>
      </Section>

      <Section title="§ 4 Vertragsschluss bei kostenpflichtigen Erweiterungen">
        <p>
          Die Darstellung der Erweiterungen auf der Website ist kein rechtlich
          bindendes Angebot, sondern eine Aufforderung zur Bestellung. Durch
          Klick auf den Bestell-Button gibst du ein verbindliches Angebot zum
          Kauf der ausgewählten Erweiterung ab. Vor dem Absenden kannst du deine
          Angaben jederzeit überprüfen und korrigieren oder den Vorgang
          abbrechen.
        </p>
        <p>
          Der Vertrag kommt zustande, wenn wir die Erweiterung in deinem Konto
          freischalten oder dir eine Bestellbestätigung per E-Mail senden – je
          nachdem, was zuerst geschieht.
        </p>
        <p>
          Vertragssprache ist Deutsch. Wir speichern den Vertragstext. Die
          Bestelldaten, diese AGB und die Widerrufsbelehrung senden wir dir mit
          der Bestellbestätigung per E-Mail zu.
        </p>
      </Section>

      <Section title="§ 5 Preise und Zahlung">
        <p>
          Es gelten die im Bestellvorgang angegebenen Preise.{" "}
          {LEGAL_INFO.smallBusiness
            ? "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
            : "Alle Preise sind Endpreise einschließlich der gesetzlichen Umsatzsteuer."}
        </p>
        <p>
          Die Zahlung erfolgt über den Zahlungsdienstleister Stripe mit den dort
          angebotenen Zahlungsarten. Der Kaufpreis ist mit Vertragsschluss
          sofort fällig.
        </p>
      </Section>

      <Section title="§ 6 Nutzungsdauer der Erweiterungen">
        <p>
          Erweiterungen werden als Einmalkauf ohne Abonnement erworben. Es
          entstehen keine wiederkehrenden Kosten. Eine Erweiterung steht dir
          zeitlich unbegrenzt zur Verfügung, solange dein Konto besteht und
          GASTZILLA betrieben wird. Erweiterungen sind an dein Konto gebunden
          und nicht übertragbar.
        </p>
      </Section>

      <Section title="§ 7 Widerrufsrecht">
        <p>
          Verbraucherinnen und Verbrauchern steht ein gesetzliches
          Widerrufsrecht zu. Einzelheiten, insbesondere zum vorzeitigen
          Erlöschen des Widerrufsrechts bei sofortiger Freischaltung, findest
          du in der Widerrufsbelehrung (Link „Widerruf“ unten auf der Seite).
        </p>
      </Section>

      <Section title="§ 8 Pflichten der Nutzer und Inhalte">
        <p>
          Du bist für die Inhalte verantwortlich, die du bei GASTZILLA
          einstellst (z. B. Event-Texte, Kontaktdaten, Einträge in
          Gästelisten). Es ist insbesondere untersagt,
        </p>
        <List>
          <li>rechtswidrige, beleidigende oder diskriminierende Inhalte einzustellen,</li>
          <li>Rechte Dritter (z. B. Urheber-, Marken- oder Persönlichkeitsrechte) zu verletzen,</li>
          <li>GASTZILLA für Werbung, Spam oder automatisierte Zugriffe zu missbrauchen,</li>
          <li>die technische Infrastruktur zu stören oder Sicherheitsmaßnahmen zu umgehen.</li>
        </List>
        <p>
          Event-Seiten und Gästelisten sind für alle Personen sichtbar, die den
          Einladungslink kennen. Als Veranstalter entscheidest du, an wen du den
          Link weitergibst, und stellst sicher, dass du die von dir
          eingegebenen Daten Dritter verwenden darfst.
        </p>
        <p>
          Wir dürfen Inhalte, die gegen diese Regeln verstoßen, entfernen und
          Konten bei schwerwiegenden oder wiederholten Verstößen sperren.
        </p>
      </Section>

      <Section title="§ 9 Verfügbarkeit">
        <p>
          Wir bemühen uns um eine möglichst unterbrechungsfreie Verfügbarkeit
          von GASTZILLA. Eine ständige Verfügbarkeit können wir nicht
          garantieren, etwa bei Wartungsarbeiten oder Störungen, die außerhalb
          unseres Einflussbereichs liegen.
        </p>
      </Section>

      <Section title="§ 10 Gewährleistung und Haftung">
        <p>
          Für Mängel kostenpflichtiger Erweiterungen gelten die gesetzlichen
          Vorschriften, insbesondere die §§ 327 ff. BGB für digitale Produkte.
        </p>
        <p>
          Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei der
          Verletzung von Leben, Körper oder Gesundheit sowie nach dem
          Produkthaftungsgesetz. Bei leichter Fahrlässigkeit haften wir nur bei
          Verletzung einer wesentlichen Vertragspflicht, deren Erfüllung die
          ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht
          und auf deren Einhaltung du regelmäßig vertrauen darfst
          (Kardinalpflicht); in diesem Fall ist die Haftung auf den
          vorhersehbaren, vertragstypischen Schaden begrenzt. Im Übrigen ist die
          Haftung für leichte Fahrlässigkeit ausgeschlossen.
        </p>
      </Section>

      <Section title="§ 11 Laufzeit, Kündigung und Löschung">
        <p>
          Du kannst dein Konto jederzeit ohne Angabe von Gründen löschen lassen,
          indem du uns eine E-Mail an <EmailLink /> sendest. Mit der Löschung
          werden auch deine Events und die zugehörigen Gästelisten gelöscht;
          erworbene Erweiterungen entfallen.
        </p>
        <p>
          Wir können die Nutzung mit einer Frist von vier Wochen kündigen,
          solange du keine kostenpflichtige Erweiterung erworben hast. Das
          Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt
          unberührt. Eine Einstellung von GASTZILLA kündigen wir mit einer Frist
          von mindestens drei Monaten an. Deine gesetzlichen Ansprüche bleiben
          davon unberührt.
        </p>
      </Section>

      <Section title="§ 12 Änderungen dieser AGB">
        <p>
          Änderungen dieser AGB teilen wir registrierten Nutzern rechtzeitig
          vorab per E-Mail mit. Für bestehende Konten gelten sie erst, wenn du
          ihnen zustimmst. Stimmst du nicht zu, gelten die bisherigen AGB
          weiter; wir können die Nutzung dann nach Maßgabe von § 11 kündigen.
          Bereits bezahlte Erweiterungen werden durch Änderungen nicht
          eingeschränkt.
        </p>
      </Section>

      <Section title="§ 13 Schlussbestimmungen">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur, soweit
          dadurch nicht der Schutz durch zwingende Bestimmungen des Rechts des
          Staates entzogen wird, in dem sie ihren gewöhnlichen Aufenthalt haben.
        </p>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
        <p>
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die
          Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </Section>

      <LastUpdated date="September 2026" />
    </LegalBody>
  );
}
