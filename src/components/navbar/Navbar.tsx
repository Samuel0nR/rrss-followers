import { Orbit, ArrowDownRight } from "lucide-react";
import type { ShowHowType } from "../../types/ShowHow.type";

export const Navbar = (props: ShowHowType) => {
  return (
    <nav className="topbar" aria-label="Navegación principal">
      <a className="mark" href="#top" aria-label="Inicio">
        <span className="mark-symbol">
          <Orbit size={19} strokeWidth={2.2} />
        </span>
        <span className="mark-word">
          SOCIAL<span>/</span>CHECK
        </span>
      </a>
      <div className="topbar-right">
        <span className="beta-tag">
          <i /> WEB BETA
        </span>
        <a
          className="nav-link"
          href="#how"
          onClick={(e) => {
            e.preventDefault();
            props.setShowHow((v) => !v);
          }}
        >
          Cómo funciona <ArrowDownRight size={15} />
        </a>
      </div>
    </nav>
  );
};
