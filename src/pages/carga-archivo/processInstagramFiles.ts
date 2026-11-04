import type { SocialResults } from "../detalle-archivo/DetalleArchivo";
import { cleanUsername, looksLikeUsername, usernameFromUrl } from "../../utils/username";

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
    if (readUint32(view, cursor) !== 0x02014b50) 
      throw new Error("El ZIP tiene una estructura que no podemos leer.");
    
    const flags = readUint16(view, cursor + 8);
    if (flags & 1) 
      throw new Error("El ZIP está protegido con contraseña. Descarga una copia sin contraseña desde Instagram.");
    
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

async function readZipEntryBytes(bytes: Uint8Array, entry: ArchiveEntry): Promise<Uint8Array> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const offset = entry.localOffset;
  
  if (readUint32(view, offset) !== 0x04034b50) 
    throw new Error("No pudimos abrir un archivo dentro del ZIP.");
  
  const nameLength = readUint16(view, offset + 26);
  const extraLength = readUint16(view, offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const compressed = bytes.slice(start, start + entry.compressedSize);
  
  let output: Uint8Array;
  if (entry.method === 0) 
    output = compressed;
  
  else if (entry.method === 8) {
    try {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      output = new Uint8Array(await new Response(stream).arrayBuffer());
    } catch { throw new Error("Tu navegador no pudo descomprimir este ZIP. Prueba con los JSON directamente."); }
  } 
  else 
    throw new Error("El ZIP usa un método de compresión no compatible.");
  
  if (output.byteLength !== entry.uncompressedSize) 
    throw new Error("Un archivo dentro del ZIP parece estar incompleto.");
  
  return output;
}

async function readZipEntry(bytes: Uint8Array, entry: ArchiveEntry): Promise<string> {
  return decoder.decode(await readZipEntryBytes(bytes, entry));
}

function collectNames(value: unknown): string[] {
  if (Array.isArray(value)) 
    return value.flatMap(collectNames);
  
  if (!value || typeof value !== "object") return [];
  
  const obj = value as Record<string, unknown>;
  const relationships = obj.string_list_data;
  
  if (Array.isArray(relationships)) {
    const names = relationships.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      if (typeof record.value === "string" && record.value.trim()) return [record.value];
      if (typeof record.href === "string") {
        const username = usernameFromUrl(record.href);
        return username ? [username] : [];
      }
  
      return [];
    });
  
    if (names.length) return names;
  }
  
  if (typeof obj.title === "string" && looksLikeUsername(obj.title)) return [obj.title.trim()];
  
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

const IMAGE_EXTENSION = /\.(?:jpe?g|png|webp)$/i;
const IMAGE_MIME: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

type Avatar = { bytes: Uint8Array; mime: string };

function imageMime(name: string): string {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_MIME[extension] ?? "image/jpeg";
}

function pathKey(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();
}

function profilePhotoUri(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = profilePhotoUri(item);
      if (found) return found;
    }
    return undefined;
  }

  if (!value || typeof value !== "object") return undefined;

  const mediaMap = (value as Record<string, unknown>).media_map_data;
  if (mediaMap && typeof mediaMap === "object") {
    for (const item of Object.values(mediaMap as Record<string, unknown>)) {
      if (!item || typeof item !== "object") continue;
      const uri = (item as Record<string, unknown>).uri;
      if (typeof uri === "string" && IMAGE_EXTENSION.test(uri)) return uri;
    }
  }

  for (const item of Object.values(value as Record<string, unknown>)) {
    const found = profilePhotoUri(item);
    if (found) return found;
  }

  return undefined;
}

function personalFileOf(files: { name: string; text: string }[]) {
  return files.find(({ name }) => /^personal[_-]?information\.json$/i.test(fileName(name)));
}

async function avatarFromZip(bytes: Uint8Array, entries: ArchiveEntry[], files: { name: string; text: string }[]): Promise<Avatar | undefined> {
  const personal = personalFileOf(files);
  if (!personal) return undefined;

  const uri = profilePhotoUri(parseJson(personal.name, personal.text));
  if (!uri) return undefined;

  const target = entries.find(({ name }) => !name.endsWith("/") && pathKey(name).endsWith(pathKey(uri)));
  if (!target || target.uncompressedSize > 8 * 1024 * 1024) return undefined;

  return { bytes: await readZipEntryBytes(bytes, target), mime: imageMime(target.name) };
}

async function avatarFromFiles(images: File[], files: { name: string; text: string }[]): Promise<Avatar | undefined> {
  if (!images.length) return undefined;

  const personal = personalFileOf(files);
  const uri = personal ? profilePhotoUri(parseJson(personal.name, personal.text)) : undefined;
  const basename = uri ? pathKey(uri).split("/").pop() : undefined;
  const target = (basename ? images.find((file) => pathKey(file.name).endsWith(basename)) : undefined) ?? images[0];

  return { bytes: new Uint8Array(await target.arrayBuffer()), mime: imageMime(target.name) };
}

