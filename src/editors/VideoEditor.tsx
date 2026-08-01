import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  ActiveTool,
  MediaAsset,
  OrientationMode,
  TimelineClip,
  Track,
  VideoProject,
} from '../components/videoeditor/types';
import {
  Header,
  MediaPool,
  VideoPreview,
  Timeline,
  ShortcutsModal,
} from '../components/videoeditor';
import shortcutsConfig from '../components/videoeditor/shortcuts.json';

interface VideoEditorProps {
  onBack: () => void;
}

// Initial Sample Media Pool Assets for immediate demonstration
const INITIAL_ASSETS: MediaAsset[] = [
  {
    id: 'asset-sample-1',
    title: 'Intro_Cinematic_4K.mp4',
    type: 'video-audio',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 15,
  },
  {
    id: 'asset-sample-2',
    title: 'B-Roll_Landscape_Nature.mp4',
    type: 'video-audio',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: 15,
  },
  {
    id: 'asset-sample-3',
    title: 'Background_Music_Ambient.mp3',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 30,
  },
];

const INITIAL_TRACKS: Track[] = [
  { id: 'V1', type: 'video', name: 'Video 1' },
  { id: 'V2', type: 'video', name: 'Video 2' },
  { id: 'A1', type: 'audio', name: 'Audio 1' },
  { id: 'A2', type: 'audio', name: 'Audio 2' },
];

const INITIAL_CLIPS: TimelineClip[] = [
  {
    id: 'clip-v1',
    assetId: 'asset-sample-1',
    title: 'Intro_Cinematic_4K.mp4',
    type: 'video',
    trackId: 'V1',
    startTime: 0,
    duration: 10,
    inTime: 0,
    outTime: 10,
    mediaDuration: 15,
    linkedId: 'clip-a1',
    isLinked: true,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    color: 'linear-gradient(135deg, rgba(10, 132, 255, 0.5) 0%, rgba(191, 90, 242, 0.4) 100%)',
  },
  {
    id: 'clip-a1',
    assetId: 'asset-sample-1',
    title: 'Intro_Cinematic_Audio',
    type: 'audio',
    trackId: 'A1',
    startTime: 0,
    duration: 10,
    inTime: 0,
    outTime: 10,
    mediaDuration: 15,
    linkedId: 'clip-v1',
    isLinked: true,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    color: 'linear-gradient(135deg, rgba(48, 209, 88, 0.4) 0%, rgba(10, 132, 255, 0.3) 100%)',
  },
];

