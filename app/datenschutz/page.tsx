import React from "react";
import HeaderBlock from "@/app/components/header";
import NavigationBlock from "@/app/components/navigation";
import FooterBlock from "@/app/components/footer";

export default function DatenschutzPage() {
  return (
    <div className="flex bg-zinc-50 font-sans dark:bg-black flex-col items-center justify-center w-full p-4 md:p-3">
      <HeaderBlock />
      <NavigationBlock />

      <div className="w-full max-w-3xl px-5 mt-10 mb-10">
        <article className="bg-white border border-gray-300 p-8 flex flex-col gap-4 text-sm text-gray-700">
          <h1 className="text-3xl font-serif font-bold">Datenschutzerklärung</h1>

          <h2 className="text-xl font-bold mt-4">1. Verantwortlicher</h2>
          <p>
            IT-ÄRZTE GmbH – The Medical IT Post
            <br />
            [Anschrift einsetzen]
            <br />
            E-Mail: [Kontakt-E-Mail einsetzen]
          </p>

          <h2 className="text-xl font-bold mt-4">2. Newsletter</h2>
          <p>
            Für den Versand unseres Newsletters verarbeiten wir Ihre
            E-Mail-Adresse auf Grundlage Ihrer Einwilligung
            (Art. 6 Abs. 1 lit. a DSGVO). Die Anmeldung erfolgt im
            Double-Opt-in-Verfahren: Sie erhalten nach der Anmeldung eine
            Bestätigungs-E-Mail; erst nach Klick auf den Bestätigungslink
            wird der Newsletter versendet. Wir dokumentieren den Zeitpunkt
            der Anmeldung und der Bestätigung sowie den Wortlaut der
            Einwilligung.
          </p>
          <p>
            Sie können den Newsletter jederzeit über den Abmeldelink am Ende
            jeder E-Mail abbestellen (Widerruf der Einwilligung,
            Art. 7 Abs. 3 DSGVO). Auf Wunsch löschen wir Ihre Daten
            vollständig – kontaktieren Sie uns dazu formlos per E-Mail.
          </p>

          <h2 className="text-xl font-bold mt-4">3. Speicherung</h2>
          <p>
            Ihre Daten (E-Mail-Adresse, Status der Anmeldung, Zeitpunkte von
            Anmeldung/Bestätigung/Abmeldung) werden auf unserem Server
            gespeichert und nicht an Dritte weitergegeben. Nach einer
            Abmeldung verbleibt die Adresse zur Dokumentation des Widerrufs,
            bis Sie die vollständige Löschung verlangen.
          </p>

          <h2 className="text-xl font-bold mt-4">4. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft (Art. 15), Berichtigung
            (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
            (Art. 18), Datenübertragbarkeit (Art. 20) sowie das Recht auf
            Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO).
          </p>

          <p className="text-xs text-gray-400 mt-4">
            Hinweis: Bitte ergänzen Sie Anschrift und Kontaktdaten und lassen
            Sie diese Vorlage juristisch prüfen.
          </p>
        </article>
      </div>

      <FooterBlock />
    </div>
  );
}
