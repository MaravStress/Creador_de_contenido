// ==========================================================================
// ProcessingModal — Modal con lista de combinaciones para procesar
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { Combination } from '../../types/videoMix';

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  combinations: Combination[];
  onProcessComplete: () => void;
}

type ComboStatus = 'pending' | 'processing' | 'completed' | 'error';

const INIT_TIMEOUT_MS = 45_000; // 45 seconds max for FFmpeg initialization

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  onClose,
  combinations,
  onProcessComplete,
}) => {
  const [comboStatuses, setComboStatuses] = useState<Record<string, ComboStatus>>({});
  const [outputFiles, setOutputFiles] = useState<Map<string, Blob>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [initLog, setInitLog] = useState<string[]>([]);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const cancelRef = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialStatuses: Record<string, ComboStatus> = {};
      combinations.forEach(c => { initialStatuses[c.id] = 'pending'; });
      setComboStatuses(initialStatuses);
      setOutputFiles(new Map());
      setIsProcessing(false);
      setIsDone(false);
      setInitError(null);
      setInitLog([]);
      cancelRef.current = false;
    }
  }, [isOpen, combinations]);

  const addLog = useCallback((msg: string) => {
    console.log('[VideoMix]', msg);
    setInitLog(prev => [...prev, msg]);
  }, []);

  // Initialize FFmpeg with timeout and detailed logging
  const initFFmpeg = useCallback(async (): Promise<FFmpeg> => {
    if (ffmpegRef.current) return ffmpegRef.current;

    addLog('Creando instancia de FFmpeg...');
    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    // Check SharedArrayBuffer availability
    if (typeof SharedArrayBuffer === 'undefined') {
      throw new Error(
        'SharedArrayBuffer no está disponible. El navegador requiere los headers ' +
        'Cross-Origin-Opener-Policy y Cross-Origin-Embedder-Policy. ' +
        'Revisa la consola para más detalles.'
      );
    }
    addLog('✓ SharedArrayBuffer disponible');

    const base = `${window.location.origin}${import.meta.env.BASE_URL}ffmpeg/`;
    addLog(`Cargando FFmpeg desde: ${base}`);

    // Timeout promise
    const loadPromise = ffmpeg.load({
      coreURL: await toBlobURL(`${base}ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}ffmpeg-core.wasm`, 'application/wasm'),
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(
        `FFmpeg no se inicializó después de ${INIT_TIMEOUT_MS / 1000} segundos. ` +
        'Posibles causas: los archivos ffmpeg-core.js/wasm no se encuentran, ' +
        'SharedArrayBuffer no está habilitado, o el WASM falló al compilar.'
      )), INIT_TIMEOUT_MS)
    );

    await Promise.race([loadPromise, timeoutPromise]);
    addLog('✓ FFmpeg inicializado correctamente');

    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }, [addLog]);

  const processOne = useCallback(async (combo: Combination, index: number): Promise<void> => {
    if (cancelRef.current) return;

    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) return;

    setComboStatuses(prev => ({ ...prev, [combo.id]: 'processing' }));

    try {
      // Write all videos for this combo
      for (const video of combo.videos) {
        const fileData = await fetchFile(video.file);
        await ffmpeg.writeFile(`/tmp/${video.file.name}`, fileData);
      }

      // Create concat file
      const concatContent = combo.videos.map(v => `file '${v.file.name}'`).join('\n');
      await ffmpeg.writeFile(`/tmp/concat-${index}.txt`, concatContent);

      // Run ffmpeg
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', `/tmp/concat-${index}.txt`,
        '-c', 'copy',
        `/tmp/output-${index}.mp4`
      ]);

      // Read output
      const outputData: Uint8Array = await ffmpeg.readFile(`/tmp/output-${index}.mp4`) as Uint8Array;
      const blob = new Blob([outputData.buffer], { type: 'video/mp4' });

      setOutputFiles(prev => {
        const newMap = new Map(prev);
        newMap.set(combo.id, blob);
        return newMap;
      });

      setComboStatuses(prev => ({ ...prev, [combo.id]: 'completed' }));

    } catch (error) {
      console.error(`Error processing combo ${combo.id}:`, error);
      setComboStatuses(prev => ({ ...prev, [combo.id]: 'error' }));
    }
  }, []);

  const processAll = useCallback(async () => {
    setIsProcessing(true);
    setInitError(null);
    setInitLog([]);
    cancelRef.current = false;

    try {
      addLog('Inicializando FFmpeg...');
      await initFFmpeg();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[VideoMix] Error al inicializar FFmpeg:', err);
      addLog(`✗ Error: ${message}`);
      setInitError(message);
      // Mark all combos as error
      setComboStatuses(prev => {
        const updated = { ...prev };
        combinations.forEach(c => { updated[c.id] = 'error'; });
        return updated;
      });
      setIsProcessing(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg || cancelRef.current) return;

    for (let i = 0; i < combinations.length; i++) {
      if (cancelRef.current) break;

      addLog(`Procesando combinación ${i + 1} de ${combinations.length}...`);
      await processOne(combinations[i], i);

      // Cooldown of 2 seconds between each (except last)
      if (i < combinations.length - 1 && !cancelRef.current) {
        addLog(`Esperando 2 segundos antes de la siguiente combinación...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsProcessing(false);
    setIsDone(true);
    addLog('✓ Procesamiento completado');
    onProcessComplete();
  }, [combinations, initFFmpeg, processOne, onProcessComplete, addLog]);

  const downloadVideo = useCallback((combo: Combination) => {
    const blob = outputFiles.get(combo.id);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${combo.outputName}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  }, [outputFiles]);

  const downloadAll = useCallback(() => {
    combinations.forEach(combo => {
      downloadVideo(combo);
    });
  }, [combinations, downloadVideo]);

  if (!isOpen) return null;

  const totalCompleted = Object.values(comboStatuses).filter(s => s === 'completed').length;
  const totalErrors = Object.values(comboStatuses).filter(s => s === 'error').length;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 1050,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        className="glass-modal p-4 d-flex flex-column"
        style={{
          width: '90%',
          maxWidth: '700px',
          maxHeight: '80vh',
        }}
      >
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>
              Procesar Combinaciones
            </h5>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              {combinations.length} combinaciones · {totalCompleted} completadas{totalErrors > 0 ? ` · ${totalErrors} errores` : ''}
            </p>
          </div>
          {!isProcessing && (
            <button onClick={onClose} className="icon-btn">
              <span className="material-symbols-outlined fs-5">close</span>
            </button>
          )}
        </div>

        {/* Error banner */}
        {initError && (
          <div
            className="mb-3 p-3 rounded-3"
            style={{
              backgroundColor: 'rgba(255,69,58,0.15)',
              border: '1px solid rgba(255,69,58,0.3)',
              color: 'var(--apple-red)',
              fontSize: '0.8rem',
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="material-symbols-outlined fs-5">error</span>
              <strong>Error de inicialización</strong>
            </div>
            <p className="mb-1" style={{ lineHeight: '1.5' }}>{initError}</p>
            <p className="mb-0" style={{ opacity: 0.8, fontSize: '0.75rem' }}>
              Revisa la consola del navegador (F12) para más detalles.
              Asegúrate de que el servidor de desarrollo tenga los headers COOP/COEP configurados.
            </p>
          </div>
        )}

        {/* Init log */}
        {initLog.length > 0 && (
          <div
            className="mb-3 p-2 rounded-3"
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              maxHeight: '120px',
              overflow: 'auto',
              color: 'var(--text-secondary)',
            }}
          >
            {initLog.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {isProcessing && (
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Progreso general</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{totalCompleted}/{combinations.length}</span>
            </div>
            <div className="progress" style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${(totalCompleted / combinations.length) * 100}%`,
                  backgroundColor: 'var(--apple-blue)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Combination List */}
        <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '400px' }}>
          <div className="d-flex flex-column gap-2">
            {combinations.map((combo, idx) => {
              const status = comboStatuses[combo.id] || 'pending';
              return (
                <div
                  key={combo.id}
                  className="glass-panel p-3 d-flex align-items-center justify-content-between"
                  style={{
                    backgroundColor: status === 'processing' ? 'rgba(10,132,255,0.08)' : 'rgba(255,255,255,0.02)',
                    border: status === 'processing' ? '1px solid rgba(10,132,255,0.3)' : '1px solid transparent',
                  }}
                >
                  <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                    {/* Index */}
                    <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.08)', fontSize: '0.7rem', fontWeight: 500, minWidth: '24px' }}>
                      {idx + 1}
                    </span>

                    {/* Video names */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex flex-wrap gap-1">
                        {combo.videos.map((v, vi) => (
                          <React.Fragment key={vi}>
                            {vi > 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>+</span>}
                            <span className="text-truncate d-inline-block" style={{ fontSize: '0.75rem', maxWidth: '120px' }}>
                              {v.file.name}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {combo.outputName.substring(0, 60)}
                        {combo.outputName.length > 60 ? '...' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    {/* Status */}
                    {status === 'pending' && (
                      <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.08)', fontSize: '0.65rem' }}>Pendiente</span>
                    )}
                    {status === 'processing' && (
                      <div className="d-flex align-items-center gap-1">
                        <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }} role="status" />
                        <span style={{ fontSize: '0.65rem', color: 'var(--apple-blue)' }}>Procesando</span>
                      </div>
                    )}
                    {status === 'completed' && (
                      <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(48,209,88,0.2)', color: 'var(--apple-green)', fontSize: '0.65rem' }}>Completado</span>
                    )}
                    {status === 'error' && (
                      <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(255,69,58,0.2)', color: 'var(--apple-red)', fontSize: '0.65rem' }}>Error</span>
                    )}

                    {/* Download button */}
                    {status === 'completed' && (
                      <button
                        onClick={() => downloadVideo(combo)}
                        className="btn btn-sm p-1"
                        style={{ color: 'var(--apple-green)' }}
                        title="Descargar"
                      >
                        <span className="material-symbols-outlined fs-6">download</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="d-flex justify-content-end gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
          {!isProcessing && !isDone && (
            <button
              onClick={processAll}
              className="btn"
              style={{
                backgroundColor: 'var(--apple-blue)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                padding: '0.6rem 1.5rem',
                fontWeight: 500,
                fontSize: '0.85rem',
              }}
            >
              <span className="material-symbols-outlined fs-6 me-1">play_arrow</span>
              Procesar Todo
            </button>
          )}

          {isDone && (
            <button
              onClick={downloadAll}
              className="btn"
              style={{
                backgroundColor: 'var(--apple-green)',
                color: '#000',
                borderRadius: 'var(--radius-full)',
                padding: '0.6rem 1.5rem',
                fontWeight: 500,
                fontSize: '0.85rem',
                border: 'none',
              }}
            >
              <span className="material-symbols-outlined fs-6 me-1">download_all</span>
              Descargar Todo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};