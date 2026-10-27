import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Search, Users } from "lucide-react";

export type SocialAccount = {
  username: string;
  profileUrl?: string;
};

export type SocialResults = {
  account?: SocialAccount;
  followers: string[];
  following: string[];
};

type Category = "followers" | "notFollowingBack" | "notFollowedBack";

type Props = {
  results: SocialResults;
  onBack?: () => void;
};

const categories: { id: Category; label: string; description: string }[] = [
  { id: "followers", label: "Te siguen", description: "Cuentas que te siguen." },
  { id: "notFollowingBack", label: "No te siguen", description: "Cuentas que sigues y no te siguen de vuelta." },
  { id: "notFollowedBack", label: "No sigues", description: "Cuentas que te siguen y tú no sigues." },
];

export function DetalleArchivo({ results, onBack }: Props) {
  const [active, setActive] = useState<Category>("notFollowingBack");
  const [query, setQuery] = useState("");

  const lists = useMemo(() => {
    const followers = new Set(results.followers.map((name) => name.toLowerCase()));
    const following = new Set(results.following.map((name) => name.toLowerCase()));
    return {
      followers: results.followers,
      notFollowingBack: results.following.filter((name) => !followers.has(name.toLowerCase())),
      notFollowedBack: results.followers.filter((name) => !following.has(name.toLowerCase())),
    };
  }, [results]);

  const currentList = lists[active];
  const visibleUsers = currentList.filter((username) => username.toLowerCase().includes(query.trim().toLowerCase()));
  const currentCategory = categories.find((category) => category.id === active)!;
  const mutualCount = results.following.length - lists.notFollowingBack.length;

  return (
    <section className="results-page" aria-labelledby="results-title">
      <button className="results-back" onClick={onBack ?? (() => window.history.back())}>
        <ArrowLeft size={16} /> Volver
      </button>

      <header className="results-heading">
        <div>
          <div className="section-kicker"><span>02</span> TU CÍRCULO, EN CLARO</div>
          <h1 id="results-title">Tu resumen <span>social.</span></h1>
          <p>Resultados calculados a partir de tu exportación de Instagram.</p>
          <div className="result-totals" aria-label="Totales de la exportación">
            <span><b>{results.following.length}</b> siguiendo</span>
            <span><b>{results.followers.length}</b> seguidores</span>
            <span><b>{mutualCount}</b> mutuos</span>
          </div>
        </div>
        {results.account && (
          <div className="account-card">
            <span className="account-avatar"><Users size={20} /></span>
            <span><small>DATOS DE LA CUENTA</small><strong>@{results.account.username}</strong></span>
            {results.account.profileUrl && <a href={results.account.profileUrl} target="_blank" rel="noreferrer" aria-label="Abrir perfil"><ExternalLink size={15} /></a>}
          </div>
        )}
      </header>

      <div className="result-tabs" role="tablist" aria-label="Categorías de resultados">
        {categories.map((category) => (
          <button
            key={category.id}
            id={`tab-${category.id}`}
            className={`result-tab ${active === category.id ? "result-tab--active" : ""}`}
            role="tab"
            aria-selected={active === category.id}
            aria-controls="result-list-panel"
            onClick={() => { setActive(category.id); setQuery(""); }}
          >
            <span>{category.label}</span><b>{lists[category.id].length}</b>
          </button>
        ))}
      </div>

      <div className="result-list-panel" id="result-list-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
        <div className="result-list-heading">
          <div><h2>{currentCategory.label}</h2><p>{currentCategory.description}</p></div>
          <label className="result-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar usuario" aria-label="Buscar usuario" /></label>
        </div>
        {visibleUsers.length ? (
          <ul className="user-list">{visibleUsers.map((username) => <li key={username}><span className="user-avatar">{username.slice(0, 1).toUpperCase()}</span><span>@{username}</span></li>)}</ul>
        ) : (
          <div className="results-empty"><span className="empty-icon"><Users size={22} /></span><strong>{query ? "No encontramos coincidencias" : "No hay cuentas en esta categoría"}</strong><p>{query ? "Prueba con otro nombre de usuario." : "Cuando el archivo tenga resultados para esta categoría, aparecerán aquí."}</p></div>
        )}
        <div className="results-privacy">Tus datos se procesan en este dispositivo y no se guardan en un servidor.</div>
      </div>
    </section>
  );
}
