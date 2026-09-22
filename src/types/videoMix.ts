// ==========================================================================
// Video Mix Module — Type Definitions
// ==========================================================================

export interface VideoItem {
  id: string;
  file: File;
  url: string;
  duration: number;
  preview?: string;
}

export interface VideoColumn {
  id: string;
  videos: VideoItem[];
}

export interface Combination {
  id: string;
  videos: VideoItem[]; // One video from each column
  outputName: string;
}

export interface VideoMixState {
  columns: VideoColumn[];
  combinations: Combination[];
  totalCombinations: number;
  isProcessing: boolean;
  currentProgress: number;
  completedCount: number;
  totalCount: number;
  outputFiles: Map<string, Blob>;
}

export const DEFAULT_STATE: VideoMixState = {
  columns: [],
  combinations: [],
  totalCombinations: 0,
  isProcessing: false,
  currentProgress: 0,
  completedCount: 0,
  totalCount: 0,
  outputFiles: new Map(),
};