const INITIAL_PROJECTS: VideoProject[] = [
  {
    id: 'proj-1',
    name: 'Proyecto Principal #1',
    orientation: 'horizontal',
    fps: 30,
    duration: 60,
    tracks: INITIAL_TRACKS,
    clips: INITIAL_CLIPS,
    mediaPool: INITIAL_ASSETS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const VideoEditor: React.FC<VideoEditorProps> = ({ onBack }) => {
  const [projects, setProjects] = useState<VideoProject[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>('proj-1');

  // Active Project Reference
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Editor Playback & Interactive State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [isSnapping, setIsSnapping] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Update active project helper
  const updateActiveProject = useCallback((updater: (prev: VideoProject) => VideoProject) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => (p.id === activeProjectId ? updater(p) : p))
    );
  }, [activeProjectId]);

  // Playhead animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + deltaSec;
        if (next >= activeProject.duration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, activeProject.duration]);

  // Toggle Link / Unlink for selected clip pair
  const handleUnlinkSelected = useCallback(() => {
    if (!selectedClipId) return;

    const target = activeProject.clips.find((c) => c.id === selectedClipId);
    if (!target || !target.linkedId) return;

    const partnerId = target.linkedId;

    updateActiveProject((p) => ({
      ...p,
      clips: p.clips.map((c) => {
        if (c.id === target.id || c.id === partnerId) {
          return { ...c, isLinked: !c.isLinked };
        }
        return c;
      }),
    }));
  }, [selectedClipId, activeProject.clips, updateActiveProject]);

  // Delete / Ripple Delete selected clip
  const handleDeleteSelected = useCallback((ripple = false) => {
    if (!selectedClipId) return;

    const targetClip = activeProject.clips.find((c) => c.id === selectedClipId);
    if (!targetClip) return;

    const deletedIds = [targetClip.id];
    if (targetClip.isLinked && targetClip.linkedId) {
      deletedIds.push(targetClip.linkedId);
    }

    let nextClips = activeProject.clips.filter((c) => !deletedIds.includes(c.id));

    if (ripple) {
      const gapStart = targetClip.startTime;
      const gapLength = targetClip.duration;

      nextClips = nextClips.map((c) => {
        if (c.startTime > gapStart) {
          return { ...c, startTime: Math.max(0, c.startTime - gapLength) };
        }
        return c;
      });
    }

    updateActiveProject((p) => ({ ...p, clips: nextClips }));
    setSelectedClipId(null);
  }, [selectedClipId, activeProject.clips, updateActiveProject]);

  // Split selected clip at current playhead
  const handleSplitAtPlayhead = useCallback(() => {
    if (!selectedClipId) return;
    const targetClip = activeProject.clips.find((c) => c.id === selectedClipId);
    if (!targetClip) return;

    const cutOffset = currentTime - targetClip.startTime;
    if (cutOffset <= 0.2 || cutOffset >= targetClip.duration - 0.2) return;

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

    let nextClips = activeProject.clips.map((c) => (c.id === targetClip.id ? clip1 : c)).concat(clip2);

    if (targetClip.isLinked && targetClip.linkedId) {
      const linkedPair = activeProject.clips.find((c) => c.id === targetClip.linkedId);
      if (linkedPair) {
        const pairClip1: TimelineClip = {
          ...linkedPair,
          duration: cutOffset,
          outTime: linkedPair.inTime + cutOffset,
        };

        const newPairId = 'clip-pair-' + Date.now();
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
        nextClips = nextClips.map((c) => (c.id === linkedPair.id ? pairClip1 : c)).concat(pairClip2);
      }
    }

    updateActiveProject((p) => ({ ...p, clips: nextClips }));
  }, [selectedClipId, activeProject.clips, currentTime, updateActiveProject]);

  // Clipboard state for copy/paste
  const [clipboard, setClipboard] = useState<{ mainClip: TimelineClip; linkedClip?: TimelineClip } | null>(null);

  // Copy selected clip(s)
  const handleCopySelected = useCallback(() => {
    if (!selectedClipId) return;
    const targetClip = activeProject.clips.find((c) => c.id === selectedClipId);
    if (!targetClip) return;

    const linkedPair = targetClip.isLinked && targetClip.linkedId
      ? activeProject.clips.find((c) => c.id === targetClip.linkedId)
      : undefined;

    setClipboard({
      mainClip: targetClip,
      linkedClip: linkedPair,
    });
  }, [selectedClipId, activeProject.clips]);

  // Paste copied clip(s) at currentTime playhead
  const handlePasteAtPlayhead = useCallback(() => {
    if (!clipboard) return;

    const newMainId = 'clip-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newPairId = clipboard.linkedClip ? 'clip-pair-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6) : undefined;

    const pastedMain: TimelineClip = {
      ...clipboard.mainClip,
      id: newMainId,
      startTime: currentTime,
      linkedId: newPairId,
    };

    const pastedPair: TimelineClip | null = clipboard.linkedClip
      ? {
          ...clipboard.linkedClip,
          id: newPairId!,
          startTime: currentTime,
          linkedId: newMainId,
        }
      : null;

    updateActiveProject((p) => ({
      ...p,
      clips: [...p.clips, pastedMain, ...(pastedPair ? [pastedPair] : [])],
    }));

    setSelectedClipId(newMainId);
  }, [clipboard, currentTime, updateActiveProject]);

  // DaVinci Resolve Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing inside inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const keyUpper = e.key.toUpperCase();

      // Ctrl + C -> Copy
      if (e.ctrlKey && keyUpper === 'C') {
        e.preventDefault();
        handleCopySelected();
        return;
      }

      // Ctrl + V -> Paste
      if (e.ctrlKey && keyUpper === 'V') {
        e.preventDefault();
        handlePasteAtPlayhead();
        return;
      }

      // Space -> Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
        return;
      }

      // A -> Select tool
      if (keyUpper === shortcutsConfig.shortcuts.select) {
        setActiveTool('select');
        return;
      }

      // B -> Cut / Blade tool
      if (keyUpper === shortcutsConfig.shortcuts.cut) {
        setActiveTool('cut');
        return;
      }

      // C -> Split at playhead (when not Ctrl+C)
      if (!e.ctrlKey && keyUpper === shortcutsConfig.shortcuts.split) {
        e.preventDefault();
        handleSplitAtPlayhead();
        return;
      }

      // N -> Toggle Snapping
      if (keyUpper === shortcutsConfig.shortcuts.toggleSnap) {
        setIsSnapping((prev) => !prev);
        return;
      }

      // Ctrl + L -> Unlink / Link Video and Audio
      if (e.ctrlKey && keyUpper === 'L') {
        e.preventDefault();
        handleUnlinkSelected();
        return;
      }

      // Backspace -> Delete
      if (e.key === 'Backspace' && !e.shiftKey) {
        e.preventDefault();
        handleDeleteSelected(false);
        return;
      }

      // Shift + Backspace -> Ripple Delete
      if (e.key === 'Backspace' && e.shiftKey) {
        e.preventDefault();
        handleDeleteSelected(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopySelected, handlePasteAtPlayhead, handleDeleteSelected, handleSplitAtPlayhead, handleUnlinkSelected]);

  // Create new project
  const handleCreateNewProject = () => {
    const newId = 'proj-' + Date.now();
    const newProj: VideoProject = {
      id: newId,
      name: `Nuevo Proyecto #${projects.length + 1}`,
      orientation: 'horizontal',
      fps: 30,
      duration: 60,
      tracks: INITIAL_TRACKS,
      clips: [],
      mediaPool: INITIAL_ASSETS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newId);
    setCurrentTime(0);
    setSelectedClipId(null);
  };

  // Add media asset to Media Pool
  const handleAddMediaAsset = (asset: MediaAsset) => {
    updateActiveProject((p) => ({
      ...p,
      mediaPool: [...p.mediaPool, asset],
    }));
  };

  // Add media asset onto timeline tracks
  const handleAddAssetToTimeline = (asset: MediaAsset, targetTime = currentTime, targetTrackId?: string) => {
    const timePos = Math.round(targetTime * 10) / 10;
    const isTargetVideo = targetTrackId?.startsWith('V');
    const isTargetAudio = targetTrackId?.startsWith('A');

    const vTrack = isTargetVideo ? targetTrackId! : 'V1';
    const trackNum = parseInt(vTrack.replace(/[^0-9]/g, ''), 10) || 1;
    const aTrack = isTargetAudio ? targetTrackId! : `A${trackNum}`;

    if (asset.type === 'video-audio') {
      // Linked Video + Audio clip pair
      const vClipId = 'clip-v-' + Date.now();
      const aClipId = 'clip-a-' + Date.now();

      const videoClip: TimelineClip = {
        id: vClipId,
        assetId: asset.id,
        title: asset.title,
        type: 'video',
        trackId: vTrack,
        startTime: timePos,
        duration: asset.duration,
        inTime: 0,
        outTime: asset.duration,
        mediaDuration: asset.duration,
        linkedId: aClipId,
        isLinked: true,
        url: asset.url,
      };

      const audioClip: TimelineClip = {
        id: aClipId,
        assetId: asset.id,
        title: `${asset.title} (Audio)`,
        type: 'audio',
        trackId: aTrack,
        startTime: timePos,
        duration: asset.duration,
        inTime: 0,
        outTime: asset.duration,
        mediaDuration: asset.duration,
        linkedId: vClipId,
        isLinked: true,
        url: asset.url,
      };

      updateActiveProject((p) => ({
        ...p,
        clips: [...p.clips, videoClip, audioClip],
      }));
    } else if (asset.type === 'video') {
      const videoClip: TimelineClip = {
        id: 'clip-v-' + Date.now(),
        assetId: asset.id,
        title: asset.title,
        type: 'video',
        trackId: vTrack,
        startTime: timePos,
        duration: asset.duration,
        inTime: 0,
        outTime: asset.duration,
        mediaDuration: asset.duration,
        url: asset.url,
      };

      updateActiveProject((p) => ({
        ...p,
        clips: [...p.clips, videoClip],
      }));
    } else if (asset.type === 'audio') {
      const audioClip: TimelineClip = {
        id: 'clip-a-' + Date.now(),
        assetId: asset.id,
        title: asset.title,
        type: 'audio',
        trackId: aTrack,
        startTime: timePos,
        duration: asset.duration,
        inTime: 0,
        outTime: asset.duration,
        mediaDuration: asset.duration,
        url: asset.url,
      };

      updateActiveProject((p) => ({
        ...p,
        clips: [...p.clips, audioClip],
      }));
    }
  };

  // Add new track (V3, A3, etc.)
  const handleAddTrack = (type: 'video' | 'audio') => {
    updateActiveProject((p) => {
      const existing = p.tracks.filter((t) => t.type === type);
      const nextNum = existing.length + 1;
      const prefix = type === 'video' ? 'V' : 'A';
      const name = type === 'video' ? `Video ${nextNum}` : `Audio ${nextNum}`;
      const newTrack: Track = {
        id: `${prefix}${nextNum}`,
        type,
        name,
      };
      return { ...p, tracks: [...p.tracks, newTrack] };
    });
  };



  // Find clip under playhead for video rendering
  const activeClipAtPlayhead =
    activeProject.clips.find(
      (c) =>
        c.type === 'video' &&
        currentTime >= c.startTime &&
        currentTime <= c.startTime + c.duration
    ) || null;

  const isVertical = activeProject.orientation === 'vertical';

  return (
    <div className="container-fluid vh-100 p-3 d-flex flex-column overflow-hidden" style={{ color: 'var(--text-primary)' }}>
      {/* Top Header */}
      <Header
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          setCurrentTime(0);
          setSelectedClipId(null);
        }}
        onCreateNewProject={handleCreateNewProject}
        orientation={activeProject.orientation}
        onToggleOrientation={(mode: OrientationMode) =>
          updateActiveProject((p) => ({ ...p, orientation: mode }))
        }
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onBack={onBack}
      />

      {/* Main Workspace Layout */}
      {isVertical ? (
        /* Vertical Screen Layout Mode (Diagram: Medios + Timeline Stacked Left, Visualizador Full Height Right flush) */
        <div className="flex-grow-1 d-flex gap-3 align-items-stretch overflow-hidden">
          {/* Left Column: Stacked Medios (Top) and Timeline (Bottom) - Fills all remaining width & height */}
          <div className="flex-grow-1 d-flex flex-column gap-3 overflow-hidden" style={{ minWidth: 0 }}>
            {/* Top Left: Medios */}
            <div style={{ height: '220px', flexShrink: 0 }}>
              <MediaPool
                assets={activeProject.mediaPool}
                onAddAsset={handleAddMediaAsset}
                onAddToTimeline={(asset) => handleAddAssetToTimeline(asset)}
              />
            </div>

            {/* Bottom Left: Timeline - Takes all remaining vertical height */}
            <div className="flex-grow-1 d-flex flex-column overflow-hidden">
              <Timeline
                tracks={activeProject.tracks}
                clips={activeProject.clips}
                currentTime={currentTime}
                duration={activeProject.duration}
                onSeek={setCurrentTime}
                selectedClipId={selectedClipId}
                onSelectClip={setSelectedClipId}
                activeTool={activeTool}
                onSelectTool={setActiveTool}
                isSnapping={isSnapping}
                onToggleSnapping={() => setIsSnapping(!isSnapping)}
                onUpdateClips={(updated) => updateActiveProject((p) => ({ ...p, clips: updated }))}
                onAddMediaAssetToTimeline={(asset, time) => handleAddAssetToTimeline(asset, time)}
                onUnlinkSelected={handleUnlinkSelected}
                onDeleteSelected={handleDeleteSelected}
                onSplitAtPlayhead={handleSplitAtPlayhead}
                onAddTrack={handleAddTrack}
              />
            </div>
          </div>

          {/* Right Column: Visualizador Panel - Tight width, zero side gap */}
          <div className="flex-shrink-0 d-flex flex-column" style={{ width: '440px' }}>
            <VideoPreview
              currentTime={currentTime}
              duration={activeProject.duration}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSeek={setCurrentTime}
              activeClip={activeClipAtPlayhead}
              orientation="vertical"
            />
          </div>
        </div>
      ) : (
        /* Horizontal Screen Layout Mode (Diagram: Medios Left, Visualizador Right 16:9, Timeline Full Width Bottom) */
        <div className="flex-grow-1 d-flex flex-column gap-3 overflow-hidden">
          {/* Upper Section: Media Pool Left (fills remaining space) & Video Viewer Right (Strict 16:9 ratio) */}
          <div className="d-flex gap-3 align-items-stretch" style={{ height: '340px', flexShrink: 0 }}>
            {/* Column 1: Media Pool - Fills all remaining width */}
            <div className="flex-grow-1 d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
              <MediaPool
                assets={activeProject.mediaPool}
                onAddAsset={handleAddMediaAsset}
                onAddToTimeline={(asset) => handleAddAssetToTimeline(asset)}
              />
            </div>

            {/* Column 2: Video Preview - Strict 16:9 ratio box */}
            <div className="flex-shrink-0 d-flex flex-column" style={{ width: '540px' }}>
              <VideoPreview
                currentTime={currentTime}
                duration={activeProject.duration}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onSeek={setCurrentTime}
                activeClip={activeClipAtPlayhead}
                orientation="horizontal"
              />
            </div>
          </div>

          {/* Lower Section: Full Width Timeline - Takes all remaining vertical height */}
          <div className="flex-grow-1 d-flex flex-column overflow-hidden">
            <Timeline
              tracks={activeProject.tracks}
              clips={activeProject.clips}
              currentTime={currentTime}
              duration={activeProject.duration}
              onSeek={setCurrentTime}
              selectedClipId={selectedClipId}
              onSelectClip={setSelectedClipId}
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              isSnapping={isSnapping}
              onToggleSnapping={() => setIsSnapping(!isSnapping)}
              onUpdateClips={(updated) => updateActiveProject((p) => ({ ...p, clips: updated }))}
              onAddMediaAssetToTimeline={(asset, time) => handleAddAssetToTimeline(asset, time)}
              onUnlinkSelected={handleUnlinkSelected}
              onDeleteSelected={handleDeleteSelected}
              onSplitAtPlayhead={handleSplitAtPlayhead}
              onAddTrack={handleAddTrack}
            />
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
};
