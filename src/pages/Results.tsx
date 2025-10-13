import { useState } from 'react';
import { Calendar, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Eye, Brain, Activity, Target, Award, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

export function Results() {
  // We'll keep the state but mark it with underscore to indicate it's intentionally unused for now
  const [_selectedPeriod, _setSelectedPeriod] = useState('7d');

  const currentReading = {
    stressLevel: 3.2,
    timestamp: new Date(),
    analysis: {
      pupilDilation: 6.5,
      eyeMovement: 4.2,
      blinkRate: 7.8,
      overallStress: 3.2,
    },
    recommendations: [
      'Take a 5-minute mindfulness break to reset your nervous system',
      'Practice the 4-7-8 breathing technique for immediate stress relief',
      'Reduce screen exposure for the next 30 minutes to rest your eyes',
      'Consider a brief walk outdoors to boost natural mood regulators',
      'Stay hydrated - dehydration can amplify stress responses',
    ],
  };

  const historicalData = [
    { date: 'Jan 1', stress: 4.2, mood: 6.5, energy: 7.2 },
    { date: 'Jan 2', stress: 3.8, mood: 7.0, energy: 7.8 },
    { date: 'Jan 3', stress: 5.1, mood: 5.8, energy: 6.2 },
    { date: 'Jan 4', stress: 2.9, mood: 8.2, energy: 8.5 },
    { date: 'Jan 5', stress: 3.5, mood: 7.5, energy: 7.9 },
    { date: 'Jan 6', stress: 4.0, mood: 6.8, energy: 7.1 },
    { date: 'Jan 7', stress: 3.2, mood: 7.8, energy: 8.0 },
  ];

  const weeklyBreakdown = [
    { day: 'Mon', stress: 4.2, scans: 3, recovery: 85 },
    { day: 'Tue', stress: 3.8, scans: 2, recovery: 78 },
    { day: 'Wed', stress: 5.1, scans: 4, recovery: 65 },
    { day: 'Thu', stress: 2.9, scans: 2, recovery: 92 },
    { day: 'Fri', stress: 3.5, scans: 3, recovery: 80 },
    { day: 'Sat', stress: 4.0, scans: 1, recovery: 75 },
    { day: 'Sun', stress: 3.2, scans: 2, recovery: 88 },
  ];

  const getStressColor = (level: number) => {
    if (level <= 3) return 'text-green-400';
    if (level <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStressLevel = (level: number) => {
    if (level <= 3) return 'Low';
    if (level <= 6) return 'Moderate';
    return 'High';
  };

  const getStressBadgeVariant = (level: number) => {
    if (level <= 3) return 'default';
    if (level <= 6) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="min-h-screen pt-28 p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gradient">Stress Analysis</span> Results
              </h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive insights into your stress patterns and wellness metrics
              </p>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              Last 7 days
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="current" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-8">
            {/* Current Reading */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                      <Eye className="h-6 w-6" />
                      <span>Latest Analysis</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                      {currentReading.timestamp.toLocaleString()} • Analysis ID: #EG-2024-001
                    </CardDescription>
                  </div>
                  <Badge variant={getStressBadgeVariant(currentReading.stressLevel)} className="px-4 py-2 text-sm">
                    {getStressLevel(currentReading.stressLevel)} Stress
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Stress Level Display */}
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className={`text-8xl font-bold ${getStressColor(currentReading.stressLevel)} mb-4`}>
                        {currentReading.stressLevel}
                      </div>
                      <div className="text-xl text-muted-foreground mb-6">
                        Stress Level (out of 10)
                      </div>
                      <Progress 
                        value={currentReading.stressLevel * 10} 
                        className="w-full h-4 mb-4"
                      />
                      <p className="text-sm text-muted-foreground">
                        Your stress level is currently in the {getStressLevel(currentReading.stressLevel).toLowerCase()} range
                      </p>
                    </div>
                  </div>

                  {/* Analysis Metrics */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold mb-6">Detailed Analysis</h3>
                    <div className="space-y-6">
                      {[
                        { 
                          label: 'Pupil Dilation', 
                          value: currentReading.analysis.pupilDilation, 
                          icon: Eye,
                          description: 'Measures autonomic nervous system response'
                        },
                        { 
                          label: 'Eye Movement', 
                          value: currentReading.analysis.eyeMovement, 
                          icon: Activity,
                          description: 'Tracks micro-movements and fixation patterns'
                        },
                        { 
                          label: 'Blink Rate', 
                          value: currentReading.analysis.blinkRate, 
                          icon: Brain,
                          description: 'Indicates cognitive load and stress levels'
                        },
                      ].map((metric, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <metric.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <span className="font-medium">{metric.label}</span>
                                <p className="text-xs text-muted-foreground">{metric.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold">{metric.value}</span>
                              <div className="text-xs text-muted-foreground">out of 10</div>
                            </div>
                          </div>
                          <Progress value={metric.value * 10} className="w-full h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Target className="h-6 w-6" />
                  <span>Personalized Recommendations</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Evidence-based actions to help optimize your current stress level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {currentReading.recommendations.map((rec, index) => (
                    <Alert key={index} className="border-primary/20 bg-primary/5">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <AlertDescription className="text-base ml-2">
                        {rec}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
                <div className="mt-6 flex gap-4">
                  <Button className="gradient-primary glow-primary">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Guided Session
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-8">
            {/* Stress Trend Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <TrendingDown className="h-6 w-6" />
                  <span>Stress Level Trends</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Your stress patterns and recovery metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fill="url(#stressGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Breakdown */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-xl">Daily Stress Levels</CardTitle>
                  <CardDescription>Average stress by day of week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="stress" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-xl">Recovery Patterns</CardTitle>
                  <CardDescription>Stress recovery efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="recovery" 
                          stroke="hsl(var(--accent))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            {/* Insights Cards */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="glass-card border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-xl text-green-400">
                    <TrendingDown className="h-5 w-5" />
                    <span>Positive Trends</span>
                  </CardTitle>
                  <CardDescription>Areas where you're making great progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { text: '15% reduction in average stress levels this week', icon: TrendingDown },
                    { text: 'Improved sleep quality detected in recent analyses', icon: Brain },
                    { text: 'Faster stress recovery after implementing breaks', icon: Activity },
                    { text: 'More consistent daily wellness patterns', icon: Target },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-xl text-yellow-400">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Areas for Improvement</span>
                  </CardTitle>
                  <CardDescription>Opportunities to optimize your wellness</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { text: 'Stress peaks typically occur around 2-3 PM daily', icon: Clock },
                    { text: 'Consider more frequent micro-breaks during work', icon: Target },
                    { text: 'Weekend stress levels could be further optimized', icon: Calendar },
                    { text: 'Hydration levels may impact stress responses', icon: Activity },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-yellow-400" />
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Wellness Score */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Award className="h-6 w-6" />
                  <span>Overall Wellness Score</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Comprehensive assessment based on stress patterns, recovery rates, and improvement trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-bold text-primary">78</div>
                    <div className="text-lg text-muted-foreground">Wellness Score</div>
                    <Badge variant="secondary" className="px-4 py-2">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Excellent Progress
                    </Badge>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <Progress value={78} className="h-6 mb-3" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Needs Work</span>
                        <span>Good</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Stress Management</span>
                        <span className="text-sm font-medium">82%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Recovery Rate</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Consistency</span>
                        <span className="text-sm font-medium">79%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Alert className="mt-6 border-primary/20 bg-primary/5">
                  <Award className="h-4 w-4" />
                  <AlertDescription>
                    Outstanding progress! You're in the top 25% of users with similar profiles. 
                    Your consistent approach to stress management is paying off with measurable improvements 
                    in your overall wellness metrics.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}