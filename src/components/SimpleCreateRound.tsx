import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SimpleCreateRound = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRound = async () => {
    console.log('SimpleCreateRound: Button clicked');
    setIsLoading(true);

    try {
      console.log('SimpleCreateRound: Getting user...');
      const { data: user, error: userError } = await supabase.auth.getUser();
      console.log('SimpleCreateRound: Auth response:', { user, userError });
      console.log('SimpleCreateRound: User object:', user);
      console.log('SimpleCreateRound: User.user:', user.user);
      
      if (!user.user) {
        console.log('SimpleCreateRound: No user found, checking session...');
        const { data: session } = await supabase.auth.getSession();
        console.log('SimpleCreateRound: Session:', session);
        throw new Error("Not authenticated");
      }

      console.log('SimpleCreateRound: Creating round suggestion...');
      const roundData = {
        user_id: user.user.id,
        golf_course_id: '5a0d8fd4-e4df-458d-9d1b-c910091bf567', // Hard-coded golf course
        suggested_date: '2025-09-15',
        suggested_time: '10:00',
        message: 'Test runda',
        max_players: 4,
      };

      console.log('SimpleCreateRound: Inserting data:', roundData);

      const { data, error } = await supabase
        .from('round_suggestions')
        .insert(roundData)
        .select();

      console.log('SimpleCreateRound: Insert response:', { data, error });

      if (error) {
        console.error('SimpleCreateRound: Supabase error:', error);
        throw error;
      }

      console.log('SimpleCreateRound: Success!');
      toast({
        title: "Rundförslag skapat!",
        description: "Ditt rundförslag har skapats framgångsrikt.",
      });

    } catch (error) {
      console.error('SimpleCreateRound: Error:', error);
      toast({
        title: "Fel",
        description: `Kunde inte skapa rundförslag: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle>Test - Skapa rundförslag</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleCreateRound}
          disabled={isLoading}
          className="w-full bg-golf-green hover:bg-golf-green-light text-white"
        >
          {isLoading ? "Skapar..." : "Skapa test-rundförslag"}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Detta skapar ett test-rundförslag med hårdkodade värden för att testa funktionaliteten.
        </p>
      </CardContent>
    </Card>
  );
};