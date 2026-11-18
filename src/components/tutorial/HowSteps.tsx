export const HowSteps = () => {
  return (
    <>
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
    </>
  );
};
