/**
 * Renders the admin-editable "markdown-lite" body used by policy pages:
 * `## ` starts a heading, `- ` starts a bullet list item, and blank-line
 * separated blocks become paragraphs. Deliberately minimal (no bold/links/
 * tables) so it's plain enough for a non-technical admin to write directly
 * in a textarea, while covering the structure these pages actually need.
 */
export function PolicyMarkdown({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return <h2 key={i}>{block.slice(3).trim()}</h2>;
        }

        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.slice(2).trim()}</li>
              ))}
            </ul>
          );
        }

        return <p key={i}>{block}</p>;
      })}
    </>
  );
}
