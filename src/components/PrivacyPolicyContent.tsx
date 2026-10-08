import { MIN_REGISTRATION_AGE } from "@/lib/legal-info";
import {
  EmailLink,
  ExternalLink,
  LastUpdated,
  LegalBody,
  List,
  PostalAddress,
  Section,
  SubHeading,
} from "./LegalText";

export function PrivacyPolicyContent() {
  return (
    <LegalBody>
      <Section title="1. Verantwortlicher">
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
        <p>
          <PostalAddress />
          <br />
          E-Mail: <EmailLink />
        </p>
        <p>
          Bei Fragen zum Datenschutz und zur Ausübung deiner Rechte kannst du
          dich jederzeit an diese Adresse wenden.
        </p>
      </Section>

      <Section title="2. Überblick">
        <p>
          GASTZILLA ermöglicht es, digitale Einladungen für Events zu erstellen
          und Gästelisten zu führen. Wir verarbeiten personenbezogene Daten nur,
          soweit dies für den Betrieb der Website und die Bereitstellung
          unserer Leistungen erforderlich ist, eine gesetzliche Pflicht besteht
          oder du eingewilligt hast.
        </p>
        <p>Wir stützen uns dabei auf folgende Rechtsgrundlagen der DSGVO:</p>
        <List>
          <li>Art. 6 Abs. 1 lit. a – Einwilligung</li>
          <li>Art. 6 Abs. 1 lit. b – Vertrag bzw. vorvertragliche Maßnahmen (Nutzung von GASTZILLA)</li>
          <li>Art. 6 Abs. 1 lit. c – rechtliche Verpflichtung (z. B. steuerliche Aufbewahrungspflichten)</li>
          <li>Art. 6 Abs. 1 lit. f – berechtigte Interessen (z. B. sicherer und stabiler Betrieb)</li>
        </List>
        <p>
          Das Speichern von Informationen auf deinem Endgerät bzw. der Zugriff
          darauf richtet sich zusätzlich nach § 25 TDDDG.
        </p>
      </Section>

      <Section title="3. Hosting und Server-Logfiles">
        <p>
          Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina,
          CA 91723, USA gehostet. Die Serverfunktionen laufen in einem
          Rechenzentrum in Frankfurt am Main. Statische Inhalte werden über das
          weltweite Netzwerk von Vercel ausgeliefert, damit die Seite schnell
          lädt.
        </p>
        <p>Beim Aufruf der Website werden automatisch folgende Daten verarbeitet:</p>
        <List>
          <li>IP-Adresse</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>aufgerufene Seite bzw. Datei</li>
          <li>Referrer-URL (zuvor besuchte Seite)</li>
          <li>Browser, Betriebssystem und Gerätetyp (User-Agent)</li>
        </List>
        <p>
          Die Verarbeitung ist technisch erforderlich, um die Website
          auszuliefern und ihre Sicherheit zu gewährleisten (Art. 6 Abs. 1
          lit. f DSGVO). Die Logdaten werden nur kurzfristig gespeichert und
          anschließend automatisch gelöscht.
        </p>
        <p>
          Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung (Art. 28
          DSGVO). Soweit Daten in die USA übermittelt werden, erfolgt dies auf
          Grundlage des EU-US Data Privacy Framework, unter dem Vercel
          zertifiziert ist, sowie ergänzend der Standardvertragsklauseln der
          EU-Kommission. Weitere Informationen:{" "}
          <ExternalLink href="https://vercel.com/legal/privacy-policy" />
        </p>
      </Section>

      <Section title="4. SSL-/TLS-Verschlüsselung">
        <p>
          Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw.
          TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennst du an
          „https://“ und dem Schloss-Symbol in der Adresszeile deines Browsers.
        </p>
      </Section>

      <Section title="5. Cookies und lokale Speicherung">
        <p>
          Wir verwenden ausschließlich Cookies und lokale Speichertechniken, die
          für den Betrieb erforderlich sind, sowie – nur mit deiner Einwilligung
          – Google reCAPTCHA. Analyse-, Tracking- oder Werbe-Cookies setzen wir
          nicht ein.
        </p>
        <SubHeading>Technisch notwendig</SubHeading>
        <List>
          <li>
            <strong>Anmelde-Cookies (Supabase):</strong> halten deine Sitzung
            aufrecht, solange du eingeloggt bist. Sie werden beim Logout bzw.
            nach Ablauf der Sitzung gelöscht.
          </li>
          <li>
            <strong>Freischalt-Cookie (passwortgeschützte Events):</strong> merkt
            sich für bis zu 180 Tage, dass du das Passwort eines Events richtig
            eingegeben hast, damit du es nicht bei jedem Besuch erneut eingeben
            musst. Es enthält kein Passwort, nur eine Prüfsumme.
          </li>
          <li>
            <strong>Cookie-Auswahl (Local Storage):</strong> speichert deine
            Entscheidung im Cookie-Banner, damit wir nicht bei jedem Besuch
            erneut fragen müssen. Der Eintrag bleibt, bis du ihn in deinem
            Browser löschst.
          </li>
        </List>
        <p>
          Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG sowie Art. 6 Abs. 1 lit. b
          bzw. lit. f DSGVO.
        </p>
        <SubHeading>Nur mit Einwilligung</SubHeading>
        <List>
          <li>
            <strong>Google reCAPTCHA</strong> – siehe Abschnitt 10.
          </li>
        </List>
        <p>
          Deine Auswahl kannst du jederzeit über den Link „Cookies“ unten auf
          der Seite ändern und eine erteilte Einwilligung mit Wirkung für die
          Zukunft widerrufen.
        </p>
      </Section>

      <Section title="6. Benutzerkonto">
        <p>
          Um Events anzulegen, benötigst du ein Benutzerkonto. Dabei verarbeiten
          wir deinen Namen, deine E-Mail-Adresse und dein Passwort (nur als
          verschlüsselter Hash gespeichert) sowie technische Anmeldedaten wie
          Zeitpunkt und IP-Adresse von Login-Vorgängen zur Absicherung deines
          Kontos. Zur Bestätigung der Registrierung und für das Zurücksetzen
          des Passworts senden wir dir E-Mails.
        </p>
        <p>
          Alternativ kannst du dich mit deinem Google-Konto registrieren und
          anmelden („Mit Google fortfahren“). Dann leitet dich unser
          Auth-Dienstleister Supabase zu Google weiter (Google Ireland Limited,
          Gordon House, Barrow Street, Dublin 4, Irland). Google übermittelt
          nach deiner Bestätigung Angaben zu deinem Google-Konto (u. a. Name,
          E-Mail-Adresse und Profilbild) an unseren Auth-Dienstleister
          Supabase. Wir verwenden davon deinen Namen (als Anzeigenamen), deine
          E-Mail-Adresse und die Kennung deines Google-Kontos für die
          Anmeldung. Den Namen übernehmen wir bei jeder Anmeldung neu aus
          deinem Google-Konto. Ein Passwort wird dann nicht bei uns
          gespeichert. Welche Daten Google dabei selbst verarbeitet, regelt
          Googles Datenschutzerklärung:{" "}
          <ExternalLink href="https://policies.google.com/privacy" />. Die
          Rechtsgrundlage für unsere Verarbeitung ist Art. 6 Abs. 1 lit. b
          DSGVO.
        </p>
        <p>
          Bei der Registrierung bestätigst du, dass du die AGB akzeptierst,
          diese Datenschutzerklärung zur Kenntnis genommen hast und mindestens{" "}
          {MIN_REGISTRATION_AGE} Jahre alt bist. Dazu speichern wir in deinem
          Konto den Zeitpunkt, die jeweils gültige Fassung von AGB und
          Datenschutzerklärung sowie die Altersbestätigung, um den
          Vertragsschluss nachweisen zu können. Ein Geburtsdatum oder
          Ausweisdokument erheben wir nicht. Die Bestätigung ist keine Einwilligung in die
          Datenverarbeitung – die Verarbeitung deiner Kontodaten beruht auf
          dem Nutzungsvertrag.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung des
          Kontos) sowie für die Absicherung des Kontos und den Nachweis des
          Vertragsschlusses Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Für die Benutzerverwaltung und die Datenbank nutzen wir Supabase
          (Supabase Inc., USA). Die Daten werden in einem Rechenzentrum in
          Irland (EU) gespeichert. Mit Supabase besteht ein Vertrag zur
          Auftragsverarbeitung; für einen möglichen Zugriff aus den USA gelten
          die Standardvertragsklauseln der EU-Kommission. Weitere
          Informationen: <ExternalLink href="https://supabase.com/privacy" />
        </p>
      </Section>

      <Section title="7. Events erstellen">
        <p>
          Wenn du ein Event anlegst, speichern wir die von dir eingegebenen
          Inhalte, z. B. Titel, Begrüßungstext, Datum, Uhrzeit, Ort sowie die
          Kontaktangaben (Name, Telefonnummer, E-Mail-Adresse).
        </p>
        <p>
          <strong>Wichtig:</strong> Die Event-Seite ist für alle Personen
          abrufbar, die den Einladungslink kennen. Die dort angezeigten
          Kontaktangaben sind damit für alle Eingeladenen sichtbar – und für
          jeden, an den der Link weitergegeben wird. Bitte gib nur Daten an, die
          du auf diese Weise teilen möchtest.
        </p>
        <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.</p>
      </Section>

      <Section title="8. Anmeldung als Gast">
        <p>
          Wenn du dich über eine Event-Seite als Gast einträgst, verarbeiten wir
          die Angaben aus dem Formular:
        </p>
        <List>
          <li>Name</li>
          <li>ob du zusagst oder absagst</li>
          <li>bei einer Zusage: Anzahl und Namen weiterer Gäste bzw. Begleitpersonen</li>
          <li>bei einer Zusage: voraussichtliche Ankunftszeit</li>
          <li>optional bei einer Zusage: bis wann du bleibst</li>
          <li>optional bei einer Zusage: was du mitbringst</li>
          <li>optional: eine Nachricht an den Veranstalter</li>
        </List>
        <p>
          <strong>Wichtig:</strong> Die Gästeliste ist auf der Event-Seite für
          alle sichtbar, die den Einladungslink kennen – bei einem
          passwortgeschützten Event für alle, die zusätzlich das Passwort
          kennen. Bitte gib keine
          sensiblen Informationen an (z. B. Gesundheitsdaten wie Allergien in
          der Nachricht) und beschränke dich bei Kindern möglichst auf den
          Vornamen. Wenn du Begleitpersonen einträgst, stelle bitte sicher,
          dass diese damit einverstanden sind.
        </p>
        <p>
          Der Veranstalter wird per E-Mail benachrichtigt, wenn sich jemand
          einträgt, absagt, einen Eintrag ändert oder entfernt; die Benachrichtigung
          enthält den Namen des Gastes.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Teilnahme an der
          Gästeliste). Du kannst deinen Eintrag jederzeit selbst ändern oder
          löschen.
        </p>
        <SubHeading>Passwort-Anfrage</SubHeading>
        <p>
          Ist ein Event passwortgeschützt, kannst du das Passwort beim
          Veranstalter anfragen. Dafür verarbeiten wir deinen Namen, je nach
          Wahl deine E-Mail-Adresse oder deine Telefonnummer samt gewünschtem
          Weg (z. B. SMS oder WhatsApp) sowie eine optionale Nachricht.
        </p>
        <p>
          Diese Angaben schicken wir einmalig per E-Mail an den Veranstalter
          und speichern sie nicht in unserer Datenbank. Bei einer Anfrage per
          E-Mail kann der Veranstalter direkt auf deine Adresse antworten.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Teilnahme an der
          Veranstaltung) bzw. lit. f DSGVO (berechtigtes Interesse an der
          Kontaktaufnahme).
        </p>
      </Section>

      <Section title="9. E-Mail-Versand und Kontakt">
        <p>
          Systemnachrichten (Registrierungsbestätigung, Passwort zurücksetzen,
          Benachrichtigungen über Änderungen an der Gästeliste) versenden wir
          über den E-Mail-Server der STRATO GmbH, Otto-Ostrowski-Straße 7,
          10249 Berlin. Mit STRATO besteht ein Vertrag zur
          Auftragsverarbeitung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
        </p>
        <p>
          Wenn du uns per E-Mail kontaktierst, verarbeiten wir deine Angaben,
          um deine Anfrage zu beantworten (Art. 6 Abs. 1 lit. b bzw. lit. f
          DSGVO). Die Daten werden gelöscht, sobald die Anfrage erledigt ist und
          keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
        </p>
      </Section>

      <Section title="10. Google reCAPTCHA">
        <p>
          Zum Schutz unserer Formulare (Registrierung, Login, Gästeliste) vor
          Spam und Missbrauch nutzen wir – nur nach deiner Einwilligung – Google
          reCAPTCHA. Anbieter ist die Google Ireland Limited, Gordon House,
          Barrow Street, Dublin 4, Irland.
        </p>
        <p>
          reCAPTCHA prüft, ob eine Eingabe von einem Menschen oder einem
          automatisierten Programm stammt. Dazu werden u. a. IP-Adresse,
          Browser- und Geräteinformationen, Verweildauer sowie Maus- bzw.
          Touch-Interaktionen an Google übermittelt; Google setzt dabei eigene
          Cookies. Eine Übermittlung in die USA an die Google LLC ist möglich;
          Google ist unter dem EU-US Data Privacy Framework zertifiziert.
        </p>
        <p>
          Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO,
          § 25 Abs. 1 TDDDG). Ohne Einwilligung wird reCAPTCHA nicht geladen;
          die geschützten Formulare können dann allerdings nicht genutzt
          werden. Du kannst deine Einwilligung jederzeit über den Link
          „Cookies“ widerrufen.
        </p>
        <p>
          Weitere Informationen:{" "}
          <ExternalLink href="https://policies.google.com/privacy" />
        </p>
      </Section>

      <Section title="11. Bilder über Cloudinary">
        <p>
          Einige Grafiken (z. B. Logos) laden wir vom Bilddienst Cloudinary
          (Cloudinary Ltd., 3400 Central Expressway, Suite 110, Santa Clara, CA
          95051, USA). Dabei wird deine IP-Adresse an Cloudinary übertragen,
          damit die Bilder an deinen Browser ausgeliefert werden können.
          Cookies werden dabei nicht gesetzt.
        </p>
        <p>
          Rechtsgrundlage ist unser berechtigtes Interesse an einer schnellen
          und zuverlässigen Auslieferung der Grafiken (Art. 6 Abs. 1 lit. f
          DSGVO). Für eine Übermittlung in die USA gelten die
          Standardvertragsklauseln der EU-Kommission. Weitere Informationen:{" "}
          <ExternalLink href="https://cloudinary.com/privacy" />
        </p>
      </Section>

      <Section title="12. Schriftarten">
        <p>
          Die verwendeten Schriftarten (Nunito, Fredoka) sind lokal auf unserem
          Server eingebunden. Beim Aufruf der Seite wird keine Verbindung zu
          Servern von Google oder anderen Schriftanbietern hergestellt.
        </p>
      </Section>

      <Section title="13. Zahlungen über Stripe">
        <p>
          Für kostenpflichtige Erweiterungen wickeln wir Zahlungen über Stripe
          ab. Anbieter ist die Stripe Payments Europe, Ltd., 1 Grand Canal
          Street Lower, Grand Canal Dock, Dublin, D02 H210, Irland.
        </p>
        <p>
          Beim Bezahlvorgang wirst du auf eine Zahlungsseite von Stripe
          weitergeleitet bzw. gibst deine Zahlungsdaten direkt bei Stripe ein.
          Stripe verarbeitet dabei insbesondere Name, E-Mail-Adresse,
          Zahlungsdaten (z. B. Kartendaten), Rechnungsanschrift, IP-Adresse
          und Transaktionsdaten. Vollständige Zahlungsdaten wie Kartennummern
          erhalten wir nicht; wir bekommen von Stripe lediglich die
          Informationen, die für die Zuordnung der Zahlung und die Buchhaltung
          erforderlich sind (z. B. Betrag, Zeitpunkt, gekaufte Erweiterung).
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
          sowie Art. 6 Abs. 1 lit. c DSGVO für die gesetzlichen
          Aufbewahrungspflichten. Stripe verarbeitet Daten zur Betrugsprävention
          und zur Erfüllung eigener gesetzlicher Pflichten teilweise in eigener
          Verantwortung. Eine Übermittlung in die USA an die Stripe, Inc. ist
          möglich; Stripe ist unter dem EU-US Data Privacy Framework
          zertifiziert. Weitere Informationen:{" "}
          <ExternalLink href="https://stripe.com/de/privacy" />
        </p>
      </Section>

      <Section title="14. Speicherdauer">
        <List>
          <li>
            <strong>Benutzerkonto:</strong> bis zur Löschung deines Kontos.
          </li>
          <li>
            <strong>Events und Gästelisten:</strong> bis der Veranstalter das
            Event bzw. einzelne Einträge löscht, spätestens mit Löschung des
            Kontos des Veranstalters.
          </li>
          <li>
            <strong>Eigener Gasteintrag:</strong> bis du ihn selbst löschst oder
            das Event gelöscht wird.
          </li>
          <li>
            <strong>Zahlungs- und Rechnungsdaten:</strong> gemäß den
            gesetzlichen Aufbewahrungsfristen (bis zu 10 Jahre, § 147 AO, § 257
            HGB).
          </li>
          <li>
            <strong>Server-Logfiles:</strong> nur kurzfristig, anschließend
            automatische Löschung.
          </li>
        </List>
        <p>
          Dein Konto kannst du jederzeit selbst unter „Mein Konto“ → „Konto
          löschen“ endgültig löschen; dabei werden auch deine Events und
          Gästelisten gelöscht. Alternativ kannst du die Löschung formlos per
          E-Mail an <EmailLink /> beantragen.
        </p>
      </Section>

      <Section title="15. Deine Rechte">
        <p>Du hast gegenüber uns folgende Rechte hinsichtlich deiner Daten:</p>
        <List>
          <li>Auskunft (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>
            Widerruf einer Einwilligung mit Wirkung für die Zukunft (Art. 7
            Abs. 3 DSGVO)
          </li>
        </List>
        <SubHeading>Widerspruchsrecht (Art. 21 DSGVO)</SubHeading>
        <p>
          Soweit wir Daten auf Grundlage berechtigter Interessen (Art. 6 Abs. 1
          lit. f DSGVO) verarbeiten, kannst du aus Gründen, die sich aus deiner
          besonderen Situation ergeben, jederzeit Widerspruch gegen diese
          Verarbeitung einlegen. Wir verarbeiten die Daten dann nicht mehr, es
          sei denn, wir können zwingende schutzwürdige Gründe nachweisen, die
          deine Interessen überwiegen, oder die Verarbeitung dient der
          Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.
        </p>
        <SubHeading>Beschwerderecht</SubHeading>
        <p>
          Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu
          beschweren, insbesondere in dem Mitgliedstaat deines Aufenthaltsorts,
          deines Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes
          (Art. 77 DSGVO).
        </p>
      </Section>

      <Section title="16. Pflicht zur Bereitstellung, automatisierte Entscheidungen">
        <p>
          Die Bereitstellung deiner Daten ist weder gesetzlich noch vertraglich
          vorgeschrieben. Ohne die als Pflichtfelder gekennzeichneten Angaben
          können wir dir die jeweilige Funktion (z. B. Konto, Gasteintrag)
          jedoch nicht bereitstellen. Eine automatisierte Entscheidungsfindung
          einschließlich Profiling (Art. 22 DSGVO) findet nicht statt.
        </p>
      </Section>

      <Section title="17. Änderungen">
        <p>
          Wir passen diese Datenschutzerklärung an, wenn sich unsere Leistungen
          oder die Rechtslage ändern. Es gilt die jeweils hier veröffentlichte
          Fassung.
        </p>
      </Section>
      <LastUpdated date="Oktober 2026" />
    </LegalBody>
  );
}
