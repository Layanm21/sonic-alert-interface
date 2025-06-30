
import { useEffect, useRef } from 'react';

interface FrequencyAnalyzerProps {
  frequencyData: Uint8Array | null;
  isAnalyzing: boolean;
  isHighFrequency: boolean;
}

export const FrequencyAnalyzer = ({ frequencyData, isAnalyzing, isHighFrequency }: FrequencyAnalyzerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isAnalyzing || !frequencyData || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
      gradient.addColorStop(1, 'rgba(30, 41, 59, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 8; i++) {
        const y = (height / 8) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw frequency bars
      const barWidth = width / frequencyData.length;
      const maxFreq = 22050; // Nyquist frequency for 44.1kHz sample rate
      const threshold20kHz = (20000 / maxFreq) * frequencyData.length;

      for (let i = 0; i < frequencyData.length; i++) {
        const barHeight = (frequencyData[i] / 255) * height * 0.8;
        const x = i * barWidth;
        const y = height - barHeight;

        // Color based on frequency range
        let color;
        if (i > threshold20kHz) {
          // Above 20kHz - red warning
          color = `rgba(239, 68, 68, ${0.3 + (frequencyData[i] / 255) * 0.7})`;
        } else if (i > threshold20kHz * 0.8) {
          // Near 20kHz - orange caution
          color = `rgba(245, 158, 11, ${0.3 + (frequencyData[i] / 255) * 0.7})`;
        } else {
          // Normal range - cyan
          color = `rgba(34, 211, 238, ${0.3 + (frequencyData[i] / 255) * 0.7})`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 1, barHeight);

        // Add glow effect for high frequencies
        if (frequencyData[i] > 128) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
          ctx.shadowBlur = 0;
        }
      }

      // Draw 20kHz threshold line
      const thresholdX = (threshold20kHz / frequencyData.length) * width;
      ctx.strokeStyle = isHighFrequency ? 'rgba(239, 68, 68, 0.8)' : 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(thresholdX, 0);
      ctx.lineTo(thresholdX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw threshold label
      ctx.fillStyle = isHighFrequency ? 'rgba(239, 68, 68, 1)' : 'rgba(245, 158, 11, 1)';
      ctx.font = '12px monospace';
      ctx.fillText('20kHz', thresholdX + 5, 20);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frequencyData, isAnalyzing, isHighFrequency]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="w-full h-[300px] rounded-lg border border-slate-600"
      />
      {!isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-lg">
          <p className="text-slate-400">Start analysis to view frequency spectrum</p>
        </div>
      )}
    </div>
  );
};
