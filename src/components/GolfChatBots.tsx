import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Play, Pause } from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  avatar_url: string;
  messages: string[];
}

export const GolfChatBots = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load bot data when component mounts
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('golf-chat-bots', {
        body: { action: 'get_bots' }
      });

      if (error) throw error;
      setBots(data.bots);
    } catch (error) {
      console.error('Error loading bots:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda bot-data",
        variant: "destructive",
      });
    }
  };

  const sendRandomBotMessage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('golf-chat-bots', {
        body: { action: 'send_random_message' }
      });

      if (error) throw error;

      console.log(`${data.bot} skickade: ${data.message}`);
    } catch (error) {
      console.error('Error sending bot message:', error);
      toast({
        title: "Fel",
        description: "Kunde inte skicka bot-meddelande",
        variant: "destructive",
      });
    }
  };

  const startBotActivity = () => {
    if (!isActive) {
      // Send a message immediately
      sendRandomBotMessage();
      
      // Then set up interval for random messages (every 30-90 seconds)
      const id = setInterval(() => {
        // Random delay between 30-90 seconds
        const randomDelay = 30000 + Math.random() * 60000;
        setTimeout(() => {
          sendRandomBotMessage();
        }, randomDelay);
      }, 60000); // Check every minute, but with random delays

      setIntervalId(id);
      setIsActive(true);
      
      toast({
        title: "Bottar aktiverade",
        description: "Erik och Anna kommer nu att chatta i rummet!",
      });
    }
  };

  const stopBotActivity = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsActive(false);
    
    toast({
      title: "Bottar stoppade",
      description: "Erik och Anna har slutat chatta",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Golf Chat Bottar
        </CardTitle>
        <CardDescription>
          Aktivera virtuella golfvänner som chattar i rummet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bot List */}
        <div className="space-y-2">
          {bots.map((bot) => (
            <div key={bot.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{bot.name}</p>
                <p className="text-xs text-muted-foreground">
                  {bot.messages.length} meddelanden redo
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={startBotActivity}
            disabled={isActive}
            className="flex-1"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {isActive ? 'Aktiva' : 'Starta'}
          </Button>
          
          <Button
            onClick={stopBotActivity}
            disabled={!isActive}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <Pause className="h-4 w-4 mr-2" />
            Stoppa
          </Button>
        </div>

        {/* Manual message button */}
        <Button
          onClick={sendRandomBotMessage}
          variant="secondary"
          className="w-full"
          size="sm"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Skicka slumpmässigt meddelande
        </Button>

        {isActive && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Bottar är aktiva
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};