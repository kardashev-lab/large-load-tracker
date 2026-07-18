/** Inline jargon-buster: wraps a plain-English label, reveals the technical
 * term/definition on hover or keyboard focus. Pure CSS, no client JS needed
 * even inside server components. */
export function Term({ children, def }: { children: React.ReactNode; def: string }) {
  return (
    <span className="term" tabIndex={0}>
      {children}
      <span className="term-tip" role="tooltip">
        {def}
      </span>
    </span>
  );
}
