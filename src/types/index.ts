export interface User {
  id: string;
  email: string;
  name: string;
}

export interface StressReading {
  id: string;
  timestamp: Date;
  stressLevel: number;
  eyeImageUrl: string;
  recommendations: string[];
  analysis: {
    pupilDilation: number;
    eyeMovement: number;
    blinkRate: number;
    overallStress: number;
  };
}

export interface HistoricalData {
  readings: StressReading[];
  averageStress: number;
  trend: 'improving' | 'stable' | 'worsening';
}