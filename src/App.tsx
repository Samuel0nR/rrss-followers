import { useEffect, useState } from "react";

import { Navbar } from "./components/navbar/Navbar";
import { Footer } from "./components/footer/Footer";
import { BannerConfidential } from "./components/banner/BannerConfident";
import { ComoCargarArchivos } from "./components/tutorial/CargarArchivos";
import { HowModal } from "./components/tutorial/HowModal";

import { CargaArchivosPage } from "./pages/carga-archivo/CargaArchivos";
import { MainApp } from "./pages/main/MainApp";
import { DetalleArchivo, type SocialResults } from "./pages/detalle-archivo/DetalleArchivo";
import { PrivacyPolicyPage } from "./pages/privacidad/PrivacyPolicy";

const emptyResults: SocialResults = { followers: [], following: [] };

export default function App() {
  const [showHow, setShowHow] = useState(false);
  const [howModalOpen, setHowModalOpen] = useState(false);
  const [isDetail, setIsDetail] = useState(() => window.location.pathname.replace(/\/$/, "").endsWith("/detalle-archivo"));
  const [isPrivacy, setIsPrivacy] = useState(() => window.location.pathname.replace(/\/$/, "") === "/privacidad");
  const [results, setResults] = useState<SocialResults>(emptyResults);

  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname.replace(/\/$/, "") || "/";
      setIsDetail(path.endsWith("/detalle-archivo"));
      setIsPrivacy(path === "/privacidad");
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    const avatarUrl = results.account?.avatarUrl;
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [results]);

  useEffect(() => {
    document.title = isPrivacy ? "Privacidad — Sin filtros" : isDetail ? "Tu resumen social — Sin filtros" : "Sin filtros — Instagram follower check";
  }, [isDetail, isPrivacy]);

  const goHome = () => {
    window.history.pushState({}, "", "/");
    setIsDetail(false);
    setIsPrivacy(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrivacy = () => {
    window.history.pushState({}, "", "/privacidad");
    setIsDetail(false);
    setIsPrivacy(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showResults = (nextResults: SocialResults) => {
    setResults(nextResults);
    window.history.pushState({}, "", "/detalle-archivo");
    setIsDetail(true);
    setIsPrivacy(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="site-shell">
      <Navbar onOpenHow={() => setHowModalOpen(true)} />

      {isPrivacy ? (
        <PrivacyPolicyPage onBack={goHome} />
      ) : isDetail ? (
        <DetalleArchivo results={results} onBack={goHome} />
      ) : (
        <>
          <MainApp />
          <CargaArchivosPage ShowHow={showHow} setShowHow={setShowHow} onProcessed={showResults} />
          {showHow && <ComoCargarArchivos ShowHow={showHow} setShowHow={setShowHow} />}
          <BannerConfidential />
        </>
      )}

      <HowModal open={howModalOpen} onClose={() => setHowModalOpen(false)} />

      {/* Footer */}
      <Footer onPrivacyClick={goPrivacy} />
    </main>
  );
}
