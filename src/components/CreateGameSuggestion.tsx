import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const gameSuggestionSchema = z.object({
  golfCourseId: z.string().min(1, "Välj en golfbana"),
  date: z.date({
    required_error: "Välj ett datum för spelet",
  }),
  time: z.string().min(1, "Välj en tid"),
  message: z.string().optional(),
  maxPlayers: z.number().min(2).max(4).default(4),
});

type GameSuggestionForm = z.infer<typeof gameSuggestionSchema>;

interface CreateGameSuggestionProps {
  onSuccess?: () => void;
  initialData?: {
    course: string;
    date: Date;
    time: string;
    maxPlayers: number;
    message: string;
  };
  suggestionId?: string; // If provided, we're editing
}

export const CreateGameSuggestion = ({ onSuccess, initialData, suggestionId }: CreateGameSuggestionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [golfCourses, setGolfCourses] = useState<Array<{ id: string; name: string; location: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const isEditMode = !!suggestionId;

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Logga in krävs",
        description: "Du måste logga in för att skapa spelförslag.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, navigate, toast]);

  console.log('CreateGameSuggestion initialData:', initialData);
  console.log('CreateGameSuggestion isEditMode:', isEditMode);

  const form = useForm<GameSuggestionForm>({
    resolver: zodResolver(gameSuggestionSchema),
    defaultValues: {
      golfCourseId: initialData?.course || "",
      date: initialData?.date || undefined,
      time: initialData?.time || "",
      maxPlayers: initialData?.maxPlayers || 4,
      message: initialData?.message || "",
    },
  });

  // Load initial golf course data for edit mode
  useEffect(() => {
    if (isEditMode && initialData?.course) {
      const loadInitialCourse = async () => {
        try {
          const { data, error } = await supabase
            .from('golf_courses')
            .select('id, name, location')
            .eq('id', initialData.course)
            .single();

          if (error) throw error;
          if (data) {
            setSearchTerm(`${data.name} - ${data.location}`);
          }
        } catch (error) {
          console.error('Error loading initial course:', error);
        }
      };
      loadInitialCourse();
    }
  }, [isEditMode, initialData?.course]);

  // Search golf courses
  const searchCourses = async (search: string) => {
    if (!search.trim()) {
      setGolfCourses([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('id, name, location')
        .ilike('name', `%${search}%`)
        .limit(10);

      if (error) throw error;
      setGolfCourses(data || []);
    } catch (error) {
      console.error('Error searching courses:', error);
    }
  };

  const onSubmit = async (data: GameSuggestionForm) => {
    setIsLoading(true);
    try {
      console.log('Form data submitted:', data);

      // Validate required fields
      if (!data.golfCourseId) {
        throw new Error("Golf course is required");
      }
      if (!data.date) {
        throw new Error("Date is required");
      }
      if (!data.time) {
        throw new Error("Time is required");
      }
      
      // Check authentication before proceeding
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Autentiseringsfel: ${authError.message}`);
      }
      
      if (!authData.user) {
        console.error('User not authenticated');
        throw new Error("Du måste logga in för att skapa spelförslag. Gå till inloggningssidan och logga in först.");
      }

      const suggestionData = {
        golf_course_id: data.golfCourseId,
        suggested_date: format(data.date, 'yyyy-MM-dd'),
        suggested_time: data.time,
        message: data.message || null,
        max_players: data.maxPlayers,
      };

      if (isEditMode && suggestionId) {
        // Update existing suggestion
        console.log('Updating game suggestion with data:', suggestionData);
        
        const { error } = await supabase
          .from('round_suggestions')
          .update(suggestionData)
          .eq('id', suggestionId)
          .eq('user_id', authData.user.id); // Ensure user can only edit their own suggestions

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Round suggestion updated successfully');

        toast({
          title: "Spelförslag uppdaterat!",
          description: "Ditt spelförslag har uppdaterats.",
        });
      } else {
        // Create new suggestion with group chat
        console.log('Creating game suggestion with data:', {
          user_id: authData.user.id,
          ...suggestionData
        });

        // Get golf course name for chat name
        const { data: courseData } = await supabase
          .from('golf_courses')
          .select('name')
          .eq('id', data.golfCourseId)
          .single();

        const courseName = courseData?.name || 'Okänd bana';
        const chatName = `${courseName} ${format(data.date, 'd MMM', { locale: sv })} kl ${data.time}`;

        console.log('About to create group chat with name:', chatName);
        console.log('User ID:', authData.user.id);

        // Create group chat first - fixed RLS policy
        const { data: groupChat, error: chatError } = await supabase
          .from('group_chats')
          .insert({
            name: chatName,
            created_by: authData.user.id
          })
          .select()
          .single();

        if (chatError) {
          console.error('Group chat creation failed:', chatError);
          throw chatError;
        }

        console.log('Group chat created successfully:', groupChat);

        // Add creator as first member of the group chat
        console.log('About to add creator as member, group_chat_id:', groupChat.id);
        const { data: memberData, error: memberError } = await supabase
          .from('group_chat_members')
          .insert({
            group_chat_id: groupChat.id,
            user_id: authData.user.id,
            added_by: authData.user.id
          })
          .select();

        if (memberError) {
          console.error('Member addition failed:', memberError);
          throw memberError;
        }

        console.log('Member added successfully:', memberData);

        // Create round suggestion with group chat reference
        console.log('About to create round suggestion');
        const { error } = await supabase
          .from('round_suggestions')
          .insert({
            user_id: authData.user.id,
            group_chat_id: groupChat.id,
            ...suggestionData
          });

        if (error) {
          console.error('Round suggestion creation failed:', error);
          throw error;
        }

        console.log('Round suggestion and group chat created successfully');

        toast({
          title: "Spelförslag skapat!",
          description: "Dina vänner kan nu se ditt förslag och gå med i gruppchatten.",
        });

        form.reset();
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error with round suggestion:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      toast({
        title: "Fel",
        description: `Kunde inte ${isEditMode ? 'uppdatera' : 'skapa'} spelförslag. Försök igen.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const timeSlots = [
    "05:00-05:30", "05:30-06:00", "06:00-06:30", "06:30-07:00", 
    "07:00-07:30", "07:30-08:00", "08:00-08:30", "08:30-09:00",
    "09:00-09:30", "09:30-10:00", "10:00-10:30", "10:30-11:00",
    "11:00-11:30", "11:30-12:00", "12:00-12:30", "12:30-13:00",
    "13:00-13:30", "13:30-14:00", "14:00-14:30", "14:30-15:00",
    "15:00-15:30", "15:30-16:00", "16:00-16:30", "16:30-17:00",
    "17:00-17:30", "17:30-18:00", "18:00-18:30", "18:30-19:00",
    "19:00-19:30", "19:30-20:00", "20:00-20:30", "20:30-21:00",
    "21:00-21:30", "21:30-22:00"
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-golf-premium">
          <Plus className="w-5 h-5" />
          {isEditMode ? 'Redigera spelförslag' : 'Föreslå en runda'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Golf Course Search */}
            <FormField
              control={form.control}
              name="golfCourseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Golfbana</FormLabel>
                  <div className="relative">
                    <Input
                      placeholder="Sök efter golfbana..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        searchCourses(e.target.value);
                        setShowCourseSearch(true);
                      }}
                      onFocus={() => setShowCourseSearch(true)}
                    />
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    
                    {showCourseSearch && golfCourses.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
                        <CardContent className="p-2">
                          {golfCourses.map((course) => (
                            <Button
                              key={course.id}
                              variant="ghost"
                              className="w-full justify-start text-left h-auto p-2"
                              onClick={() => {
                                field.onChange(course.id);
                                setSearchTerm(`${course.name} - ${course.location}`);
                                setShowCourseSearch(false);
                              }}
                            >
                              <div>
                                <div className="font-medium">{course.name}</div>
                                <div className="text-sm text-muted-foreground">{course.location}</div>
                              </div>
                            </Button>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time Selection - Same Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Datum</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: sv })
                            ) : (
                              <span>Välj datum</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={sv}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tid</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                         <SelectTrigger className="h-10">
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Välj tid" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Max Players */}
            <FormField
              control={form.control}
              name="maxPlayers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max antal spelare</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj antal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2">2 spelare</SelectItem>
                      <SelectItem value="3">3 spelare</SelectItem>
                      <SelectItem value="4">4 spelare</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meddelande (valfritt)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Skriv något om rundan... T.ex 18 håls banan."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-golf-green hover:bg-golf-green-light text-white"
            >
              {isLoading ? (isEditMode ? "Uppdaterar..." : "Skapar...") : (isEditMode ? "Uppdatera spelförslag" : "Skapa spelförslag")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};