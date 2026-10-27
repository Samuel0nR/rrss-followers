import { FileArchive, Check, X, Upload, ArrowRight, FileJson, LoaderCircle } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { processInstagramFiles } from "../../pages/carga-archivo/processInstagramFiles";
import type { SocialResults } from "../../pages/detalle-archivo/DetalleArchivo";

type Props = { onProcessed: (results: SocialResults) => void };

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FileUploadComponent = ({ onProcessed }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const chooseFiles = (files: File[]) => {
    if (!files.length) return;
    const isOneZip = files.length === 1 && files[0].name.toLowerCase().endsWith(".zip");
    const areJson = files.every((file) => file.name.toLowerCase().endsWith(".json"));
    if (!isOneZip && !areJson) {
      setError("Selecciona un ZIP de Instagram o varios JSON de la exportación.");
      return;
    }
    if (files.some((file) => file.size > 500 * 1024 * 1024)) {
      setError("Un archivo supera los 500 MB. Prueba con una exportación más pequeña.");
      return;
    }
    setError("");
    setSelected(files);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) =>
    chooseFiles(Array.from(event.target.files ?? []));

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    chooseFiles(Array.from(event.dataTransfer.files));
  };

  const processFiles = async () => {
    setProcessing(true);
    setError("");
    try { onProcessed(await processInstagramFiles(selected)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos procesar estos archivos."); }
    finally { setProcessing(false); }
  };

  return (
    <div
      className={`dropzone ${dragging ? "dropzone--active" : ""} ${selected.length ? "file-selected" : ""}`}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setDragging(false);
      }}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip,.json,application/zip,application/json,application/x-zip-compressed"
        multiple
        onChange={onInputChange}
        hidden
      />
      {selected.length ? (
        <div className="file-ready">
          <div className="upload-icon upload-icon--ready">
            {selected.length === 1 && selected[0].name.toLowerCase().endsWith(".zip") ? <FileArchive size={23} /> : <FileJson size={23} />}
          </div>
          <div className="file-info">
            <span className="file-status">
              <Check size={12} /> {selected.length === 1 && selected[0].name.toLowerCase().endsWith(".zip") ? "ZIP SELECCIONADO" : `${selected.length} JSON SELECCIONADOS`}
            </span>
            <strong>{selected.length === 1 ? selected[0].name : selected.map((file) => file.name).join(", ")}</strong>
            <small>
              {formatBytes(selected.reduce((size, file) => size + file.size, 0))} · Se procesa solo en este dispositivo
            </small>
            <button className="choose-button process-button" onClick={processFiles} disabled={processing}>
              {processing ? <><LoaderCircle className="loader-icon" size={15} /> Procesando…</> : <>Analizar archivo <ArrowRight size={16} /></>}
            </button>
          </div>
          <button
            className="remove-file"
            aria-label="Quitar archivo"
            disabled={processing}
            onClick={() => {
              setSelected([]);
              setError("");
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X size={17} />
          </button>
        </div>
      ) : (
        <>
          <div className="upload-icon">
            <Upload size={23} />
          </div>
          <div className="drop-copy">
            <strong>
              {dragging ? "Suéltalo aquí" : "Suelta tu archivo aquí"}
            </strong>
            <span>o selecciónalo desde tu dispositivo</span>
          </div>
          <button
            className="choose-button"
            onClick={() => inputRef.current?.click()}
          >
            Elegir archivo <ArrowRight size={16} />
          </button>
          <div className="file-hint">
            <FileArchive size={13} /> ZIP completo <span>o</span> <FileJson size={13} /> JSON sueltos <span>·</span> Máx. 500 MB por archivo
          </div>
        </>
      )}
      {error && (
        <div className="file-error" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Cerrar error">
            <X size={14} />
          </button>
        </div>
      )}
      <div className="drop-corner drop-corner--tl" />
      <div className="drop-corner drop-corner--br" />
    </div>
  );
};
