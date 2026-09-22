// ==========================================================================
// useVideoMix — Hook para gestionar la herramienta de mezcla de videos
// ==========================================================================

import { useState, useCallback } from 'react';
import type { VideoColumn, VideoItem, Combination, VideoMixState } from '../types/videoMix';

interface UseVideoMixReturn {
  state: VideoMixState;
  addColumn: () => void;
  removeColumn: (columnId: string) => void;
  addVideoToColumn: (columnId: string, file: File) => Promise<void>;
  removeVideoFromColumn: (columnId: string, videoId: string) => void;
  generateCombinations: () => void;
}

export function useVideoMix(): UseVideoMixReturn {
  const [state, setState] = useState<VideoMixState>({
    columns: [],
    combinations: [],
    totalCombinations: 0,
    isProcessing: false,
    currentProgress: 0,
    completedCount: 0,
    totalCount: 0,
    outputFiles: new Map(),
  });

  // Calculate total combinations (cartesian product)
  const calculateTotalCombinations = useCallback((columns: VideoColumn[]): number => {
    if (columns.length === 0) return 0;
    return columns.reduce((total, column) => total * column.videos.length, 1);
  }, []);

  // Generate all combinations (cartesian product)
  const generateCombinations = useCallback(() => {
    const { columns } = state;
    if (columns.length === 0) return;

    const total = calculateTotalCombinations(columns);
    const combinations: Combination[] = [];
    
    const generate = (index: number, current: VideoItem[]) => {
      if (index === columns.length) {
        const outputName = current.map(v => v.file.name.replace(/\.[^/.]+$/, '')).join('_');
        combinations.push({
          id: `combo-${Date.now()}-${combinations.length}`,
          videos: current,
          outputName,
        });
        return;
      }
      const column = columns[index];
      for (const video of column.videos) {
        generate(index + 1, [...current, video]);
      }
    };

    generate(0, []);

    setState(prev => ({
      ...prev,
      combinations,
      totalCombinations: total,
      totalCount: total,
    }));
  }, [state.columns, calculateTotalCombinations]);

  // Add a new column
  const addColumn = useCallback(() => {
    setState(prev => ({
      ...prev,
      columns: [...prev.columns, {
        id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        videos: [],
      }],
    }));
  }, []);

  // Remove a column
  const removeColumn = useCallback((columnId: string) => {
    setState(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col.id !== columnId),
    }));
  }, []);

  // Add video to a column
  const addVideoToColumn = useCallback(async (columnId: string, file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecciona un archivo de video válido');
      return;
    }

    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = videoUrl;
    video.preload = 'metadata';
    
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Error loading video'));
    });

    const videoItem: VideoItem = {
      id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      url: videoUrl,
      duration: video.duration,
    };

    setState(prev => ({
      ...prev,
      columns: prev.columns.map(col =>
        col.id === columnId
          ? { ...col, videos: [...col.videos, videoItem] }
          : col
      ),
    }));

    if (state.combinations.length > 0) {
      generateCombinations();
    }
  }, [state.combinations, generateCombinations]);

  // Remove video from a column
  const removeVideoFromColumn = useCallback((columnId: string, videoId: string) => {
    setState(prev => ({
      ...prev,
      columns: prev.columns.map(col =>
        col.id === columnId
          ? { ...col, videos: col.videos.filter(v => v.id !== videoId) }
          : col
      ),
    }));
  }, []);

  return {
    state,
    addColumn,
    removeColumn,
    addVideoToColumn,
    removeVideoFromColumn,
    generateCombinations,
  };
}
