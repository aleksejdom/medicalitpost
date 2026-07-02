import React from "react";
import Link from "next/link";
import HeaderBlock from "@/app/components/header";
import NavigationBlock from "@/app/components/navigation";
import FooterBlock from "@/app/components/footer";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, { title: string; text: string }> = {
  bestaetigt: {
    title: "Anmeldung bestätigt",
    text: "Vielen Dank! Ihre Newsletter-Anmeldung ist bestätigt. Sie erhalten ab jetzt täglich 1–2 ausgewählte News aus IT & Gesundheitswesen.",
  },
  abgemeldet: {
    title: "Abmeldung erfolgreich",
    text: "Sie wurden vom Newsletter abgemeldet und erhalten keine weiteren E-Mails von uns. Ihre Daten können auf Wunsch vollständig gelöscht werden – schreiben Sie uns dazu einfach.",
  },
  ungueltig: {
    title: "Link ungültig",
    text: "Dieser Bestätigungs- oder Abmeldelink ist ungültig oder abgelaufen. Bitte melden Sie sich erneut an oder kontaktieren Sie uns.",
  },
};

export default async function NewsletterStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const info = MESSAGES[status || ""] || MESSAGES.ungueltig;

  return (
    <div className="flex bg-zinc-50 font-sans dark:bg-black flex-col items-center justify-center w-full p-4 md:p-3">
      <HeaderBlock />
      <NavigationBlock />

      <div className="w-full max-w-2xl px-5 mt-10 mb-10">
        <div className="bg-white border border-gray-300 p-8 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">{info.title}</h1>
          <p className="text-gray-600 mb-6">{info.text}</p>
          <Link href="/" className="text-blue-600 underline text-sm">
            Zur Startseite
          </Link>
        </div>
      </div>

      <FooterBlock />
    </div>
  );
}
