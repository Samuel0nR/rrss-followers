import { useEffect, useState } from "react";

import { Navbar } from "./components/navbar/Navbar";
import { Footer } from "./components/footer/Footer";
import { BannerConfidential } from "./components/banner/BannerConfident";
import { ComoCargarArchivos } from "./components/tutorial/CargarArchivos";

import { CargaArchivosPage } from "./pages/carga-archivo/CargaArchivos";
import { MainApp } from "./pages/main/MainApp";
import { DetalleArchivo, type SocialResults } from "./pages/detalle-archivo/DetalleArchivo";

const emptyResults: SocialResults = { followers: [], following: [] };

export default function App() {
  const [showHow, setShowHow] = useState(false);
  const [isDetail, setIsDetail] = useState(() => window.location.pathname.replace(/\/$/, "").endsWith("/detalle-archivo"));
  const [results, setResults] = useState<SocialResults>(emptyResults);

  useEffect(() => {
    const syncRoute = () => setIsDetail(window.location.pathname.replace(/\/$/, "").endsWith("/detalle-archivo"));
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const goHome = () => {
    window.history.pushState({}, "", "/");
    setIsDetail(false);
  };

  const showResults = (nextResults: SocialResults) => {
    setResults(nextResults);
    window.history.pushState({}, "", "/detalle-archivo");
    setIsDetail(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="site-shell">
      <Navbar ShowHow={showHow} setShowHow={setShowHow} />

      {isDetail ? (
        <DetalleArchivo results={results} onBack={goHome} />
      ) : (
        <>
          <MainApp />
          <CargaArchivosPage ShowHow={showHow} setShowHow={setShowHow} onProcessed={showResults} />
          {showHow && <ComoCargarArchivos ShowHow={showHow} setShowHow={setShowHow} />}
          <BannerConfidential />
        </>
      )}

      {/* Footer */}
      <Footer />
    </main>
  );
}
