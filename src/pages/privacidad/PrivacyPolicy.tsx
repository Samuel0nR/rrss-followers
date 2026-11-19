import { ArrowLeft, Fingerprint, LockKeyhole, Server } from "lucide-react";

type Props = { onBack: () => void };

export function PrivacyPolicyPage({ onBack }: Props) {
  return (
    <article className="privacy-page" aria-labelledby="privacy-title">
      <button className="results-back" type="button" onClick={onBack}>
        <ArrowLeft size={16} /> Volver a inicio
      </button>

      <header className="privacy-heading">
        <div className="section-kicker"><span>INFO</span> TRANSPARENCIA Y DATOS</div>
        <h1 id="privacy-title">Privacidad <span>y tratamiento</span></h1>
        <p>Qué ocurre con los archivos que eliges analizar en esta aplicación.</p>
      </header>

      <div className="privacy-content">
        <section className="privacy-card">
          <span className="privacy-card-icon"><Fingerprint size={19} /></span>
          <div>
            <h2>Procesamiento local</h2>
            <p>Esta aplicación procesa los archivos de exportación de Instagram directamente en el navegador del usuario.</p>
            <p>Los archivos seleccionados no son enviados a nuestros servidores ni almacenados en nuestras bases de datos. Todo el análisis y comparación de información se realiza localmente en el dispositivo.</p>
          </div>
        </section>

        <section className="privacy-card">
          <span className="privacy-card-icon"><LockKeyhole size={19} /></span>
          <div>
            <h2>Sin acceso a tu cuenta</h2>
            <p>La aplicación no solicita credenciales, contraseñas ni acceso a cuentas de Instagram.</p>
          </div>
        </section>

        <section className="privacy-card">
          <span className="privacy-card-icon"><Server size={19} /></span>
          <div>
            <h2>Datos técnicos del sitio</h2>
            <p>El servicio puede utilizar un proveedor de alojamiento web que procese metadatos técnicos necesarios para entregar el sitio, como información de conexión.</p>
          </div>
        </section>

        <p className="privacy-independence">Esta aplicación es independiente y no está afiliada, patrocinada ni respaldada por Meta o Instagram.</p>
      </div>
    </article>
  );
}
