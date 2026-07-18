export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <section className="hero">
      <span className="eyebrow">In progress</span>
      <h1 className="hero-title">{title}</h1>
      <p className="hero-desc">{description}</p>
      <div className="notice" style={{ marginTop: 24 }}>
        <span className="notice-dot" />
        <span>
          This page isn&apos;t built yet. The underlying data is already live — see the{" "}
          <a href="/">overview</a> for what&apos;s tracked so far.
        </span>
      </div>
    </section>
  );
}
