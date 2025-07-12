import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Waves, 
  Headphones, 
  Home, 
  Building, 
  Car, 
  Trees, 
  Volume2,
  Zap,
  Clock,
  AlertTriangle
} from "lucide-react";
import { AudioEnvironmentSimulator } from "./AudioEnvironmentSimulator";
import { DeviceSimulator } from "./DeviceSimulator";

interface SimulationPanelProps {
  currentFrequency: number;
  isAnalyzing: boolean;
}

export const SimulationPanel = ({ currentFrequency, isAnalyzing }: SimulationPanelProps) => {
  const [selectedEnvironment, setSelectedEnvironment] = useState("room");
  const [selectedDevice, setSelectedDevice] = useState("headphones");
  const [exposureTime, setExposureTime] = useState([30]); // minutes
  const [distance, setDistance] = useState([1]); // meters

  // محاكاة التأثيرات الصوتية
  const getHealthImpact = (frequency: number, time: number) => {
    if (frequency > 20000) {
      return {
        level: "خطر عالي",
        color: "destructive",
        effects: ["فقدان سمع محتمل", "طنين الأذن", "صداع"],
        recommendation: "توقف فوراً"
      };
    } else if (frequency > 15000) {
      return {
        level: "تحذير",
        color: "secondary",
        effects: ["إرهاق سمعي", "انزعاج"],
        recommendation: "قلل وقت التعرض"
      };
    } else {
      return {
        level: "آمن",
        color: "outline",
        effects: ["لا توجد مخاطر واضحة"],
        recommendation: "آمن للاستخدام العادي"
      };
    }
  };

  const healthImpact = getHealthImpact(currentFrequency, exposureTime[0]);

  // بيئات صوتية مختلفة
  const environments = [
    { id: "room", name: "غرفة مغلقة", icon: Home, reverb: 0.3, damping: 0.7 },
    { id: "hall", name: "قاعة كبيرة", icon: Building, reverb: 0.8, damping: 0.3 },
    { id: "car", name: "داخل سيارة", icon: Car, reverb: 0.1, damping: 0.9 },
    { id: "outdoor", name: "خارجي", icon: Trees, reverb: 0.05, damping: 0.95 },
  ];

  // أجهزة صوتية مختلفة
  const devices = [
    { id: "headphones", name: "سماعة رأس", icon: Headphones, response: "مسطح" },
    { id: "speakers", name: "مكبرات صوت", icon: Volume2, response: "محسن للجهير" },
    { id: "phone", name: "هاتف محمول", icon: Zap, response: "محدود المدى" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5" />
          محاكاة التأثيرات الصوتية
        </CardTitle>
        <CardDescription>
          محاكاة تأثير الترددات في بيئات وأجهزة مختلفة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="health">التأثيرات الصحية</TabsTrigger>
            <TabsTrigger value="environment">البيئة الصوتية</TabsTrigger>
            <TabsTrigger value="devices">أجهزة الصوت</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">وقت التعرض: {exposureTime[0]} دقيقة</span>
              </div>
              <Slider
                value={exposureTime}
                onValueChange={setExposureTime}
                max={120}
                min={1}
                step={1}
                className="w-full"
              />

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">المسافة: {distance[0]} متر</span>
              </div>
              <Slider
                value={distance}
                onValueChange={setDistance}
                max={10}
                min={0.1}
                step={0.1}
                className="w-full"
              />

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">تقييم المخاطر</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Badge variant={healthImpact.color as any} className="w-full justify-center">
                      {healthImpact.level}
                    </Badge>
                    <div className="text-sm">
                      <p className="font-medium">التأثيرات المحتملة:</p>
                      <ul className="text-muted-foreground">
                        {healthImpact.effects.map((effect, i) => (
                          <li key={i}>• {effect}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">التوصية:</p>
                      <p className="text-sm text-muted-foreground">
                        {healthImpact.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="environment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {environments.map((env) => (
                <Button
                  key={env.id}
                  variant={selectedEnvironment === env.id ? "default" : "outline"}
                  onClick={() => setSelectedEnvironment(env.id)}
                  className="h-20 flex-col gap-2"
                >
                  <env.icon className="h-6 w-6" />
                  <span className="text-sm">{env.name}</span>
                </Button>
              ))}
            </div>

            <Separator />

            <AudioEnvironmentSimulator
              frequency={currentFrequency}
              environment={environments.find(e => e.id === selectedEnvironment)!}
              distance={distance[0]}
              isActive={isAnalyzing}
            />
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {devices.map((device) => (
                <Button
                  key={device.id}
                  variant={selectedDevice === device.id ? "default" : "outline"}
                  onClick={() => setSelectedDevice(device.id)}
                  className="h-20 flex-col gap-2"
                >
                  <device.icon className="h-6 w-6" />
                  <span className="text-xs">{device.name}</span>
                </Button>
              ))}
            </div>

            <Separator />

            <DeviceSimulator
              frequency={currentFrequency}
              device={devices.find(d => d.id === selectedDevice)!}
              isActive={isAnalyzing}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};