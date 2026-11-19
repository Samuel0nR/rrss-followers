type Props = { onPrivacyClick: () => void };

export const Footer = ({ onPrivacyClick }: Props) => {
  return (
    <footer className="footer">
      <span>HERRAMIENTA INDEPENDIENTE · NO AFILIADA CON INSTAGRAM/META</span>
      <div className="footer-right">
        <a href="/privacidad" onClick={(event) => { event.preventDefault(); onPrivacyClick(); }}>Privacidad</a>        
      </div>
    </footer>
  );
};