function withAvatar(results: SocialResults, avatar: Avatar | undefined): SocialResults {
  if (!avatar || !results.account) return results;
  const avatarUrl = URL.createObjectURL(new Blob([avatar.bytes], { type: avatar.mime }));
  return { ...results, account: { ...results.account, avatarUrl } };
}

function uniqueAccounts(values: string[]): string[] {
  const accounts = new Map<string, string>();
  for (const raw of values) {
    const username = cleanUsername(raw);
    if (!username) continue;
    const key = username.toLowerCase();
    if (!accounts.has(key)) accounts.set(key, username);
  }
  return [...accounts.values()];
}

function hasRelationshipEntries(value: unknown): boolean {
  return Array.isArray(value) && value.some((item) => {
    if (!item || typeof item !== "object") return false;
    return Array.isArray((item as Record<string, unknown>).string_list_data);
  });
}

function followingRelationships(value: unknown): string[] | undefined {
  if (!value || typeof value !== "object") return undefined;
  const relationships = (value as Record<string, unknown>).relationships_following;
  return Array.isArray(relationships) ? collectNames(relationships) : undefined;
}

function buildResults(files: { name: string; value: unknown }[]): SocialResults {
  const followersFiles = files.filter(({ name }) => /^followers(?:_\d+)?\.json$/i.test(fileName(name)));
  const followingFiles = files.filter(({ name }) => /^following(?:_\d+)?\.json$/i.test(fileName(name)));
  const personalFile = files.find(({ name }) => /^personal[_-]?information\.json$/i.test(fileName(name)));
  let followers = followersFiles.flatMap(({ value }) => collectNames(value));
  let following = followingFiles.flatMap(({ value }) => collectNames(value));
  let foundFollowers = followersFiles.length > 0;
  let foundFollowing = followingFiles.length > 0;

  // Fall back to the JSON's relationship structure when filenames differ.
  if (!foundFollowers || !foundFollowing) {
    for (const file of files) {
      if (file === personalFile || /^(?:followers|following)(?:_\d+)?\.json$/i.test(fileName(file.name))) continue;

      if (!foundFollowers && hasRelationshipEntries(file.value)) {
        followers = collectNames(file.value);
        foundFollowers = true;
      }

      if (!foundFollowing) {
        const relationships = followingRelationships(file.value);
        if (relationships !== undefined) {
          following = relationships;
          foundFollowing = true;
        }
      }
    }
  }

  followers = uniqueAccounts(followers);
  following = uniqueAccounts(following);
  if (!foundFollowers || !foundFollowing) throw new Error("No encontramos las listas de seguidores y seguidos. Selecciona la exportación JSON de Instagram, incluyendo followers y following.");

  const username = personalFile ? cleanUsername(profileUsername(personalFile.value) ?? "") : undefined;
  return {
    followers,
    following,
    account: username ? { username, profileUrl: `https://www.instagram.com/${username}` } : undefined,
  };
}

export async function processInstagramFiles(selectedFiles: File[]): Promise<SocialResults> {
  if (!selectedFiles.length) throw new Error("Selecciona el ZIP o los archivos JSON de Instagram.");
  let jsonFiles: { name: string; text: string }[] = [];
  let avatar: Avatar | undefined;

  if (selectedFiles.length === 1 && selectedFiles[0].name.toLowerCase().endsWith(".zip")) {
    const bytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
    const archiveEntries = listZipEntries(bytes);
    const entries = archiveEntries.filter(({ name }) => /\.json$/i.test(name) && !name.endsWith("/"));
    const candidates = entries.filter(({ name }) => {
      const base = fileName(name);
      return /^followers(?:_\d+)?\.json$/i.test(base) || /^following(?:_\d+)?\.json$/i.test(base) || /^personal[_-]?information\.json$/i.test(base);
    });
    if (!candidates.length) throw new Error("No encontramos los JSON de seguidores dentro del ZIP.");
    const total = candidates.reduce((sum, entry) => sum + entry.uncompressedSize, 0);
    if (total > 100 * 1024 * 1024) throw new Error("Los archivos de relaciones superan 100 MB descomprimidos y no podemos procesarlos con seguridad en el navegador.");
    jsonFiles = await Promise.all(candidates.map(async (entry) => ({ name: entry.name, text: await readZipEntry(bytes, entry) })));
    avatar = await avatarFromZip(bytes, archiveEntries, jsonFiles);
  } else {
    const json = selectedFiles.filter((file) => file.name.toLowerCase().endsWith(".json"));
    const images = selectedFiles.filter((file) => IMAGE_EXTENSION.test(file.name));
    if (json.length !== selectedFiles.length && json.length + images.length !== selectedFiles.length)
      throw new Error("Selecciona un único ZIP, o los JSON de la exportación junto con la foto de perfil (opcional).");
    if (!json.length) throw new Error("Selecciona un único ZIP o los archivos JSON de la exportación de Instagram.");
    jsonFiles = await Promise.all(json.map(async (file) => ({ name: file.name, text: await file.text() })));
    avatar = await avatarFromFiles(images, jsonFiles);
  }

  const parsed = jsonFiles.map(({ name, text }) => ({ name, value: parseJson(name, text) }));
  return withAvatar(buildResults(parsed), avatar);
}
