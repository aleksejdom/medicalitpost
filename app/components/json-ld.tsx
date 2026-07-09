import React from "react";

/**
 * Rendert ein schema.org-Objekt als JSON-LD-Script-Tag.
 * "<" wird escaped, damit kein "</script>" aus Artikeldaten
 * das Script-Tag vorzeitig beenden kann.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
