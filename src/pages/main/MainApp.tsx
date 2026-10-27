import { Sparkles, Fingerprint, Orbit } from "lucide-react";

export const MainApp = () => {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-line" /> TUS RRSS, EN CLARO{" "}
          <span className="eyebrow-index">001 — PRIVATE TOOL</span>
        </div>
        <h1>
          Tu círculo.
          <br />
          <span className="headline-outline">Sin</span>{" "}
          <span className="headline-accent">filtros.</span>
        </h1>
        <p className="hero-description">
          Descubre quién está de verdad en tu órbita. Sin entregar tu
          contraseña. Sin conectar tu cuenta. Sin dramas.
        </p>
        <div className="hero-footnote">
          <span className="sparkle-wrap">
            <Sparkles size={15} />
          </span>{" "}
          Solo necesitas el archivo oficial de Instagram.
        </div>
      </div>

      <div
        className="visual-stage"
        aria-label="Ilustración abstracta de conexiones sociales"
      >
        <div className="stage-label stage-label--top">
          CONNECTIONS / DETECTED
        </div>
        <div className="orbit orbit--outer">
          <span className="orbit-dot orbit-dot--lime" />
          <span className="orbit-dot orbit-dot--violet" />
        </div>
        <div className="orbit orbit--middle">
          <span className="orbit-dot orbit-dot--white" />
        </div>
        <div className="orbit orbit--inner">
          <span className="orbit-dot orbit-dot--pink" />
        </div>
        <div className="core-glow" />
        <div className="core-card">
          <div className="core-card-top">
            <span className="core-star">✳</span>
            <span>YOUR SOCIAL GRAPH</span>
          </div>
          <div className="core-glyph">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="core-card-bottom">
            <span>NO LOGIN REQUIRED</span>
            <span className="live-dot" />
          </div>
        </div>
        <div className="floating-note floating-note--one">
          <span className="note-icon note-icon--lime">
            <Fingerprint size={15} />
          </span>
          <span>
            <b>100% privado</b>
            <small>Procesamiento local</small>
          </span>
        </div>
        <div className="floating-note floating-note--two">
          <span className="note-icon note-icon--violet">
            <Orbit size={15} />
          </span>
          <span>
            <b>Tu órbita social</b>
            <small>Sin ruido. Solo datos.</small>
          </span>
        </div>
        <span className="stage-cross stage-cross--one">+</span>
        <span className="stage-cross stage-cross--two">+</span>
        <div className="stage-label stage-label--bottom">
          FIG. 01 <span>YOUR PEOPLE, YOUR DATA.</span>
        </div>
      </div>
    </section>
  );
};
