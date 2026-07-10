const Hero = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
      <p className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-8">
        AI-powered video clipping
      </p>

      <h1 className="text-4xl md:text-6xl xl:text-8xl font-bold leading-[1.05] tracking-tight text-[var(--color-text)] mb-6">
        Your videos are {/*<br className="hidden md:block" />*/} full of moments.
      </h1>

      <h2 className="text-xl md:2xl font-normal text-[var(--color-text-muted)] leading-snug mb-6">
        Cliprol finds the ones worth posting and returns ready to post clips.
      </h2>

      <p className="text-base md:text-lg font-light text-[var(--color-text-dim)] leading-relaxed max-w-3xl m-auto">
        Paste a YouTube link or upload your video. Cliprol analyzes your
        content, finds the strongest moments, and returns clips ready to share.
      </p>
    </section>
  );
};

export default Hero;
