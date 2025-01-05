import WaveSurfer from 'wavesurfer.js';

declare module 'wavesurfer.js' {
  export interface WaveSurferOptions {
    responsive?: boolean;
  }
} 