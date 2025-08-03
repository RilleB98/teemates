import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Globe, MapPin, CheckCircle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GolfDataParser } from "@/utils/golfDataParser";
import { Course } from "@/data/golfCourses";

interface CrawlResult {
  success: boolean;
  jobId?: string;
  status?: string;
  completed?: number;
  total?: number;
  data?: any[];
  message?: string;
}

export const GolfCrawler = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('https://golf.se/spela-golf/hitta-golfklubb');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [extractedData, setExtractedData] = useState<string>('');
  const [parsedCourses, setParsedCourses] = useState<Course[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    setCrawlResult(null);
    setExtractedData('');
    
    try {
      console.log('Starting crawl for golf courses:', url);
      setProgress(25);
      
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('crawl-golf-courses', {
        body: { url }
      });

      setProgress(75);
      
      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Framgång! ✅",
          description: data.message || "Golfbanor crawlade framgångsrikt",
          duration: 3000,
        });
        setCrawlResult(data);
        
        // Extract golf course information from the crawled data
        if (data.data && Array.isArray(data.data)) {
          const extractedInfo = data.data
            .map((page: any) => page.markdown || page.content || '')
            .join('\n\n---\n\n');
          setExtractedData(extractedInfo);
        }
        
        setProgress(100);
      } else {
        toast({
          title: "Fel",
          description: data?.error || "Misslyckades att crawla webbsida",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error crawling website:', error);
      toast({
        title: "Fel",
        description: error.message || "Misslyckades att crawla webbsida",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleParseData = () => {
    if (!extractedData.trim()) {
      toast({
        title: "Ingen data",
        description: "Crawla först en webbsida för att få data att parsa",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      console.log('Parsing crawled data...');
      const parsedClubs = GolfDataParser.parseMarkdownData(extractedData);
      const courses = GolfDataParser.convertToCourses(parsedClubs);
      
      setParsedCourses(courses);
      
      toast({
        title: "Data parsad! 🎯",
        description: `Hittade ${courses.length} golfbanor i den crawlade datan`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error parsing data:', error);
      toast({
        title: "Parsningsfel",
        description: error.message || "Misslyckades att parsa golfbanedata",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleImportCourses = async () => {
    if (parsedCourses.length === 0) {
      toast({
        title: "Ingen data att importera",
        description: "Parsa först crawlad data för att få golfbanor att importera",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsImporting(true);
    
    try {
      // Here you would typically save to database or update the golfCourses data
      // For now, we'll just download as JSON for manual import
      const coursesJson = JSON.stringify(parsedCourses, null, 2);
      const blob = new Blob([coursesJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parsed-golf-courses.json';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Golfbanor exporterade! 📥",
        description: `${parsedCourses.length} golfbanor exporterade till JSON-fil`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error importing courses:', error);
      toast({
        title: "Importfel",
        description: error.message || "Misslyckades att importera golfbanor",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const suggestedUrls = [
    'https://golf.se/spela-golf/hitta-golfklubb',
    'https://mingolf.golf.se/',
    'https://golfguiden.com/golfbanor/sverige/',
    'https://www.golfamore.com/sv/courses/sweden'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card className="backdrop-blur-sm bg-white/95 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-golf-premium">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Samla alla Sveriges golfbanor
          </CardTitle>
          <p className="text-muted-foreground">
            Din Firecrawl API-nyckel är säkert lagrad i Supabase. Välj bara en webbsida och starta crawlingen!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <form onSubmit={handleCrawl} className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="url" className="text-sm font-medium text-golf-premium">
                Webbsida att crawla
              </label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
                placeholder="https://golf.se/golfsallskap"
                required
              />
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Rekommenderade källor för svenska golfbanor:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedUrls.map((suggestedUrl, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="cursor-pointer hover:bg-golf-green-light text-xs"
                      onClick={() => setUrl(suggestedUrl)}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {new URL(suggestedUrl).hostname}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Crawlar golfbanor... {progress}%
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full hover-scale touch-manipulation"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Crawlar..." : "Starta crawling av golfbanor"}
            </Button>
          </form>

          {/* Results */}
          {crawlResult && (
            <Card className="bg-golf-green-light/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Crawl Resultat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span> {crawlResult.status || 'Completed'}
                  </div>
                  <div>
                    <span className="font-medium">Sidor:</span> {crawlResult.completed || 0}/{crawlResult.total || 0}
                  </div>
                  <div>
                    <span className="font-medium">Job ID:</span> {crawlResult.jobId || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Meddelande:</span> {crawlResult.message || 'Framgång'}
                  </div>
                </div>

                {extractedData && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Extraherad golfbanedata:</p>
                    <Textarea
                      value={extractedData}
                      onChange={(e) => setExtractedData(e.target.value)}
                      className="min-h-[200px] max-h-[400px] text-xs font-mono"
                      placeholder="Crawlad golfbanedata kommer att visas här..."
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          navigator.clipboard.writeText(extractedData);
                          toast({
                            title: "Kopierat!",
                            description: "Golfbanedata kopierad till urklipp",
                            duration: 2000,
                          });
                        }}
                      >
                        Kopiera data
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([extractedData], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'svenska-golfbanor.txt';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Ladda ner
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Data Parsing and Import Section */}
          {extractedData && (
            <Card className="bg-blue-50/50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                  <Upload className="w-5 h-5" />
                  Parsa och importera golfbanor
                </CardTitle>
                <p className="text-sm text-blue-600">
                  Konvertera crawlad data till Course-objekt som kan användas i appen
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleParseData}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Parsa crawlad data
                  </Button>
                  
                  {parsedCourses.length > 0 && (
                    <Button 
                      onClick={handleImportCourses}
                      disabled={isImporting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isImporting ? "Exporterar..." : `Exportera ${parsedCourses.length} golfbanor`}
                    </Button>
                  )}
                </div>

                {parsedCourses.length > 0 && (
                  <div className="bg-white p-4 rounded border border-blue-200">
                    <h4 className="font-medium text-blue-700 mb-2">
                      Hittade {parsedCourses.length} golfbanor:
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {parsedCourses.slice(0, 10).map((course, index) => (
                        <div key={index} className="text-xs text-gray-600 flex justify-between">
                          <span className="font-medium">{course.name}</span>
                          <span className="text-gray-500">{course.location}</span>
                        </div>
                      ))}
                      {parsedCourses.length > 10 && (
                        <div className="text-xs text-gray-500 italic">
                          ...och {parsedCourses.length - 10} fler
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="bg-accent/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-golf-premium">✅ API-nyckel konfigurerad!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Din Firecrawl API-nyckel är nu säkert lagrad i Supabase Edge Functions. 
            Så här funkar crawlingen:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Välj en webbsida från de rekommenderade källorna ovan</li>
            <li>Klicka "Starta crawling av golfbanor"</li>
            <li>Vänta medan systemet samlar in data från alla undersidor</li>
            <li>Kopiera eller ladda ner den extraherade golfbanedatan</li>
            <li>Använd datan för att uppdatera din apps golfbanedatabas</li>
          </ol>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Systemet kommer automatiskt att crawla alla undersidor och extrahera information om svenska golfbanor!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};