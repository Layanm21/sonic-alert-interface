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

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      const time = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(time * (frequency || 1000) / 1000) * 0.1;
      meshRef.current.scale.setScalar(scale);
      
      // تأثير البيئة على الشفافية
      const opacity = Math.max(0.1, 1 - ((distance || 1) * (environment?.damping || 0.5)));
      if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
        meshRef.current.material.opacity = opacity;
      }
    }
  });

  const waveColor = frequency > 20000 ? "#ef4444" : frequency > 15000 ? "#f59e0b" : "#06b6d4";
  const radius = Math.max(0.5, distance || 1);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial 
        color={waveColor}
        transparent={true}
        opacity={0.3}
        wireframe={true}
      />
    </mesh>
  );
}

// مكون البيئة ثلاثية الأبعاد
function EnvironmentMesh({ environment }: { environment: Environment }) {
  if (!environment) return null;
  
  const roomSize = environment.id === "hall" ? 8 : environment.id === "car" ? 3 : 5;
  
  return (
    <group>
      {/* جدران البيئة */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[roomSize, roomSize, roomSize]} />
        <meshBasicMaterial 
          color="#64748b" 
          transparent={true}
          opacity={0.1} 
          wireframe={true}
        />
      </mesh>
      
      {/* مصدر الصوت */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      
      {/* تسمية البيئة */}
      <Text
        position={[0, roomSize/2 + 1, 0]}
        fontSize={0.5}
        color="#374151"
      >
        {environment.name || ""}
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
            {environment ? (
              <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                
                <EnvironmentMesh environment={environment} />
                
                {isActive && frequency > 0 && (
                  <SoundWave 
                    frequency={frequency} 
                    distance={distance} 
                    environment={environment} 
                  />
                )}
                
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              </Canvas>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading environment...
              </div>
            )}
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