import React, { useState } from 'react';
import { Camera, Upload, Eye, TrendingUp, FileImage, Zap, Activity, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserAnalyticsCards } from '@/components/UserAnalyticsCards';
import { UserAnalysisHistory } from '@/components/UserAnalysisHistory';

export function Dashboard() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [prediction, setPrediction] = useState<{
    prediction: string;
    probability: number;
    fullDetails?: any;
  } | null>(null);
  
  // Helper to determine if image is actually stressed
  const isActuallyStressed = (pred: { prediction: string; probability: number } | null) => {
    if (!pred) return false;
    return pred.prediction === 'stress' && pred.probability > 0.5;
  };

  // Transform Flask response to match frontend format
  const transformFlaskResponse = (flaskResponse: any) => {
    const stressProbability = flaskResponse.prediction?.stress_probability || 0;
    return {
      prediction: stressProbability > 0.5 ? 'stress' : 'not_stress',
      probability: stressProbability,
      fullDetails: flaskResponse // Keep full response for detailed view
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      toast.error('Please drop a valid image file');
    }
  };

  // Function to upload image to main backend and store it
  const handleImageUpload = async () => {
    if (!selectedFile || !user?.email) {
      toast.error('Please select an image first');
      return;
    }

    setUploading(true);
    
    try {
      // Create FormData for file upload to main backend
      const formData = new FormData();
      formData.append('username', user.email); // Use email as username
      formData.append('image', selectedFile);

      // Make API call to main backend for storage
      const uploadResponse = await fetch('http://localhost:5174/api/upload/eye-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || errorData.message || 'Image upload failed');
      }

      const uploadResult = await uploadResponse.json();
      
      if (uploadResult.status === "success") {
        // Store the upload result temporarily to use it for analysis submission
        localStorage.setItem('latestUploadResult', JSON.stringify(uploadResult));
        
        // After successful upload to main backend, proceed with analysis
        await handleAnalysis();
      } else {
        throw new Error(uploadResult.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Image upload failed. Please try again.');
      setUploading(false);
    }
  };
  
  // Function to submit analysis results to main backend
  const submitAnalysisResults = async (uploadResult: any, predictionResult: any) => {
    if (!user?.email || !uploadResult || !predictionResult) {
      console.error('Missing data for analysis submission');
      return;
    }

    try {
      // Determine if stress is detected based on prediction and probability
      const hasStress = predictionResult.prediction === 'stress' && predictionResult.probability > 0.5;
      
      // Get the image URL from the upload response
      const imageUrl = uploadResult.data?.imageUrl || uploadResult.imageUrl || '';
      
      // Create the analysis submission payload
      const analysisData = {
        username: user.email,
        hasStress: hasStress,
        imageUrl: imageUrl,
        confidenceLevel: predictionResult.probability
      };

      // Submit the analysis to the main backend
      const analysisResponse = await fetch('http://localhost:5174/api/analysis/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        console.error('Analysis submission error:', errorData);
        // Don't show this error to user as it's a background operation
      } else {
        const result = await analysisResponse.json();
        console.log('Analysis submitted successfully:', result);
      }
    } catch (error) {
      console.error('Analysis submission error:', error);
      // Don't show this error to user as it's a background operation
    }
  };

  // Function to analyze the image using Flask backend
  const handleAnalysis = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setPrediction(null); // Clear previous prediction
    
    // Store the upload result to use later for analysis submission
    const uploadResultData = JSON.parse(localStorage.getItem('latestUploadResult') || '{}');

    try {
      // Create FormData for file upload to Flask backend
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Make API call to Flask backend for analysis (PORT 5000)
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed. Please ensure Flask backend is running on port 5000.');
      }

      const flaskResult = await response.json();

      // Check if Flask analysis was successful
      if (!flaskResult.success) {
        throw new Error(flaskResult.error || 'Flask prediction failed');
      }

      // Transform Flask response to match frontend format
      const transformedResult = transformFlaskResponse(flaskResult);
      
      // Store prediction result
      setPrediction(transformedResult);

      // Show success message with prediction
      const stressLevel = flaskResult.prediction?.stress_level || 'Unknown';
      const stressPercentage = flaskResult.prediction?.stress_percentage || 0;
      
      if (transformedResult.prediction === 'stress') {
        toast.success(`Analysis complete! ${stressLevel} detected (${stressPercentage.toFixed(1)}% confidence)`);
      } else {
        toast.success(`Analysis complete! ${stressLevel} - You're doing well!`);
      }

      // Submit analysis results to main backend
      await submitAnalysisResults(uploadResultData, transformedResult);

      // Clear selected file
      setSelectedFile(null);
      
      // Clear stored upload result
      localStorage.removeItem('latestUploadResult');

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Main function to handle upload - this combines both upload and analysis
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setUploading(true);
    setPrediction(null); // Clear previous prediction
    
    try {
      // First upload to main backend for storage
      await handleImageUpload();
      
      // Analysis is handled within handleImageUpload for proper sequencing
    } catch (error) {
      console.error('Upload process error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload process failed. Please try again.');
      setUploading(false);
    }
  };

  // Stats are now managed by UserAnalyticsCards component

  const quickActions = [
    {
      icon: Eye,
      title: 'View Latest Results',
      description: 'Check your most recent analysis',
      href: '/results',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Explore detailed insights',
      href: '/results',
    },
    {
      icon: Activity,
      title: 'Stress Patterns',
      description: 'Understand your trends',
      href: '/results',
    },
    {
      icon: Brain,
      title: 'Wellness Tips',
      description: 'Personalized recommendations',
      href: '/results',
    },
  ];

  return (
    <div className="min-h-screen pt-28 p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, <span className="text-gradient">{user?.name}</span>!
              </h1>
              <p className="text-lg text-muted-foreground mb-1">
                Monitor your stress levels and track your wellness journey with precision
              </p>
              {user?.age && (
                <p className="text-sm text-muted-foreground/80">
                  Age: <span className="font-medium">{user.age} years</span>
                </p>
              )}
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Pro Plan
            </Badge>
          </div>
        </div>

        {/* Stats Grid - Now using the dedicated component */}
        <UserAnalyticsCards />

        <Tabs defaultValue="upload" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Upload Section */}
              <div className="lg:col-span-2">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                      <Camera className="h-6 w-6" />
                      <span>Eye Image Analysis</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                      Upload a clear, high-quality image of your eye for comprehensive stress level analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div 
                      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 relative ${
                        dragActive 
                          ? 'border-primary bg-primary/10 scale-105' 
                          : selectedFile 
                            ? 'border-primary/50 bg-primary/5' 
                            : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {selectedFile ? (
                        <div className="space-y-4">
                          <div className="w-20 h-20 rounded-2xl gradient-primary glow-primary flex items-center justify-center mx-auto">
                            <FileImage className="h-10 w-10 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-semibold">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                            <Upload className="h-10 w-10 text-primary" />
                          </div>
                          <div>
                            <p className="text-xl font-semibold">Drop your eye image here</p>
                            <p className="text-sm text-muted-foreground">
                              Or click to select from your device • Supports JPG, PNG
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>

                    <Alert>
                      <Eye className="h-4 w-4" />
                      <AlertDescription>
                        For best results, ensure good lighting and focus on the eye area. 
                        The image should be clear and well-lit without shadows.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-4">
                      <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="gradient-primary glow-primary flex-1 h-12 text-base font-medium"
                      >
                        {uploading ? (
                          <>
                            <Zap className="mr-2 h-4 w-4 animate-pulse" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Analyze Image
                          </>
                        )}
                      </Button>
                      {selectedFile && (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedFile(null)}
                          className="px-6"
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    {uploading && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Processing image...</span>
                          <span>AI Analysis in progress</span>
                        </div>
                        <Progress value={65} className="w-full h-2" />
                        <p className="text-xs text-muted-foreground text-center">
                          Our AI is analyzing pupil dilation, eye movement patterns, and stress indicators
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Prediction Results */}
                {prediction && (
                  <Card className={`glass-card mt-6 ${isActuallyStressed(prediction) ? 'border-red-500/20 bg-red-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center space-x-2 text-xl ${isActuallyStressed(prediction) ? 'text-red-600' : 'text-green-600'}`}>
                        <Brain className="h-5 w-5" />
                        <span>Analysis Results</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Main Result */}
                      <div className="flex justify-center">
                        <div className={`text-center p-6 rounded-xl w-full ${isActuallyStressed(prediction) ? 'bg-red-500/10 border-2 border-red-500/30' : 'bg-green-500/10 border-2 border-green-500/30'}`}>
                          <div className={`text-4xl font-bold mb-2 ${isActuallyStressed(prediction) ? 'text-red-600' : 'text-green-600'}`}> 
                            {isActuallyStressed(prediction) ? '⚠️ STRESS DETECTED' : '✅ NO STRESS'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {prediction.fullDetails?.prediction?.stress_level || 'Analysis Complete'}
                          </div>
                        </div>
                      </div>

                      {/* Stress Probability Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Stress Probability</span>
                          <span className={`font-bold ${isActuallyStressed(prediction) ? 'text-red-600' : 'text-green-600'}`}>
                            {(prediction.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-4 rounded-full transition-all duration-500 ${
                              isActuallyStressed(prediction) 
                                ? 'bg-gradient-to-r from-orange-500 to-red-600' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-600'
                            }`}
                            style={{ width: `${prediction.probability * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Confidence Level */}
                      {prediction.fullDetails?.prediction?.confidence && (
                        <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                          <span className="text-sm font-medium">Confidence Level</span>
                          <Badge variant={prediction.fullDetails.prediction.confidence === 'High' ? 'default' : 'secondary'}>
                            {prediction.fullDetails.prediction.confidence}
                          </Badge>
                        </div>
                      )}

                      {/* Pupil Detection Info */}
                      {prediction.fullDetails?.pupil_detection?.detected && (
                        <div className="p-4 bg-background/30 rounded-lg space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Pupil Detection</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-muted-foreground">Radius</div>
                              <div className="font-semibold">{prediction.fullDetails.pupil_detection.radius?.toFixed(1)}px</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Detection Confidence</div>
                              <div className="font-semibold">{(prediction.fullDetails.pupil_detection.confidence * 100)?.toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Model Interpretation */}
                      {prediction.fullDetails?.model_interpretation && (
                        <div className="p-4 bg-background/30 rounded-lg space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Model Analysis</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Pupil Weight</span>
                              <span className="font-semibold">{prediction.fullDetails.model_interpretation.pupil_weight_percentage?.toFixed(1)}%</span>
                            </div>
                            <Progress value={prediction.fullDetails.model_interpretation.pupil_weight_percentage} className="h-2" />
                            
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-muted-foreground">Iris Weight</span>
                              <span className="font-semibold">{prediction.fullDetails.model_interpretation.iris_weight_percentage?.toFixed(1)}%</span>
                            </div>
                            <Progress value={prediction.fullDetails.model_interpretation.iris_weight_percentage} className="h-2" />
                            
                            <div className="mt-3 p-2 bg-primary/10 rounded text-xs">
                              <strong>Dominant Indicator:</strong> {prediction.fullDetails.model_interpretation.dominant_indicator}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recommendation */}
                      <Alert className={isActuallyStressed(prediction) ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}>
                        <Brain className="h-4 w-4" />
                        <AlertDescription className="text-sm leading-relaxed">
                          {isActuallyStressed(prediction)
                            ? 'Our AI detected significant signs of stress. Consider taking a break, practicing deep breathing exercises, or doing a brief meditation session.'
                            : 'Your stress levels appear normal. Keep maintaining your wellness routine with regular breaks and healthy habits!'}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                    <CardDescription>
                      Access your most used features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quickActions.map((action, index) => (
                      <Button 
                        key={index}
                        variant="ghost" 
                        className="w-full justify-start h-auto p-4 hover:bg-primary/10"
                      >
                        <action.icon className="mr-3 h-5 w-5 text-primary" />
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-xl">Today's Insight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm leading-relaxed">
                        Your stress levels tend to peak around 2-3 PM. Consider taking a 
                        5-minute mindfulness break during this time to maintain optimal wellness.
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Personalized Tip
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  Your Analysis History
                </CardTitle>
                <CardDescription>
                  View all your previous eye image analyses and stress detection results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserAnalysisHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}