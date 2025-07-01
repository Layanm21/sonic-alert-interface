
import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudioAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [peakFrequency, setPeakFrequency] = useState<number | null>(null);
  const [isHighFrequency, setIsHighFrequency] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  const findPeakFrequency = useCallback((frequencies: Uint8Array, sampleRate: number) => {
    let maxAmplitude = 0;
    let peakIndex = 0;

    for (let i = 0; i < frequencies.length; i++) {
      if (frequencies[i] > maxAmplitude) {
        maxAmplitude = frequencies[i];
        peakIndex = i;
      }
    }

    const frequency = (peakIndex * sampleRate) / (2 * frequencies.length);
    return frequency;
  }, []);

  const analyzeFrequencies = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyserRef.current.getByteFrequencyData(dataArray);
    setFrequencyData(new Uint8Array(dataArray));

    const peak = findPeakFrequency(dataArray, audioContextRef.current.sampleRate);
    setPeakFrequency(peak);

    const isHigh = peak > 20000;
    setIsHighFrequency(isHigh);

    animationFrameRef.current = requestAnimationFrame(analyzeFrequencies);
  }, [findPeakFrequency]);

  const startAnalysis = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      setIsAnalyzing(true);
      analyzeFrequencies();

      console.log('Audio analysis started');

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please ensure microphone permissions are granted.');
    }
  }, [analyzeFrequencies]);

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setFrequencyData(null);
    setPeakFrequency(null);
    setIsHighFrequency(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  return {
    isAnalyzing,
    frequencyData,
    peakFrequency,
    isHighFrequency,
    startAnalysis,
    stopAnalysis,
    error
  };
};
