
interface FrequencyMeterProps {
  frequency: number | null;
  isAnalyzing: boolean;
  isHighFrequency: boolean;
}

export const FrequencyMeter = ({ frequency, isAnalyzing, isHighFrequency }: FrequencyMeterProps) => {
  const formatFrequency = (freq: number | null) => {
    if (!freq) return { value: '---', unit: 'Hz' };
    
    if (freq >= 1000) {
      return { 
        value: (freq / 1000).toFixed(1), 
        unit: 'kHz' 
      };
    }
    
    return { 
      value: freq.toFixed(0), 
      unit: 'Hz' 
    };
  };

  const { value, unit } = formatFrequency(frequency);
  
  // Calculate percentage for the arc (0-22kHz range)
  const maxFreq = 22000;
  const percentage = frequency ? Math.min((frequency / maxFreq) * 100, 100) : 0;
  const strokeDasharray = 2 * Math.PI * 80; // circumference of circle with radius 80
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Circular Frequency Meter */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(51, 65, 85, 0.5)"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={isHighFrequency ? "rgb(239, 68, 68)" : "rgb(34, 211, 238)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-200 ${isHighFrequency ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'}`}
          />
          
          {/* Warning threshold mark at 20kHz (90.9% of 22kHz) */}
          <circle
            cx="100"
            cy="20"
            r="3"
            fill="rgb(245, 158, 11)"
            className="drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]"
          />
        </svg>
        
        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-bold font-mono ${isHighFrequency ? 'text-red-400' : 'text-cyan-400'}`}>
            {value}
          </div>
          <div className={`text-lg ${isHighFrequency ? 'text-red-300' : 'text-cyan-300'}`}>
            {unit}
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="text-center p-3 rounded-lg bg-slate-700/50 border border-slate-600">
          <div className="text-sm text-slate-400 mb-1">Status</div>
          <div className={`font-semibold ${isAnalyzing ? 'text-green-400' : 'text-slate-400'}`}>
            {isAnalyzing ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-slate-700/50 border border-slate-600">
          <div className="text-sm text-slate-400 mb-1">Alert</div>
          <div className={`font-semibold ${isHighFrequency ? 'text-red-400' : 'text-green-400'}`}>
            {isHighFrequency ? 'HIGH FREQ' : 'NORMAL'}
          </div>
        </div>
      </div>

      {/* Frequency Scale */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>0 Hz</span>
          <span>10 kHz</span>
          <span>20 kHz</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 ${
              isHighFrequency 
                ? 'bg-gradient-to-r from-cyan-500 via-yellow-500 to-red-500' 
                : 'bg-gradient-to-r from-cyan-500 to-cyan-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
