/**
 * Teilt lange Fließtexte in lesbare Absätze auf. Wird für ältere
 * Archiv-Artikel gebraucht, deren Absatzstruktur beim Import
 * verloren gegangen ist (alles eine Zeile).
 */

// Endet ein Satzfragment auf eine Abkürzung, war der Punkt kein Satzende
const ABBREVIATION_END =
  /\b(z|B|bzw|ca|Dr|Prof|Nr|etc|inkl|ggf|vgl|sog|Mio|Mrd|St|usw|u|d|h|Abs|Art)\.$/;

/** Zerlegt Text in Sätze (deutsch, mit Abkürzungs-Heuristik). */
function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„“"»(])/);
  const sentences: string[] = [];
  for (const part of parts) {
    const prev = sentences[sentences.length - 1];
    if (prev && ABBREVIATION_END.test(prev)) {
      sentences[sentences.length - 1] = `${prev} ${part}`;
    } else {
      sentences.push(part);
    }
  }
  return sentences;
}

/**
 * Gruppiert Sätze zu Absätzen von maximal ~maxChars Zeichen
 * und trennt sie mit Markdown-Absätzen (Leerzeile).
 */
export function paragraphize(text: string, maxChars = 400): string {
  const sentences = splitSentences(text);
  const paragraphs: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > maxChars) {
      paragraphs.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs.join("\n\n");
}

/**
 * Macht einen Markdown-Body lesbar: überlange Textzeilen werden in
 * Absätze aufgeteilt, Überschriften/Bilder bleiben unangetastet.
 */
export function paragraphizeMarkdown(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("#") ||
        trimmed.startsWith("!") ||
        trimmed.length <= 400
      ) {
        return line;
      }
      return paragraphize(trimmed);
    })
    .join("\n");
}
