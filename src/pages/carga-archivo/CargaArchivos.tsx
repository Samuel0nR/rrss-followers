import { ArrowRight } from "lucide-react";
import type { ShowHowType } from "../../types/ShowHow.type";
import { FileUploadComponent } from "../../components/files-uploader/FileUpload";
import type { SocialResults } from "../detalle-archivo/DetalleArchivo";

type Props = ShowHowType & { onProcessed: (results: SocialResults) => void };

export const CargaArchivosPage = (props: Props) => {
  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <div className="upload-intro">
        <div className="section-kicker">
          <span>01</span> EMPEZAR ES FÁCIL
        </div>
        <h2 id="upload-heading">
          Trae tu archivo.
          <br />
          <span>Lo demás va por nuestra cuenta.</span>
        </h2>
        <p>
          Exporta tus datos desde Instagram y suelta aquí el ZIP. No necesitas
          instalar nada.
        </p>
        <button
          className="text-action"
          onClick={() => props.setShowHow((v) => !v)}
          aria-expanded={props.ShowHow}
        >
          ¿Dónde consigo mi archivo? <ArrowRight size={15} />
        </button>
      </div>

      {/* Componente para Cargar Archivos */}
      <FileUploadComponent onProcessed={props.onProcessed} />
    </section>
  );
};
