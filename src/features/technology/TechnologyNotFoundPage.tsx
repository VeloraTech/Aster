export default function TechnologyNotFoundPage() {
  return (
    <section className="technology-not-found" aria-labelledby="technology-not-found-title">
      <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Technology profile</p>
      <h1 id="technology-not-found-title">Technology not found.</h1>
      <p>We couldn’t find the technology you’re looking for in this collection.</p>
      <a className="button-primary" href="/explore">Back to Explore</a>
    </section>
  )
}
