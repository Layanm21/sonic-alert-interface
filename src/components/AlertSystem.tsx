
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertSystemProps {
  isHighFrequency: boolean;
  peakFrequency: number | null;
}

export const AlertSystem = ({ isHighFrequency, peakFrequency }: AlertSystemProps) => {
  const [alertCount, setAlertCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isHighFrequency) {
      setAlertCount(prev => prev + 1);
      setIsBlinking(true);
      
      // Show toast notification
      toast({
        title: "⚠️ High Frequency Detected!",
        description: `Peak frequency: ${peakFrequency ? (peakFrequency / 1000).toFixed(1) : '?'} kHz exceeds 20 kHz threshold`,
        variant: "destructive",
      });

      // Stop blinking after 3 seconds
      const timer = setTimeout(() => setIsBlinking(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isHighFrequency, peakFrequency, toast]);

  if (!isHighFrequency && alertCount === 0) {
    return (
      <Alert className="border-green-600 bg-green-900/20">
        <Volume2 className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          System monitoring active. No high frequency alerts detected.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {isHighFrequency && (
        <Alert 
          className={`border-red-600 bg-red-900/20 ${
            isBlinking ? 'animate-pulse border-2' : ''
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300 font-semibold">
            🚨 WARNING: High frequency detected! Peak frequency of{' '}
            <span className="font-bold text-red-200">
              {peakFrequency ? (peakFrequency / 1000).toFixed(1) : '?'} kHz
            </span>{' '}
            exceeds the 20 kHz threshold.
          </AlertDescription>
        </Alert>
      )}

      {alertCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600">
          <div className="flex items-center gap-3">
            <VolumeX className="w-5 h-5 text-orange-400" />
            <div>
              <div className="font-semibold text-orange-300">Alert History</div>
              <div className="text-sm text-slate-400">
                Total high frequency alerts: {alertCount}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setAlertCount(0)}
            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};
