import { Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";

export const BannerConfidential = () => {
  return (
    <section className="trust-strip" aria-label="Privacidad">
      <div className="trust-item">
        <ShieldCheck size={25} />
        <span>
          <b>Privado por diseño</b>
          <small>Tu ZIP no se envía a un servidor.</small>
        </span>
      </div>

      <div className="trust-item">
        <LockKeyhole size={25} />
        <span>
          <b>Sin contraseña</b>
          <small>Nunca pedimos acceso a tu cuenta.</small>
        </span>
      </div>
      
      <div className="trust-item">
        <Fingerprint size={25} />
        <span>
          <b>Sin huella permanente</b>
          <small>No guardamos tu análisis.</small>
        </span>
      </div>
      
      <div className="trust-aside">
        LESS ACCESS.
        <br />
        <span>MORE CLARITY.</span>
      </div>
    </section>
  );
};
