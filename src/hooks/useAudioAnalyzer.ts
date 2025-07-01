
import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudioAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [peakFrequency, setPeakFrequency] = useState<number | null>(null);
  const [isHighFrequency, setIsHighFrequency] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sensitivity, setSensitivity] = useState(1.5);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number>();

  const findPeakFrequency = useCallback((frequencies: Uint8Array, sampleRate: number) => {
    let maxAmplitude = 0;
    let peakIndex = 0;

    // Enhanced peak detection with sensitivity boost
    for (let i = 0; i < frequencies.length; i++) {
      const boostedAmplitude = frequencies[i] * sensitivity;
      if (boostedAmplitude > maxAmplitude) {
        maxAmplitude = boostedAmplitude;
        peakIndex = i;
      }
    }

    // Convert bin index to frequency with higher resolution
    const frequency = (peakIndex * sampleRate) / (2 * frequencies.length);
    return frequency;
  }, [sensitivity]);

  const analyzeFrequencies = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyserRef.current.getByteFrequencyData(dataArray);
    setFrequencyData(new Uint8Array(dataArray));

    // Calculate audio level for distance monitoring
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const avgLevel = sum / dataArray.length;
    setAudioLevel(avgLevel);

    // Enhanced peak frequency detection
    const peak = findPeakFrequency(dataArray, audioContextRef.current.sampleRate);
    setPeakFrequency(peak);

    // Check if peak frequency exceeds 20kHz with improved sensitivity
    const isHigh = peak > 20000 && avgLevel > 10; // Add minimum audio level threshold
    setIsHighFrequency(isHigh);

    animationFrameRef.current = requestAnimationFrame(analyzeFrequencies);
  }, [findPeakFrequency]);

  const adjustSensitivity = useCallback((newSensitivity: number) => {
    setSensitivity(newSensitivity);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newSensitivity;
    }
  }, []);

  const startAnalysis = useCallback(async () => {
    try {
      setError(null);
      
      // Enhanced microphone configuration for long-distance detection
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000, // Increased sample rate for better high-frequency capture
          channelCount: 1,
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          // @ts-ignore - Advanced constraints for better sensitivity
          googEchoCancellation: false,
          googAutoGainControl: false,
          googNoiseSuppression: false,
          googHighpassFilter: false,
          googTypingNoiseDetection: false,
          googBeamforming: false,
          googArrayGeometry: false,
          googAudioMirroring: false,
          googDAEchoCancellation: false,
          googNoiseReduction: false
        }
      });

      streamRef.current = stream;

      // Create enhanced audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
      
      // Create analyser with higher resolution
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 8192; // Increased for better frequency resolution
      analyserRef.current.smoothingTimeConstant = 0.3; // Reduced for more responsive detection
      analyserRef.current.minDecibels = -100; // Lower threshold for distant sounds
      analyserRef.current.maxDecibels = -10;

      // Create gain node for sensitivity control
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = sensitivity;

      // Connect audio chain: microphone -> gain -> analyser
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(analyserRef.current);

      setIsAnalyzing(true);
      analyzeFrequencies();

      console.log('Enhanced audio analysis started with improved sensitivity for long-distance detection');

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please ensure microphone permissions are granted and try using a high-quality microphone for better long-distance detection.');
    }
  }, [analyzeFrequencies, sensitivity]);

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

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setFrequencyData(null);
    setPeakFrequency(null);
    setIsHighFrequency(false);
    setAudioLevel(0);
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
    audioLevel,
    sensitivity,
    startAnalysis,
    stopAnalysis,
    adjustSensitivity,
    error
  };
};
