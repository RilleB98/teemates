import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Globe, MapPin, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [url, setUrl] = useState('https://golf.se/golfsallskap');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [extractedData, setExtractedData] = useState<string>('');

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

  const suggestedUrls = [
    'https://golf.se/golfsallskap',
    'https://www.svenskgolf.se/klubbar/',
    'https://golfguiden.com/golfbanor/sverige/',
    'https://www.golf.se/golfbanor'
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