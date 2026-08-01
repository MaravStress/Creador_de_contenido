import React from 'react';
import shortcutsData from './shortcuts.json';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutsList = [
    { key: shortcutsData.shortcuts.select, action: 'Herramienta Selección', desc: 'Seleccionar y mover clips en la línea de tiempo' },
    { key: shortcutsData.shortcuts.cut, action: 'Herramienta Corte (Blade)', desc: 'Dividir clip en la posición del puntero' },
    { key: shortcutsData.shortcuts.split, action: 'Dividir en Cabezal (Split)', desc: 'Dividir clip seleccionado en la posición del cabezal' },
    { key: shortcutsData.shortcuts.duplicate, action: 'Duplicar Clip al Arrastrar', desc: 'Mantener presionado Alt y arrastrar un clip para duplicarlo' },
    { key: shortcutsData.shortcuts.copy, action: 'Copiar Clip', desc: 'Copiar el clip seleccionado (y su audio vinculado)' },
    { key: shortcutsData.shortcuts.paste, action: 'Pegar Clip', desc: 'Pegar el clip copiado en la posición del cabezal' },
    { key: shortcutsData.shortcuts.toggleSnap, action: 'Activar / Desactivar Imán', desc: 'Ajuste magnético automático de clips (Snapping)' },
    { key: shortcutsData.shortcuts.playPause, action: 'Reproducir / Pausar', desc: 'Iniciar o detener la reproducción en el visualizador' },
    { key: shortcutsData.shortcuts.unlinkAudioVideo, action: 'Enlazar / Desenlazar Video y Audio', desc: 'Vincular o separar movimiento entre video y audio' },
    { key: shortcutsData.shortcuts.deleteClip, action: 'Eliminar Clip (Delete)', desc: 'Borrar clip seleccionado dejando espacio en blanco' },
    { key: shortcutsData.shortcuts.rippleDelete, action: 'Ripple Delete', desc: 'Borrar clip y desplazar automáticamente clips posteriores' },
  ];

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-5 p-3"
      style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="glass-modal p-4 w-100"
        style={{ maxWidth: '560px', borderRadius: 'var(--radius-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3 border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-primary fs-3">keyboard</span>
            <div>
              <h5 className="m-0 fw-bold text-white">Atajos de Teclado (DaVinci Resolve)</h5>
              <span className="extra-small text-white-50" style={{ fontSize: '0.78rem' }}>
                Configuración predeterminada de comandos rápidos
              </span>
            </div>
          </div>

          <button
            className="icon-btn rounded-circle"
            onClick={onClose}
            style={{ width: '32px', height: '32px' }}
          >
            <span className="material-symbols-outlined fs-5">close</span>
          </button>
        </div>

        <div className="d-flex flex-column gap-2 mb-4">
          {shortcutsList.map((sc, idx) => (
            <div
              key={idx}
              className="d-flex align-items-center justify-content-between p-2 rounded-3"
              style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--glass-border)' }}
            >
              <div>
                <div className="fw-semibold text-white" style={{ fontSize: '0.88rem' }}>
                  {sc.action}
                </div>
                <div className="extra-small text-white-50" style={{ fontSize: '0.75rem' }}>
                  {sc.desc}
                </div>
              </div>

              <kbd
                className="px-2 py-1 bg-dark text-info border border-secondary border-opacity-50 rounded font-monospace shadow-sm"
                style={{ fontSize: '0.85rem' }}
              >
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-end">
          <button className="flat-btn flat-btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
