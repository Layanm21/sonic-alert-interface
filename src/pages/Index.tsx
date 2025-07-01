
import { useState, useEffect } from 'react';
import { FrequencyAnalyzer } from '@/components/FrequencyAnalyzer';
import { FrequencyMeter } from '@/components/FrequencyMeter';
import { AlertSystem } from '@/components/AlertSystem';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Mic, MicOff, Activity, Signal } from 'lucide-react';

const Index = () => {
  const {
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
  } = useAudioAnalyzer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Long-Distance Frequency Analyzer
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            Enhanced real-time audio frequency monitoring with long-distance detection capabilities
          </p>
        </div>

        {/* Control Panel */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isAnalyzing ? stopAnalysis : startAnalysis}
                variant={isAnalyzing ? "destructive" : "default"}
                size="lg"
                className={`px-8 py-3 ${
                  isAnalyzing 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Analysis
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Long-Distance Analysis
                  </>
                )}
              </Button>
              
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">LIVE</span>
                </div>
              )}
            </div>

            {/* Sensitivity Control */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Signal className="w-4 h-4 text-cyan-400" />
                  <label className="text-sm font-medium text-cyan-400">
                    Sensitivity: {sensitivity.toFixed(1)}x
                  </label>
                </div>
                <Slider
                  value={[sensitivity]}
                  onValueChange={(value) => adjustSensitivity(value[0])}
                  min={0.5}
                  max={5.0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-slate-400">
                  Increase for better long-distance detection
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <label className="text-sm font-medium text-cyan-400">
                    Audio Level: {audioLevel.toFixed(0)}
                  </label>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min((audioLevel / 100) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Signal strength indicator for distance monitoring
                </p>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-center">
              {error}
            </div>
          )}
        </Card>

        {/* Alert System */}
        <AlertSystem isHighFrequency={isHighFrequency} peakFrequency={peakFrequency} />

        {/* Main Analysis Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Frequency Spectrum Analyzer */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Enhanced Frequency Spectrum</h2>
              <FrequencyAnalyzer 
                frequencyData={frequencyData} 
                isAnalyzing={isAnalyzing}
                isHighFrequency={isHighFrequency}
              />
            </Card>
          </div>

          {/* Frequency Meter */}
          <div>
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Peak Frequency</h2>
              <FrequencyMeter 
                frequency={peakFrequency} 
                isAnalyzing={isAnalyzing}
                isHighFrequency={isHighFrequency}
              />
            </Card>
          </div>
        </div>

        {/* Enhanced Info Panel */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Threshold</h3>
              <p className="text-2xl font-bold">20 kHz</p>
              <p className="text-sm text-slate-400">Warning Level</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Current Peak</h3>
              <p className={`text-2xl font-bold ${isHighFrequency ? 'text-red-400' : 'text-green-400'}`}>
                {peakFrequency ? `${(peakFrequency / 1000).toFixed(1)} kHz` : '---'}
              </p>
              <p className="text-sm text-slate-400">Real-time</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Signal Strength</h3>
              <p className={`text-2xl font-bold ${audioLevel > 50 ? 'text-green-400' : audioLevel > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                {audioLevel > 50 ? 'STRONG' : audioLevel > 20 ? 'MEDIUM' : 'WEAK'}
              </p>
              <p className="text-sm text-slate-400">Distance Quality</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Status</h3>
              <p className={`text-2xl font-bold ${isHighFrequency ? 'text-red-400' : 'text-green-400'}`}>
                {isHighFrequency ? 'WARNING' : 'NORMAL'}
              </p>
              <p className="text-sm text-slate-400">System Status</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
