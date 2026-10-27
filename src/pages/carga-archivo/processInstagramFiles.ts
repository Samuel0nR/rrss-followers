import type { SocialResults } from "../detalle-archivo/DetalleArchivo";

type ArchiveEntry = { name: string; method: number; compressedSize: number; uncompressedSize: number; localOffset: number };
const decoder = new TextDecoder();

function readUint16(view: DataView, offset: number) { return view.getUint16(offset, true); }
function readUint32(view: DataView, offset: number) { return view.getUint32(offset, true); }

function listZipEntries(bytes: Uint8Array): ArchiveEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const min = Math.max(0, bytes.length - 65_557);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= min; i--) {
    if (readUint32(view, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("No pudimos leer el ZIP. Verifica que la exportación esté completa.");
  const count = readUint16(view, eocd + 10);
  let cursor = readUint32(view, eocd + 16);
  const entries: ArchiveEntry[] = [];
  for (let i = 0; i < count; i++) {
    if (readUint32(view, cursor) !== 0x02014b50) throw new Error("El ZIP tiene una estructura que no podemos leer.");
    const flags = readUint16(view, cursor + 8);
    if (flags & 1) throw new Error("El ZIP está protegido con contraseña. Descarga una copia sin contraseña desde Instagram.");
    const nameLength = readUint16(view, cursor + 28);
    const extraLength = readUint16(view, cursor + 30);
    const commentLength = readUint16(view, cursor + 32);
    const nameBytes = bytes.subarray(cursor + 46, cursor + 46 + nameLength);
    const name = new TextDecoder(flags & 0x800 ? "utf-8" : "utf-8").decode(nameBytes);
    entries.push({ name, method: readUint16(view, cursor + 10), compressedSize: readUint32(view, cursor + 20), uncompressedSize: readUint32(view, cursor + 24), localOffset: readUint32(view, cursor + 42) });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function readZipEntry(bytes: Uint8Array, entry: ArchiveEntry): Promise<string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const offset = entry.localOffset;
  if (readUint32(view, offset) !== 0x04034b50) throw new Error("No pudimos abrir un archivo dentro del ZIP.");
  const nameLength = readUint16(view, offset + 26);
  const extraLength = readUint16(view, offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const compressed = bytes.slice(start, start + entry.compressedSize);
  let output: Uint8Array;
  if (entry.method === 0) output = compressed;
  else if (entry.method === 8) {
    try {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      output = new Uint8Array(await new Response(stream).arrayBuffer());
    } catch { throw new Error("Tu navegador no pudo descomprimir este ZIP. Prueba con los JSON directamente."); }
  } else throw new Error("El ZIP usa un método de compresión no compatible.");
  if (output.byteLength !== entry.uncompressedSize) throw new Error("Un archivo dentro del ZIP parece estar incompleto.");
  return decoder.decode(output);
}

function collectNames(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectNames);
  if (!value || typeof value !== "object") return [];
  const obj = value as Record<string, unknown>;
  const rel = obj.string_list_data;
  if (Array.isArray(rel)) {
    const names = rel.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      if (typeof record.value === "string" && record.value.trim()) return [record.value];
      if (typeof record.href === "string") {
        try { return [new URL(record.href).pathname.split("/").filter(Boolean).pop() ?? ""]; } catch { return []; }
      }
      return [];
    });
    if (names.length) return names;
  }
  if (typeof obj.title === "string" && obj.title.trim()) return [obj.title.trim()];
  return Object.values(obj).flatMap(collectNames);
}

function profileUsername(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) return value.map(profileUsername).find(Boolean);
  const obj = value as Record<string, unknown>;
  for (const [key, item] of Object.entries(obj)) {
    if (key.toLowerCase() === "username") {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const nested = item as Record<string, unknown>;
        if (typeof nested.value === "string") return nested.value;
      }
    }
  }
  for (const item of Object.values(obj)) {
    const found = profileUsername(item);
    if (found) return found;
  }
  return undefined;
}

function parseJson(name: string, text: string): unknown {
  try { return JSON.parse(text); }
  catch { throw new Error(`No pudimos leer ${name}. Comprueba que sea un JSON válido.`); }
}

