function ProductsIcon() {
  return <svg className="products-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5 12 4l8 4.5v9L12 22l-8-4.5v-9Z"/><path d="M4.5 8.7 12 13l7.5-4.3M12 13v9"/></svg>;
}

export default function ProductsPage() {
  return <main>
    <header className="nav"><a className="brand" href="/">MyFit<span>Plan</span></a><div className="navlinks"><a className="products-nav" href="/products"><ProductsIcon/> Products</a><a href="/">Home</a></div></header>
    <section className="products-page pagepad">
      <div className="hero-glow" />
      <span className="eyebrow">MYFITPLAN PRODUCTS</span>
      <h1>Gear for your<br/><em>next workout.</em></h1>
      <p>We&apos;re carefully preparing a small collection of practical workout essentials. Products will appear here when they&apos;re ready.</p>
      <div className="products-placeholder">
        <ProductsIcon/>
        <h2>Coming soon</h2>
        <p>Workout accessories and training essentials will be added here later.</p>
      </div>
    </section>
  </main>;
}
