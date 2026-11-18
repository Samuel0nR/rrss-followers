import { Orbit, ArrowDownRight } from "lucide-react";

type Props = {
  onOpenHow: () => void;
};

export const Navbar = ({ onOpenHow }: Props) => {
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
        <button
          className="nav-link"
          type="button"
          aria-haspopup="dialog"
          onClick={onOpenHow}
        >
          Cómo funciona <ArrowDownRight size={15} />
        </button>
      </div>
    </nav>
  );
};
