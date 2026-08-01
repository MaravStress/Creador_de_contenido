import React, { useRef, useState } from 'react';
import type { ActiveTool, MediaAsset, TimelineClip, Track } from './types';
import { TimelineToolbar } from './TimelineToolbar';
import { VideoTrack } from './VideoTrack';
import { AudioTrack } from './AudioTrack';

interface TimelineProps {
  tracks: Track[];
  clips: TimelineClip[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  isSnapping: boolean;
  onToggleSnapping: () => void;
  onUpdateClips: (updatedClips: TimelineClip[]) => void;
  onAddMediaAssetToTimeline: (asset: MediaAsset, targetTime: number, targetTrackId?: string) => void;
  onUnlinkSelected: () => void;
  onDeleteSelected: (ripple: boolean) => void;
  onSplitAtPlayhead: () => void;
  onAddTrack?: (type: 'video' | 'audio') => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  clips,
  currentTime,
  duration,
  onSeek,
  selectedClipId,
  onSelectClip,
  activeTool,
  onSelectTool,
  isSnapping,
  onToggleSnapping,
  onUpdateClips,
  onAddMediaAssetToTimeline,
  onUnlinkSelected,
  onDeleteSelected,
  onSplitAtPlayhead,
  onAddTrack,
}) => {
  const [zoomLevel, setZoomLevel] = useState(60); // pixels per second
  const timelineRef = useRef<HTMLDivElement>(null);
  const tracksScrollRef = useRef<HTMLDivElement>(null);

  // Find linked status of selected clip
  const selectedClip = clips.find((c) => c.id === selectedClipId);
  const isClipLinked = Boolean(selectedClip?.isLinked);

  // Timeline width based on duration & zoom
  const totalTimelineWidth = Math.max(1000, duration * zoomLevel + 300);

  // Format ruler seconds into 00:00
  const formatRulerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Click on time ruler or playhead track to seek
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tracksScrollRef.current) return;
    const rect = tracksScrollRef.current.getBoundingClientRect();
    const scrollLeft = tracksScrollRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 120; // subtract track header width
    if (clickX >= 0) {
      const targetTime = Math.max(0, clickX / zoomLevel);
      onSeek(targetTime);
    }
  };

  // Blade cut action on clip
  const handleClipCut = (clipId: string, cutOffset: number) => {
    const targetClip = clips.find((c) => c.id === clipId);
    if (!targetClip || cutOffset <= 0.2 || cutOffset >= targetClip.duration - 0.2) return;

    // Split targetClip into 2 clips
    const clip1: TimelineClip = {
      ...targetClip,
      duration: cutOffset,
      outTime: targetClip.inTime + cutOffset,
    };

    const clip2: TimelineClip = {
      ...targetClip,
      id: 'clip-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      startTime: targetClip.startTime + cutOffset,
      duration: targetClip.duration - cutOffset,
      inTime: targetClip.inTime + cutOffset,
      outTime: targetClip.outTime,
    };

    // If linked, also split paired clip
    let updatedClipsList = clips.map((c) => (c.id === targetClip.id ? clip1 : c)).concat(clip2);

    if (targetClip.isLinked && targetClip.linkedId) {
      const linkedPair = clips.find((c) => c.id === targetClip.linkedId);
      if (linkedPair) {
        const pairClip1: TimelineClip = {
          ...linkedPair,
          duration: cutOffset,
          outTime: linkedPair.inTime + cutOffset,
        };

        const newPairId = 'clip-' + Date.now() + '-pair-' + Math.random().toString(36).substring(2, 6);
        const pairClip2: TimelineClip = {
          ...linkedPair,
          id: newPairId,
          startTime: linkedPair.startTime + cutOffset,
          duration: linkedPair.duration - cutOffset,
          inTime: linkedPair.inTime + cutOffset,
          outTime: linkedPair.outTime,
          linkedId: clip2.id,
        };

        clip2.linkedId = newPairId;

        updatedClipsList = updatedClipsList.map((c) => (c.id === linkedPair.id ? pairClip1 : c)).concat(pairClip2);
      }
    }

    onUpdateClips(updatedClipsList);
  };

  // Dragging clips to move across time or tracks (with Alt+Drag duplication)
  const handleClipMoveStart = (e: React.MouseEvent, clip: TimelineClip) => {
    e.stopPropagation();

    const startX = e.clientX;
    const initialStartTime = clip.startTime;
    const linkedPair = clip.isLinked && clip.linkedId ? clips.find((c) => c.id === clip.linkedId) : null;
    const pairInitialTime = linkedPair ? linkedPair.startTime : 0;

    const isAltKey = e.altKey;
    let targetClip = clip;
    let targetPair = linkedPair;
    let baseClips = clips;

    if (isAltKey) {
      const newClipId = 'clip-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newPairId = linkedPair ? 'clip-pair-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6) : undefined;

      const dupClip: TimelineClip = {
        ...clip,
        id: newClipId,
        linkedId: newPairId,
      };

      const dupPair: TimelineClip | null = linkedPair
        ? {
            ...linkedPair,
            id: newPairId!,
            linkedId: newClipId,
          }
        : null;

      targetClip = dupClip;
      targetPair = dupPair;
      baseClips = [...clips, dupClip, ...(dupPair ? [dupPair] : [])];
      onSelectClip(newClipId);
    } else {
      onSelectClip(clip.id);
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newTime = Math.max(0, initialStartTime + deltaX / zoomLevel);

      // Multi-point Snapping engine if magnet (isSnapping) is active
      if (isSnapping) {
        const snapThresholdSec = 14 / zoomLevel; // ~14px magnetic snap pull radius
        const candidateSnaps: number[] = [0, currentTime];

        // Gather all clip boundaries (excluding target clip & its linked pair)
        baseClips.forEach((other) => {
          if (other.id !== targetClip.id && (targetPair ? other.id !== targetPair.id : true)) {
            candidateSnaps.push(other.startTime);
            candidateSnaps.push(other.startTime + other.duration);
          }
        });

        let bestDelta = Infinity;
        let snappedStart = newTime;

        // 1. Check if START of dragged clip aligns with any candidate snap point
        candidateSnaps.forEach((snapPoint) => {
          const delta = Math.abs(newTime - snapPoint);
          if (delta < snapThresholdSec && delta < bestDelta) {
            bestDelta = delta;
            snappedStart = snapPoint;
          }
        });

        // 2. Check if END of dragged clip aligns with any candidate snap point
        candidateSnaps.forEach((snapPoint) => {
          const targetEnd = newTime + targetClip.duration;
          const delta = Math.abs(targetEnd - snapPoint);
          if (delta < snapThresholdSec && delta < bestDelta) {
            bestDelta = delta;
            snappedStart = Math.max(0, snapPoint - targetClip.duration);
          }
        });

        newTime = snappedStart;
      }

      // Check hovered track to allow vertical track changing (including ghost V_NEW and A_NEW)
      const hoveredEl = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const trackEl = hoveredEl?.closest('[data-track-id]') as HTMLElement | null;
      const hoveredTrackId = trackEl?.getAttribute('data-track-id');
      const hoveredTrackType = trackEl?.getAttribute('data-track-type');

      let targetTrackId = targetClip.trackId;

      if (hoveredTrackId === 'V_NEW' && targetClip.type === 'video') {
        const maxNum = videoTracks.reduce((max, t) => Math.max(max, parseInt(t.id.replace('V', ''), 10) || 0), 0);
        const nextNum = maxNum + 1;
        const nextTrackId = `V${nextNum}`;
        if (onAddTrack && !tracks.some((t) => t.id === nextTrackId)) {
          onAddTrack('video');
        }
        targetTrackId = nextTrackId;
      } else if (hoveredTrackId === 'A_NEW' && targetClip.type === 'audio') {
        const maxNum = audioTracks.reduce((max, t) => Math.max(max, parseInt(t.id.replace('A', ''), 10) || 0), 0);
        const nextNum = maxNum + 1;
        const nextTrackId = `A${nextNum}`;
        if (onAddTrack && !tracks.some((t) => t.id === nextTrackId)) {
          onAddTrack('audio');
        }
        targetTrackId = nextTrackId;
      } else if (hoveredTrackId && hoveredTrackType === targetClip.type) {
        targetTrackId = hoveredTrackId;
      }

      // Calculate track index delta to synchronize linked pair track movement (V1->V2 causes A1->A2)
      const initialTrackNum = parseInt(clip.trackId.replace(/[^0-9]/g, ''), 10) || 1;
      const targetTrackNum = parseInt(targetTrackId.replace(/[^0-9]/g, ''), 10) || 1;
      const trackDeltaNum = targetTrackNum - initialTrackNum;

      let targetPairTrackId = targetPair ? targetPair.trackId : undefined;
      if (targetPair) {
        const initialPairTrackNum = parseInt(linkedPair?.trackId.replace(/[^0-9]/g, '') || '1', 10) || 1;
        const targetPairTrackNum = Math.max(1, initialPairTrackNum + trackDeltaNum);
        const pairPrefix = targetPair.type === 'video' ? 'V' : 'A';
        targetPairTrackId = `${pairPrefix}${targetPairTrackNum}`;

        // Ensure pair track exists if onAddTrack is provided and track is missing
        if (onAddTrack && !tracks.some((t) => t.id === targetPairTrackId)) {
          onAddTrack(targetPair.type);
        }
      }

      const timeDelta = newTime - initialStartTime;

      const nextClips = baseClips.map((c) => {
        if (c.id === targetClip.id) {
          return { ...c, startTime: newTime, trackId: targetTrackId };
        }
        if (targetPair && c.id === targetPair.id) {
          return { ...c, startTime: Math.max(0, pairInitialTime + timeDelta), trackId: targetPairTrackId! };
        }
        return c;
      });

      onUpdateClips(nextClips);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Trimming clips (start or end handles)
  const handleTrimStart = (e: React.MouseEvent, clip: TimelineClip, handle: 'start' | 'end') => {
    const startX = e.clientX;
    const initialStart = clip.startTime;
    const initialDuration = clip.duration;
    const initialInTime = clip.inTime;
    const linkedPair = clip.isLinked && clip.linkedId ? clips.find((c) => c.id === clip.linkedId) : null;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / zoomLevel;

      let nextClips = [...clips];

      if (handle === 'start') {
        const maxDelta = initialDuration - 0.5;
        const boundedDelta = Math.min(maxDelta, deltaTime);
        const newStart = Math.max(0, initialStart + boundedDelta);
        const newDuration = Math.max(0.5, initialDuration - boundedDelta);
        const newInTime = Math.max(0, initialInTime + boundedDelta);

        nextClips = nextClips.map((c) => {
          if (c.id === clip.id) {
            return { ...c, startTime: newStart, duration: newDuration, inTime: newInTime };
          }
          if (linkedPair && c.id === linkedPair.id) {
            return { ...c, startTime: newStart, duration: newDuration, inTime: newInTime };
          }
          return c;
        });
      } else {
        // end handle
        const newDuration = Math.max(0.5, initialDuration + deltaTime);
        nextClips = nextClips.map((c) => {
          if (c.id === clip.id) {
            return { ...c, duration: newDuration, outTime: c.inTime + newDuration };
          }
          if (linkedPair && c.id === linkedPair.id) {
            return { ...c, duration: newDuration, outTime: c.inTime + newDuration };
          }
          return c;
        });
      }

      onUpdateClips(nextClips);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Drag over & Drop media from pool to timeline
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr || !tracksScrollRef.current) return;

    try {
      const asset: MediaAsset = JSON.parse(dataStr);
      const rect = tracksScrollRef.current.getBoundingClientRect();
      const scrollLeft = tracksScrollRef.current.scrollLeft;
      const dropX = e.clientX - rect.left + scrollLeft - 120;
      const targetTime = Math.max(0, dropX / zoomLevel);

      const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
      const trackEl = hoveredEl?.closest('[data-track-id]') as HTMLElement | null;
      const dropTrackId = trackEl?.getAttribute('data-track-id');

      let finalTrackId: string | undefined = undefined;

      if (dropTrackId === 'V_NEW') {
        const maxNum = videoTracks.reduce((max, t) => Math.max(max, parseInt(t.id.replace('V', ''), 10) || 0), 0);
        const nextNum = maxNum + 1;
        finalTrackId = `V${nextNum}`;
        if (onAddTrack && !tracks.some((t) => t.id === finalTrackId)) {
          onAddTrack('video');
        }
      } else if (dropTrackId === 'A_NEW') {
        const maxNum = audioTracks.reduce((max, t) => Math.max(max, parseInt(t.id.replace('A', ''), 10) || 0), 0);
        const nextNum = maxNum + 1;
        finalTrackId = `A${nextNum}`;
        if (onAddTrack && !tracks.some((t) => t.id === finalTrackId)) {
          onAddTrack('audio');
        }
      } else if (dropTrackId) {
        finalTrackId = dropTrackId;
      }

      onAddMediaAssetToTimeline(asset, targetTime, finalTrackId);
    } catch (err) {
      console.error('Error dropping asset on timeline', err);
    }
  };

  // Video tracks ordered FROM BOTTOM TO TOP (V1 right above divider, V2 above V1, V3 above V2)
  const videoTracks = tracks
    .filter((t) => t.type === 'video')
    .slice()
    .sort((a, b) => {
      const numA = parseInt(a.id.replace('V', ''), 10) || 0;
      const numB = parseInt(b.id.replace('V', ''), 10) || 0;
      return numB - numA; // Descending: V3, V2, V1
    });

  // Audio tracks ordered FROM TOP TO BOTTOM (A1 right below divider, A2 below A1, A3 below A2)
  const audioTracks = tracks
    .filter((t) => t.type === 'audio')
    .slice()
    .sort((a, b) => {
      const numA = parseInt(a.id.replace('A', ''), 10) || 0;
      const numB = parseInt(b.id.replace('A', ''), 10) || 0;
      return numA - numB; // Ascending: A1, A2, A3
    });

  return (
    <div
      ref={timelineRef}
      className="glass-panel d-flex flex-column h-100 overflow-hidden"
      style={{ borderRadius: 'var(--radius-md)', minHeight: '340px' }}
      onClick={() => onSelectClip(null)}
    >
      {/* Timeline Editing Toolbar */}
      <TimelineToolbar
        activeTool={activeTool}
        onSelectTool={onSelectTool}
        isSnapping={isSnapping}
        onToggleSnapping={onToggleSnapping}
        onSplitAtPlayhead={onSplitAtPlayhead}
        onUnlinkSelected={onUnlinkSelected}
        onDeleteSelected={onDeleteSelected}
        selectedClipId={selectedClipId}
        isClipLinked={isClipLinked}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        onAddTrack={onAddTrack}
      />

      {/* Main Tracks & Ruler Container */}
      <div
        ref={tracksScrollRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex-grow-1 overflow-auto position-relative bg-dark"
        style={{ backgroundColor: '#0b0c10' }}
      >
        <div style={{ width: `${totalTimelineWidth}px`, minWidth: '100%' }}>
          {/* Time Ruler (Sticky Top, Fixed vertically, Scrolls horizontally with timeline content) */}
          <div
            onClick={handleRulerClick}
            className="d-flex align-items-end position-relative border-bottom cursor-pointer"
            style={{
              position: 'sticky',
              top: 0,
              height: '28px',
              backgroundColor: 'rgba(20, 22, 32, 0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderColor: 'var(--glass-border)',
              zIndex: 15,
            }}
          >
            {/* Top-Left Header Placeholder (Fixed both horizontally & vertically) */}
            <div
              className="border-end px-2 d-flex align-items-center extra-small text-white-50 fw-bold"
              style={{
                position: 'sticky',
                left: 0,
                width: '120px',
                height: '100%',
                backgroundColor: 'rgba(24, 26, 36, 0.96)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderColor: 'var(--glass-border)',
                zIndex: 20,
              }}
            >
              Time / Tracks
            </div>

            {/* Ruler Ticks */}
            <div className="position-relative flex-grow-1 h-100">
              {Array.from({ length: Math.ceil(duration + 60) }).map((_, i) => {
                if (i % 5 === 0) {
                  return (
                    <div
                      key={i}
                      className="position-absolute d-flex flex-column align-items-start"
                      style={{ left: `${i * zoomLevel}px`, bottom: 0 }}
                    >
                      <span className="extra-small text-white-50 font-monospace" style={{ fontSize: '0.65rem' }}>
                        {formatRulerTime(i)}
                      </span>
                      <div className="bg-secondary" style={{ width: '1px', height: '8px' }} />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Red Playhead Line */}
          <div
            className="position-absolute top-0 bottom-0 z-5 pointer-events-none"
            style={{
              left: `${120 + currentTime * zoomLevel}px`,
              width: '2px',
              backgroundColor: '#ff453a', // Apple Red
              boxShadow: '0 0 8px rgba(255, 69, 58, 0.8)',
            }}
          >
            <div
              className="position-absolute top-0 start-50 translate-middle-x"
              style={{
                width: '12px',
                height: '14px',
                backgroundColor: '#ff453a',
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              }}
            />
          </div>

          {/* Section 1: Video Tracks (Organized from Bottom to Top: V3, V2, V1) */}
          <div className="video-tracks-section">
            {/* Ghost New Video Track Row (Top of Video section) */}
            <div
              data-track-id="V_NEW"
              data-track-type="video"
              className="d-flex align-items-center position-relative border-bottom text-white-50"
              style={{
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                className="d-flex align-items-center px-2 flex-shrink-0 border-end text-primary"
                style={{
                  position: 'sticky',
                  left: 0,
                  width: '120px',
                  height: '100%',
                  backgroundColor: 'rgba(18, 20, 28, 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderColor: 'var(--glass-border)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  zIndex: 10,
                }}
              >
                + Pista Video
              </div>
              <div className="px-3 extra-small text-white-50 fst-italic" style={{ fontSize: '0.7rem' }}>
                Coloca un clip aquí para crear automáticamente una nueva pista de video
              </div>
            </div>

            {videoTracks.map((track) => (
              <VideoTrack
                key={track.id}
                track={track}
                clips={clips.filter((c) => c.trackId === track.id)}
                selectedClipId={selectedClipId}
                activeTool={activeTool}
                pxPerSec={zoomLevel}
                onSelectClip={onSelectClip}
                onClipCut={handleClipCut}
                onClipMoveStart={handleClipMoveStart}
                onTrimStart={handleTrimStart}
              />
            ))}
          </div>

          {/* Divider between Video and Audio */}
          <div className="bg-secondary bg-opacity-25 border-top border-bottom py-05" style={{ height: '4px' }} />

          {/* Section 2: Audio Tracks (Organized from Top to Bottom: A1, A2, A3) */}
          <div className="audio-tracks-section">
            {audioTracks.map((track) => (
              <AudioTrack
                key={track.id}
                track={track}
                clips={clips.filter((c) => c.trackId === track.id)}
                selectedClipId={selectedClipId}
                activeTool={activeTool}
                pxPerSec={zoomLevel}
                onSelectClip={onSelectClip}
                onClipCut={handleClipCut}
                onClipMoveStart={handleClipMoveStart}
                onTrimStart={handleTrimStart}
              />
            ))}

            {/* Ghost New Audio Track Row (Bottom of Audio section) */}
            <div
              data-track-id="A_NEW"
              data-track-type="audio"
              className="d-flex align-items-center position-relative border-bottom text-white-50"
              style={{
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                className="d-flex align-items-center px-2 flex-shrink-0 border-end text-success"
                style={{
                  position: 'sticky',
                  left: 0,
                  width: '120px',
                  height: '100%',
                  backgroundColor: 'rgba(18, 20, 28, 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderColor: 'var(--glass-border)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  zIndex: 10,
                }}
              >
                + Pista Audio
              </div>
              <div className="px-3 extra-small text-white-50 fst-italic" style={{ fontSize: '0.7rem' }}>
                Coloca un clip aquí para crear automáticamente una nueva pista de audio
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
