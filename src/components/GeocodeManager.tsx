import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface GeocodeStats {
  total: number;
  duplicates: number;
  processed: number;
  successful: number;
  approximate: number;
  progress_percentage?: number;
}

interface GeocodeResult {
  name: string;
  location: string;
  old_coordinates: string;
  new_coordinates: string;
  success: boolean;
  processed_count?: number;
  total_count?: number;
}

export const GeocodeManager = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<GeocodeStats | null>(null);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [duplicateCoords, setDuplicateCoords] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [currentCourse, setCurrentCourse] = useState<string>('');

  const runGeocoding = async () => {
    setIsRunning(true);
    setStats(null);
    setResults([]);
    setDuplicateCoords([]);
    setCurrentProgress(0);
    setTotalToProcess(0);
    setCurrentCourse('');

    try {
      toast.info('Startar geocoding av alla golfbanor...');
      
      // Get initial count from edge function logs or estimate
      const { data, error } = await supabase.functions.invoke('geocode-golf-courses');

      if (error) {
        throw error;
      }

      // Update progress as we get results
      if (data.results && data.results.length > 0) {
        setTotalToProcess(data.stats.processed);
        
        // Simulate progress updates based on results
        data.results.forEach((result: GeocodeResult, index: number) => {
          setTimeout(() => {
            setCurrentProgress(index + 1);
            setCurrentCourse(result.name);
          }, index * 100); // Stagger the updates
        });
      }

      if (error) {
        throw error;
      }

      setStats(data.stats);
      setResults(data.results || []);
      setDuplicateCoords(data.duplicate_coordinates || []);
      setTotalToProcess(data.stats.processed);
      setCurrentProgress(data.stats.processed);
      
      toast.success(`Geocoding klar! ${data.stats.processed} banor uppdaterade.`);
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Fel vid geocoding: ' + (error.message || 'Okänt fel'));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Golfbane-koordinater Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Denna verktyg kontrollerar alla golfbanors koordinater och uppdaterar felaktiga eller dubblerade koordinater.
          </p>
          
          <Button 
            onClick={runGeocoding} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kontrollerar koordinater...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Kontrollera alla golfbanor
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isRunning && totalToProcess > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Framsteg: {currentProgress} av {totalToProcess}</span>
                <span>{Math.round((currentProgress / totalToProcess) * 100)}%</span>
              </div>
              <Progress value={(currentProgress / totalToProcess) * 100} className="w-full" />
              {currentCourse && (
                <p className="text-sm text-muted-foreground">
                  Bearbetar: {currentCourse}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Resultat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Totalt banor</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.duplicates}</div>
                <div className="text-sm text-muted-foreground">Dubletter</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.processed}</div>
                <div className="text-sm text-muted-foreground">Bearbetade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
                <div className="text-sm text-muted-foreground">Framgångsrika</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.approximate}</div>
                <div className="text-sm text-muted-foreground">Approximativa</div>
              </div>
            </div>

            {duplicateCoords.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Dublerade koordinater som hittades:</h4>
                <div className="flex flex-wrap gap-2">
                  {duplicateCoords.map((coord, index) => (
                    <Badge key={index} variant="outline">
                      {coord}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uppdaterade banor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.location}</div>
                    <div className="text-xs">
                      <span className="text-red-600">Från: {result.old_coordinates}</span>
                      <br />
                      <span className="text-green-600">Till: {result.new_coordinates}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};