"use client";

import { useState, useCallback, useRef } from "react";

interface CompressionResult {
  name: string;
  originalSize: number;
  compressedSize: number;
  format: string | null;
  width: number;
  height: number;
  data: string | null;
  error: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSavingsPercent(original: number, compressed: number): string {
  if (original === 0) return "0%";
  const pct = ((original - compressed) / original) * 100;
  return `${pct.toFixed(1)}%`;
}

function getOutputName(originalName: string, format: string): string {
  const base = originalName.replace(/\.png$/i, "");
  return `${base}-compressed.${format}`;
}

export default function CompressPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const pngFiles = Array.from(newFiles).filter(
      (f) => f.type === "image/png" || f.name.toLowerCase().endsWith(".png")
    );
    if (pngFiles.length === 0) return;
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const unique = pngFiles.filter((f) => !names.has(f.name));
      return [...prev, ...unique];
    });
    setResults([]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
    },
    [addFiles]
  );

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setResults((prev) => prev.filter((r) => r.name !== name));
  };

  const compress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/compress-png", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResults(json.results);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setProcessing(false);
    }
  };

  const downloadFile = (result: CompressionResult) => {
    if (!result.data || !result.format) return;
    const mimeType = result.format === "webp" ? "image/webp" : "image/png";
    const byteChars = atob(result.data);
    const byteNums = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNums[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteNums], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getOutputName(result.name, result.format);
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    results.filter((r) => !r.error && r.data).forEach(downloadFile);
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const successResults = results.filter((r) => !r.error);
  const errorResults = results.filter((r) => r.error);
  const totalOriginal = successResults.reduce((s, r) => s + r.originalSize, 0);
  const totalCompressed = successResults.reduce((s, r) => s + r.compressedSize, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">PNG Compressor</h1>
          <p className="text-gray-500 text-sm">
            Compress PNGs to ~300 KB for web use — all files processed simultaneously.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,image/png"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="space-y-2">
            <div className="text-4xl select-none">🖼️</div>
            <p className="text-gray-700 font-medium">
              Drop PNG files here or <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-xs text-gray-400">Multiple files supported · PNG only</p>
          </div>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">
                {files.length} file{files.length !== 1 ? "s" : ""} queued
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            </div>
            {files.map((file) => {
              const result = results.find((r) => r.name === file.name);
              return (
                <div key={file.name} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                  </div>

                  {result && !result.error && (
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-green-600">
                        {formatBytes(result.compressedSize)}
                        {result.format === "webp" && (
                          <span className="ml-1 text-gray-400">(WebP)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        saved {getSavingsPercent(result.originalSize, result.compressedSize)}
                      </p>
                    </div>
                  )}

                  {result?.error && (
                    <span className="text-xs text-red-500 shrink-0">{result.error}</span>
                  )}

                  {!result && !processing && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                      className="text-gray-300 hover:text-gray-500 shrink-0 text-lg leading-none"
                      title="Remove"
                    >
                      ×
                    </button>
                  )}

                  {result && !result.error && (
                    <button
                      onClick={() => downloadFile(result)}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 shrink-0 font-medium"
                    >
                      Download
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary bar */}
        {successResults.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-green-800 space-y-0.5">
              <p className="font-semibold">
                Compressed {successResults.length} file{successResults.length !== 1 ? "s" : ""}
                {errorResults.length > 0 && (
                  <span className="text-red-500 font-normal ml-2">
                    · {errorResults.length} failed
                  </span>
                )}
              </p>
              <p className="text-green-700">
                {formatBytes(totalOriginal)} → {formatBytes(totalCompressed)} &nbsp;·&nbsp;
                saved {getSavingsPercent(totalOriginal, totalCompressed)}
              </p>
            </div>
            {successResults.length > 1 && (
              <button
                onClick={downloadAll}
                className="text-sm bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 font-medium shrink-0"
              >
                Download all
              </button>
            )}
          </div>
        )}

        {/* Action button */}
        <button
          onClick={compress}
          disabled={files.length === 0 || processing}
          className="w-full py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        >
          {processing
            ? `Compressing ${files.length} file${files.length !== 1 ? "s" : ""}…`
            : `Compress ${files.length > 0 ? files.length + " " : ""}PNG${files.length !== 1 ? "s" : ""}`}
        </button>

        {/* Info note */}
        <p className="text-center text-xs text-gray-400">
          Files are processed on the server and never stored. Output is PNG or WebP
          (when PNG alone cannot reach the 300 KB target).
        </p>
      </div>
    </div>
  );
}
