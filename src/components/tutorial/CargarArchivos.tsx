import { X } from "lucide-react";
import type { ShowHowType } from "../../types/ShowHow.type";
import { HowSteps } from "./HowSteps";

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

      <HowSteps />
    </section>
  );
};
