import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Globe, MapPin } from "lucide-react";

interface CrawlResult {
  success: boolean;
  status?: string;
  completed?: number;
  total?: number;
  creditsUsed?: number;
  expiresAt?: string;
  data?: any[];
}

export const GolfCrawler = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('https://golf.se/golfsallskap');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [extractedData, setExtractedData] = useState<string>('');

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Fel",
        description: "Ange din Firecrawl API-nyckel",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    FirecrawlService.saveApiKey(apiKey);
    toast({
      title: "Sparad",
      description: "API-nyckel sparad lokalt",
      duration: 3000,
    });
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    setCrawlResult(null);
    setExtractedData('');
    
    try {
      const savedApiKey = FirecrawlService.getApiKey();
      if (!savedApiKey) {
        toast({
          title: "Fel",
          description: "Spara din API-nyckel först",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      console.log('Starting crawl for golf courses:', url);
      setProgress(25);
      
      const result = await FirecrawlService.crawlGolfCourses(url);
      setProgress(75);
      
      if (result.success && result.data) {
        toast({
          title: "Framgång",
          description: "Golfbanor crawlade framgångsrikt",
          duration: 3000,
        });
        setCrawlResult(result.data);
        
        // Extract golf course information from the crawled data
        if (result.data.data && Array.isArray(result.data.data)) {
          const extractedInfo = result.data.data
            .map((page: any) => page.markdown || page.content || '')
            .join('\n\n---\n\n');
          setExtractedData(extractedInfo);
        }
        
        setProgress(100);
      } else {
        toast({
          title: "Fel",
          description: result.error || "Misslyckades att crawla webbsida",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error crawling website:', error);
      toast({
        title: "Fel",
        description: "Misslyckades att crawla webbsida",
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
            <Globe className="w-6 h-6" />
            Samla alla Sveriges golfbanor
          </CardTitle>
          <p className="text-muted-foreground">
            Använd Firecrawl för att automatiskt samla in data om alla golfbanor i Sverige från webben.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key Input */}
          <div className="space-y-3">
            <label htmlFor="apiKey" className="text-sm font-medium text-golf-premium">
              Firecrawl API-nyckel
            </label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
                placeholder="fc-xxxxxxxxxxxxxxxx"
              />
              <Button onClick={handleSaveApiKey} variant="outline">
                Spara
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Få din gratis API-nyckel på{' '}
              <a 
                href="https://firecrawl.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-golf-green hover:underline"
              >
                firecrawl.dev
              </a>
            </p>
          </div>

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
                <p className="text-xs font-medium text-muted-foreground">Föreslagna källor:</p>
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
              {isLoading ? "Crawlar..." : "Starta crawling"}
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
                    <span className="font-medium">Status:</span> {crawlResult.status}
                  </div>
                  <div>
                    <span className="font-medium">Sidor:</span> {crawlResult.completed}/{crawlResult.total}
                  </div>
                  <div>
                    <span className="font-medium">Krediter:</span> {crawlResult.creditsUsed}
                  </div>
                  <div>
                    <span className="font-medium">Utgår:</span> {crawlResult.expiresAt ? new Date(crawlResult.expiresAt).toLocaleString() : 'N/A'}
                  </div>
                </div>

                {extractedData && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Extraherad data:</p>
                    <Textarea
                      value={extractedData}
                      onChange={(e) => setExtractedData(e.target.value)}
                      className="min-h-[200px] max-h-[400px] text-xs font-mono"
                      placeholder="Crawlad data kommer att visas här..."
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => navigator.clipboard.writeText(extractedData)}
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
                          a.download = 'golfbanor-sverige.txt';
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
          <h3 className="font-semibold mb-3 text-golf-premium">Så här funkar det:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Få en gratis Firecrawl API-nyckel från firecrawl.dev</li>
            <li>Ange API-nyckeln ovan och spara den</li>
            <li>Välj en webbsida som listar svenska golfbanor (eller använd en föreslagen)</li>
            <li>Klicka "Starta crawling" för att samla in data</li>
            <li>Kopiera eller ladda ner den extraherade datan</li>
            <li>Använd datan för att uppdatera golfbanornas databas</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};