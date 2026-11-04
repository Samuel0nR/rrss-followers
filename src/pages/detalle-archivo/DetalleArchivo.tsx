import { useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, ExternalLink, Search, Users } from "lucide-react";
import { usernameKey } from "../../utils/username";

export type SocialAccount = {
  username: string;
  profileUrl?: string;
  avatarUrl?: string;
};

export type SocialResults = {
  account?: SocialAccount;
  followers: string[];
  following: string[];
};

type Category = "mutual" | "followersOnly" | "followingOnly";

type Props = {
  results: SocialResults;
  onBack?: () => void;
};

const categories: { id: Category; label: string; description: string }[] = [
  { id: "mutual", label: "Seguidos mutuamente", description: "Cuentas que se siguen mutuamente." },
  { id: "followersOnly", label: "Me siguen", description: "Cuentas que te siguen y tú no sigues de vuelta." },
  { id: "followingOnly", label: "No me siguen", description: "Cuentas que sigues y no te siguen de vuelta." },
];

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back to the legacy path when the clipboard API is blocked.
    }
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

export function DetalleArchivo({ results, onBack }: Props) {
  const [active, setActive] = useState<Category>("followingOnly");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const copyUsername = async (username: string) => {
    await copyToClipboard(username);
    setCopied(username);
    window.setTimeout(() => setCopied((current) => (current === username ? null : current)), 1600);
  };

  const lists = useMemo(() => {
    const followers = new Map<string, string>();
    const following = new Map<string, string>();

    for (const username of results.followers) {
      const key = usernameKey(username) ?? username.toLowerCase();
      if (!followers.has(key)) followers.set(key, username);
    }

    for (const username of results.following) {
      const key = usernameKey(username) ?? username.toLowerCase();
      if (!following.has(key)) following.set(key, username);
    }

    const mutual: string[] = [];
    const followersOnly: string[] = [];
    const followingOnly: string[] = [];

    for (const [key, username] of followers) {
      if (following.has(key)) mutual.push(username);
      else followersOnly.push(username);
    }

    for (const [key, username] of following) {
      if (!followers.has(key)) followingOnly.push(username);
    }

    return { mutual, followersOnly, followingOnly };
  }, [results]);

  const currentList = lists[active];
  const normalizedQuery = usernameKey(query) ?? query.trim().toLowerCase();
  const visibleUsers = currentList.filter((username) => (usernameKey(username) ?? username.toLowerCase()).includes(normalizedQuery));
  const currentCategory = categories.find((category) => category.id === active)!;
  const mutualCount = lists.mutual.length;

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
            <span className="account-avatar">
              {results.account.avatarUrl
                ? <img className="account-avatar-img" src={results.account.avatarUrl} alt="" />
                : <Users size={20} />}
            </span>
            <span><small>DATOS DE LA CUENTA</small><strong>@{results.account.username}</strong></span>
            {results.account.profileUrl && <a href={results.account.profileUrl} target="_blank" rel="noreferrer" aria-label="Abrir perfil en Instagram"><ExternalLink size={15} /></a>}
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
          <ul className="user-list">
            {visibleUsers.map((username) => (
              <li key={username}>
                <span className="user-avatar">{username.slice(0, 1).toUpperCase()}</span>
                <span className="user-name">@{username}</span>
                <span className="user-actions">
                  <a
                    className="user-action"
                    href={`https://www.instagram.com/${encodeURIComponent(username)}/`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Abrir el perfil de @${username} en Instagram`}
                    title="Abrir en Instagram"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    className={`user-action ${copied === username ? "user-action--done" : ""}`}
                    onClick={() => copyUsername(username)}
                    aria-label={`Copiar el usuario @${username}`}
                    title={copied === username ? "Copiado" : "Copiar usuario"}
                  >
                    {copied === username ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="results-empty"><span className="empty-icon"><Users size={22} /></span><strong>{query ? "No encontramos coincidencias" : "No hay cuentas en esta categoría"}</strong><p>{query ? "Prueba con otro nombre de usuario." : "Cuando el archivo tenga resultados para esta categoría, aparecerán aquí."}</p></div>
        )}
        <div className="results-privacy">Tus datos se procesan en este dispositivo y no se guardan en un servidor.</div>
      </div>
    </section>
  );
}
