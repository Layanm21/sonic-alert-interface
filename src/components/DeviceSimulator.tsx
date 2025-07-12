import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Volume2, 
  VolumeX, 
  Volume1, 
  Headphones,
  Smartphone,
  Speaker,
  BarChart3
} from "lucide-react";

interface Device {
  id: string;
  name: string;
  response: string;
}

interface DeviceSimulatorProps {
  frequency: number;
  device: Device;
  isActive: boolean;
}

export const DeviceSimulator = ({ frequency, device, isActive }: DeviceSimulatorProps) => {
  const [volume, setVolume] = useState([75]);
  const [bassBoost, setBassBoost] = useState([0]);
  const [trebleBoost, setTrebleBoost] = useState([0]);

  // محاكاة استجابة التردد للأجهزة المختلفة
  const getDeviceResponse = (freq: number, deviceId: string) => {
    const responses = {
      headphones: {
        low: freq < 200 ? 0.8 : 1.0,      // ضعف في الترددات المنخفضة
        mid: freq >= 200 && freq <= 8000 ? 1.0 : 0.9,
        high: freq > 8000 ? freq > 20000 ? 0.3 : 0.95 : 1.0,
        range: "20Hz - 40kHz",
        quality: "عالية"
      },
      speakers: {
        low: freq < 60 ? 0.5 : freq < 250 ? 1.2 : 1.0,  // تعزيز الجهير
        mid: freq >= 250 && freq <= 4000 ? 1.0 : 0.9,
        high: freq > 4000 ? freq > 16000 ? 0.4 : 0.8 : 1.0,
        range: "40Hz - 20kHz",
        quality: "متوسطة إلى عالية"
      },
      phone: {
        low: freq < 300 ? 0.3 : freq < 500 ? 0.7 : 1.0,
        mid: freq >= 500 && freq <= 3000 ? 1.0 : 0.8,
        high: freq > 3000 ? freq > 8000 ? 0.1 : 0.6 : 1.0,
        range: "300Hz - 8kHz",
        quality: "محدودة"
      }
    };

    return responses[deviceId as keyof typeof responses] || responses.headphones;
  };

  const deviceResponse = getDeviceResponse(frequency, device.id);

  // حساب الاستجابة الإجمالية
  const calculateTotalResponse = () => {
    let response = 1.0;
    
    if (frequency < 500) {
      response = deviceResponse.low * (1 + bassBoost[0] / 100);
    } else if (frequency <= 4000) {
      response = deviceResponse.mid;
    } else {
      response = deviceResponse.high * (1 + trebleBoost[0] / 100);
    }

    return Math.min(response * (volume[0] / 100), 1.0);
  };

  const totalResponse = calculateTotalResponse();

  // تحديد مستوى الصوت المتوقع
  const getVolumeLevel = (response: number) => {
    if (response > 0.8) return { level: "مرتفع", color: "destructive", icon: Volume2 };
    if (response > 0.5) return { level: "متوسط", color: "warning", icon: Volume1 };
    if (response > 0.1) return { level: "منخفض", color: "success", icon: Volume1 };
    return { level: "كتم", color: "secondary", icon: VolumeX };
  };

  const volumeLevel = getVolumeLevel(totalResponse);

  // رسم منحنى الاستجابة
  const FrequencyResponseChart = () => {
    const frequencies = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          منحنى الاستجابة الترددية
        </h4>
        <div className="h-24 flex items-end gap-1 bg-muted/30 rounded p-2">
          {frequencies.map((freq, index) => {
            const response = getDeviceResponse(freq, device.id);
            let height = 20;
            
            if (freq < 500) height = response.low * 80;
            else if (freq <= 4000) height = response.mid * 80;
            else height = response.high * 80;

            const isCurrentFreq = Math.abs(frequency - freq) < 1000;
            
            return (
              <div key={freq} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    isCurrentFreq 
                      ? "bg-primary" 
                      : totalResponse > 0.7 
                        ? "bg-destructive/70" 
                        : "bg-muted-foreground/50"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs mt-1 rotate-45 origin-left">
                  {freq >= 1000 ? `${freq/1000}k` : freq}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {device.id === 'headphones' && <Headphones className="h-5 w-5" />}
            {device.id === 'speakers' && <Speaker className="h-5 w-5" />}
            {device.id === 'phone' && <Smartphone className="h-5 w-5" />}
            محاكاة الجهاز: {device.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* إعدادات الصوت */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">مستوى الصوت: {volume[0]}%</label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                min={0}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تعزيز الجهير: {bassBoost[0]}%</label>
              <Slider
                value={bassBoost}
                onValueChange={setBassBoost}
                max={50}
                min={-20}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تعزيز الحاد: {trebleBoost[0]}%</label>
              <Slider
                value={trebleBoost}
                onValueChange={setTrebleBoost}
                max={50}
                min={-20}
                step={1}
              />
            </div>
          </div>

          {/* حالة الإخراج الحالية */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <volumeLevel.icon className="h-5 w-5" />
                <span className="font-medium">الإخراج المتوقع</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">شدة الإخراج</span>
                  <Badge variant={volumeLevel.color as any}>
                    {volumeLevel.level}
                  </Badge>
                </div>
                <Progress value={totalResponse * 100} className="h-3" />
              </div>

              <div className="text-sm space-y-1">
                <p><span className="font-medium">النطاق الترددي:</span> {deviceResponse.range}</p>
                <p><span className="font-medium">جودة الصوت:</span> {deviceResponse.quality}</p>
                <p><span className="font-medium">التردد الحالي:</span> {frequency.toFixed(0)} Hz</p>
              </div>
            </div>

            <div className="space-y-3">
              <FrequencyResponseChart />
            </div>
          </div>

          {/* تحذيرات وتوصيات */}
          {isActive && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="space-y-2">
                {frequency > 20000 && (
                  <Badge variant="destructive" className="w-full justify-center">
                    تحذير: تردد عالي جداً - قد لا يكون مسموعاً
                  </Badge>
                )}
                
                {totalResponse < 0.3 && frequency > 100 && (
                  <Badge variant="secondary" className="w-full justify-center">
                    ضعف في الاستجابة - قد يكون الصوت خافتاً
                  </Badge>
                )}

                {device.id === 'phone' && frequency > 8000 && (
                  <p className="text-sm text-muted-foreground">
                    💡 الهواتف المحمولة محدودة في الترددات العالية
                  </p>
                )}

                {device.id === 'headphones' && volume[0] > 80 && (
                  <p className="text-sm text-muted-foreground">
                    ⚠️ تجنب الاستماع بصوت عالي لفترات طويلة
                  </p>
                )}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};