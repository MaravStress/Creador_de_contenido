export type OrientationMode = 'horizontal' | 'vertical';

export type ActiveTool = 'select' | 'cut' | 'split';

export type MediaType = 'video' | 'audio' | 'video-audio';

export interface MediaAsset {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  duration: number; // in seconds
  thumbnailUrl?: string;
  fileName?: string;
}

export interface TimelineClip {
  id: string;
  assetId: string;
  title: string;
  type: 'video' | 'audio';
  trackId: string; // e.g. 'V1', 'V2', 'A1', 'A2'
  startTime: number; // start position on timeline in seconds
  duration: number; // current length of clip in seconds
  inTime: number; // trim start offset within original asset
  outTime: number; // trim end offset within original asset
  mediaDuration: number; // full original asset duration
  linkedId?: string; // ID of paired video/audio clip
  isLinked?: boolean; // whether pair moves/trims synchronously
  url: string;
  color?: string; // visual accent color on timeline
}

export interface Track {
  id: string; // e.g. 'V1', 'A1'
  type: 'video' | 'audio';
  name: string;
  isMuted?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
}

export interface VideoProject {
  id: string;
  name: string;
  orientation: OrientationMode;
  fps: number;
  duration: number; // total timeline duration in seconds
  tracks: Track[];
  clips: TimelineClip[];
  mediaPool: MediaAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface ShortcutsConfig {
  shortcuts: {
    cut: string;
    select: string;
    split: string;
    toggleSnap: string;
    playPause: string;
    unlinkAudioVideo: string;
    deleteClip: string;
    rippleDelete: string;
    copy: string;
    paste: string;
    duplicate: string;
    [key: string]: string;
  };
}
