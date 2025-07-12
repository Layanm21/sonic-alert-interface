import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Box, Sphere } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import * as THREE from "three";

interface Environment {
  id: string;
  name: string;
  reverb: number;
  damping: number;
}

interface AudioEnvironmentSimulatorProps {
  frequency: number;
  environment: Environment;
  distance: number;
  isActive: boolean;
}

// مكون الموجة الصوتية ثلاثية الأبعاد
function SoundWave({ frequency, distance, environment }: { frequency: number; distance: number; environment: Environment }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const waveGeometry = useRef<THREE.SphereGeometry>(null);

  useFrame((state) => {
    if (meshRef.current && waveGeometry.current) {
      const time = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(time * frequency / 1000) * 0.1;
      meshRef.current.scale.setScalar(scale);
      
      // تأثير البيئة على الشفافية
      const opacity = Math.max(0.1, 1 - (distance * environment.damping));
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <Sphere ref={meshRef} args={[distance, 32, 32]} position={[0, 0, 0]}>
      <meshBasicMaterial 
        color={frequency > 20000 ? "#ef4444" : frequency > 15000 ? "#f59e0b" : "#06b6d4"}
        transparent
        opacity={0.3}
        wireframe
      />
    </Sphere>
  );
}

// مكون البيئة ثلاثية الأبعاد
function EnvironmentMesh({ environment }: { environment: Environment }) {
  const roomSize = environment.id === "hall" ? 8 : environment.id === "car" ? 3 : 5;
  
  return (
    <group>
      {/* جدران البيئة */}
      <Box args={[roomSize, roomSize, roomSize]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color="#64748b" 
          transparent 
          opacity={0.1} 
          wireframe 
        />
      </Box>
      
      {/* مصدر الصوت */}
      <Sphere args={[0.1]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#ef4444" />
      </Sphere>
      
      {/* تسمية البيئة */}
      <Text
        position={[0, roomSize/2 + 1, 0]}
        fontSize={0.5}
        color="#374151"
      >
        {environment.name}
      </Text>
    </group>
  );
}

export const AudioEnvironmentSimulator = ({ 
  frequency, 
  environment, 
  distance, 
  isActive 
}: AudioEnvironmentSimulatorProps) => {
  // حساب خصائص الصوت في البيئة
  const calculateAcoustics = () => {
    const baseIntensity = 100;
    const distanceAttenuation = baseIntensity / (distance * distance);
    const environmentalEffect = distanceAttenuation * (1 - environment.damping);
    const reverberation = environment.reverb * 100;
    
    return {
      intensity: Math.max(0, environmentalEffect),
      reverb: reverberation,
      clarity: Math.max(0, 100 - (distance * 10) - (environment.damping * 50))
    };
  };

  const acoustics = calculateAcoustics();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">محاكاة البيئة: {environment.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* العرض ثلاثي الأبعاد */}
          <div className="h-64 w-full border rounded-lg overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              
              <EnvironmentMesh environment={environment} />
              
              {isActive && (
                <SoundWave 
                  frequency={frequency} 
                  distance={distance} 
                  environment={environment} 
                />
              )}
              
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>
          </div>

          {/* معلومات الأداء الصوتي */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>شدة الصوت</span>
                <span>{acoustics.intensity.toFixed(1)}%</span>
              </div>
              <Progress value={acoustics.intensity} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>الصدى</span>
                <span>{acoustics.reverb.toFixed(1)}%</span>
              </div>
              <Progress value={acoustics.reverb} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>وضوح الصوت</span>
                <span>{acoustics.clarity.toFixed(1)}%</span>
              </div>
              <Progress value={acoustics.clarity} className="h-2" />
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-medium">التردد الحالي:</span> {frequency.toFixed(0)} Hz
            </p>
            <p className="text-sm">
              <span className="font-medium">المسافة:</span> {distance} متر
            </p>
            <p className="text-sm">
              <span className="font-medium">خصائص البيئة:</span> صدى {(environment.reverb * 100).toFixed(0)}%, 
              امتصاص {(environment.damping * 100).toFixed(0)}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};