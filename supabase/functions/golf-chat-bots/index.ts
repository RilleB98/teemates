import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Bot data with Swedish golf-related personalities (using proper UUIDs)
const bots = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001', // Erik's UUID
    name: 'Erik Nilsson',
    avatar_url: '/placeholder.svg',
    messages: [
      'Hej allihopa! Någon som spelar golf idag?',
      'Har ni testat den nya banan på Göteborg GK?',
      'Mitt handicap har förbättrats till 12! 🏌️‍♂️',
      'Vilken driver rekommenderar ni för längre slag?',
      'Såg precis att Tiger Woods vann igen! Inspirerande! 🐅',
      'Någon som vill spela en runda på lördag?',
      'Det regnar för mycket för golf idag... ☔',
      'Har ni några tips för putting? Jag missar för ofta...',
      'Älskar de här långa sommarkvällarna på golfbanan ☀️',
      'Precis köpt nya golfklubbor. Kan knappt vänta att testa dem!'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002', // Anna's UUID
    name: 'Anna Lindqvist',
    avatar_url: '/placeholder.svg',
    messages: [
      'God morgon golfvänner! ⛳',
      'Spelade 18 hål igår och slog personligt rekord!',
      'Någon som varit på Bro Hof Slott Golf Club?',
      'Tips: träna short game varje dag, det gör skillnad!',
      'Ser fram emot LPGA-turneringen nästa månad 🏆',
      'Har ni provat de nya Titleist bollarna?',
      'Golfbanan är perfekt idag - inte en molntuss! ☀️',
      'Precis bokat golfresan till Portugal! Så taggad! ✈️',
      'Mitt mål är att komma ner till handicap 8 i år',
      'Älskar att se soluppgången från första tee:n 🌅'
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    if (action === 'send_random_message') {
      // Select random bot and message
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      const randomMessage = randomBot.messages[Math.floor(Math.random() * randomBot.messages.length)];

      // Insert message into database using service role key (bypasses RLS)
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: randomMessage,
          user_id: randomBot.id,
          chat_room_id: 'golf-group'
        });

      if (error) {
        console.error('Error inserting bot message:', error);
        throw error;
      }

      // Also insert/update bot profile if not exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: randomBot.id,
          name: randomBot.name,
          avatar_url: randomBot.avatar_url
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.log('Note: Could not update bot profile:', profileError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          bot: randomBot.name,
          message: randomMessage 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_bots') {
      return new Response(
        JSON.stringify({ bots }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in golf-chat-bots function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});