import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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

const roundSuggestionSchema = z.object({
  golfCourseId: z.string().min(1, "Välj en golfbana"),
  date: z.date({
    required_error: "Välj ett datum för rundan",
  }),
  time: z.string().min(1, "Välj en tid"),
  message: z.string().optional(),
  maxPlayers: z.number().min(2).max(4).default(4),
});

type RoundSuggestionForm = z.infer<typeof roundSuggestionSchema>;

interface CreateRoundSuggestionProps {
  onSuccess?: () => void;
}

export const CreateRoundSuggestion = ({ onSuccess }: CreateRoundSuggestionProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [golfCourses, setGolfCourses] = useState<Array<{ id: string; name: string; location: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCourseSearch, setShowCourseSearch] = useState(false);

  const form = useForm<RoundSuggestionForm>({
    resolver: zodResolver(roundSuggestionSchema),
    defaultValues: {
      maxPlayers: 4,
    },
  });

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

  const onSubmit = async (data: RoundSuggestionForm) => {
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      console.log('Creating round suggestion with data:', {
        user_id: user.user.id,
        golf_course_id: data.golfCourseId,
        suggested_date: format(data.date, 'yyyy-MM-dd'),
        suggested_time: data.time,
        message: data.message,
        max_players: data.maxPlayers,
      });

      const { error } = await supabase
        .from('round_suggestions')
        .insert({
          user_id: user.user.id,
          golf_course_id: data.golfCourseId,
          suggested_date: format(data.date, 'yyyy-MM-dd'),
          suggested_time: data.time,
          message: data.message,
          max_players: data.maxPlayers,
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Round suggestion created successfully');

      toast({
        title: "Rundförslag skapat!",
        description: "Dina vänner kan nu se ditt förslag och gå med.",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating round suggestion:', error);
      toast({
        title: "Fel",
        description: "Kunde inte skapa rundförslag. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const timeSlots = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-golf-premium">
          <Plus className="w-5 h-5" />
          Föreslå en runda
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              format(field.value, "PPP")
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
                  <FormItem>
                    <FormLabel>Tid</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
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
                      placeholder="Skriv något om rundan... Lägg till T.ex 18 håls banan."
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
              {isLoading ? "Skapar..." : "Skapa rundförslag"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};