function fileName(path: string) { return path.split(/[\\/]/).pop()?.toLowerCase() ?? path.toLowerCase(); }

function normalizeUsername(raw: string): string {
  let username = raw.trim();
  if (/^https?:\/\//i.test(username)) {
    try {
      const url = new URL(username);
      if (/instagram\.com$/i.test(url.hostname)) username = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } catch { /* Keep the original value and normalize it below. */ }
  }
  return username.replace(/^@+/, "").replace(/\/$/, "").trim();
}

function uniqueAccounts(values: string[]): string[] {
  const accounts = new Map<string, string>();
  for (const raw of values) {
    const username = normalizeUsername(raw);
    if (username && !accounts.has(username.toLocaleLowerCase())) accounts.set(username.toLocaleLowerCase(), username);
  }
  return [...accounts.values()];
}

function buildResults(files: { name: string; value: unknown }[]): SocialResults {
  const followersFiles = files.filter(({ name }) => /^followers(?:_\d+)?\.json$/i.test(fileName(name)));
  const followingFile = files.find(({ name }) => /^following\.json$/i.test(fileName(name)));
  const personalFile = files.find(({ name }) => /^personal[_-]?information\.json$/i.test(fileName(name)));
  let followers = followersFiles.flatMap(({ value }) => collectNames(value));
  let following = followingFile ? collectNames(followingFile.value) : [];

  // Fall back to the JSON's relationship structure when filenames differ.
  if (!followers.length || !following.length) {
    for (const file of files) {
      if (file.name === followingFile?.name || followersFiles.some((item) => item.name === file.name)) continue;
      const serialized = JSON.stringify(file.value);
      if (!followers.length && /"string_list_data"/.test(serialized) && Array.isArray(file.value)) followers = collectNames(file.value);
      if (!following.length && file.value && typeof file.value === "object" && "relationships_following" in file.value) following = collectNames((file.value as Record<string, unknown>).relationships_following);
    }
  }
  followers = uniqueAccounts(followers);
  following = uniqueAccounts(following);
  if (!followers.length || !following.length) throw new Error("No encontramos las listas de seguidores y seguidos. Selecciona la exportación JSON de Instagram, incluyendo followers y following.");
  const username = personalFile ? profileUsername(personalFile.value) : undefined;
  return { followers, following, account: username ? { username: username.replace(/^@/, "") } : undefined };
}

export async function processInstagramFiles(selectedFiles: File[]): Promise<SocialResults> {
  if (!selectedFiles.length) throw new Error("Selecciona el ZIP o los archivos JSON de Instagram.");
  let jsonFiles: { name: string; text: string }[] = [];
  if (selectedFiles.length === 1 && selectedFiles[0].name.toLowerCase().endsWith(".zip")) {
    const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
    const entries = listZipEntries(bytes).filter(({ name }) => /\.json$/i.test(name) && !name.endsWith("/"));
    const candidates = entries.filter(({ name }) => {
      const base = fileName(name);
      return /^followers(?:_\d+)?\.json$/i.test(base) || /^following\.json$/i.test(base) || /^personal[_-]?information\.json$/i.test(base);
    });
    if (!candidates.length) throw new Error("No encontramos los JSON de seguidores dentro del ZIP.");
    const total = candidates.reduce((sum, entry) => sum + entry.uncompressedSize, 0);
    if (total > 100 * 1024 * 1024) throw new Error("Los archivos de relaciones superan 100 MB descomprimidos y no podemos procesarlos con seguridad en el navegador.");
    jsonFiles = await Promise.all(candidates.map(async (entry) => ({ name: entry.name, text: await readZipEntry(bytes, entry) })));
  } else {
    if (selectedFiles.some((file) => !file.name.toLowerCase().endsWith(".json"))) throw new Error("Selecciona un único ZIP o solo archivos JSON.");
    jsonFiles = await Promise.all(selectedFiles.map(async (file) => ({ name: file.name, text: await file.text() })));
  }
  const parsed = jsonFiles.map(({ name, text }) => ({ name, value: parseJson(name, text) }));
  return buildResults(parsed);
}
