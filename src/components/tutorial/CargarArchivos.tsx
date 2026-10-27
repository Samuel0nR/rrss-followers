import { X } from "lucide-react";
import type { ShowHowType } from "../../types/ShowHow.type";

export const ComoCargarArchivos = (props: ShowHowType) => {
  return (
    <section className="how-panel" id="how">
      <div className="how-panel-head">
        <span className="section-kicker">
          <span>?</span> CÓMO CONSEGUIRLO
        </span>
        <button
          onClick={() => props.setShowHow(false)}
          aria-label="Cerrar instrucciones"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="steps">
        <div>
          <span>01</span>
          <p>
            Abre Instagram y entra en <b>Centro de cuentas</b>.
          </p>
        </div>
      
        <div>
          <span>02</span>
          <p>
            Ve a <b>Tu información y permisos</b> y solicita una descarga de tu
            información.
          </p>
        </div>
      
        <div>
          <span>03</span>
          <p>
            Elige la información de seguidores y seguidos, formato JSON y
            descarga el ZIP.
          </p>
        </div>
      </div>
      
      <p className="how-note">
        Los nombres de los menús pueden variar según la versión de Instagram.
      </p>
    </section>
  );
};
