import { Clock, Calendar, Award, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mapping functions for translating database values to Swedish labels
const getPlayFrequencyLabel = (frequency: string | null): string | null => {
  if (!frequency) return null;
  
  const mappings: { [key: string]: string } = {
    'every_day': 'Varje dag',
    'several_times_week': 'Flera gånger i veckan',
    'once_week': 'En gång i veckan',
    'few_times_month': 'Några gånger i månaden',
    'rarely': 'Sällan'
  };
  
  return mappings[frequency] || frequency;
};

const getAvailabilityLabel = (availability: string | null): string | null => {
  if (!availability) return null;
  
  const mappings: { [key: string]: string } = {
    'weekdays': 'Vardagar',
    'weekends': 'Helger',
    'evenings': 'Kvällar',
    'flexible': 'Flexibel',
    'mornings': 'Morgon/förmiddag'
  };
  
  return mappings[availability] || availability;
};

interface InfoBadgesProps {
  playFrequency?: string | null;
  availability?: string | null;
  handicap?: number | null;
  homeCity?: string | null;
}

export const InfoBadges = ({ playFrequency, availability, handicap, homeCity }: InfoBadgesProps) => {
  const badges = [];

  if (playFrequency) {
    badges.push({
      icon: Clock,
      label: getPlayFrequencyLabel(playFrequency),
      variant: "secondary" as const
    });
  }

  if (availability) {
    badges.push({
      icon: Calendar,
      label: getAvailabilityLabel(availability),
      variant: "outline" as const
    });
  }

  if (handicap !== null && handicap !== undefined) {
    badges.push({
      icon: Award,
      label: `HCP ${handicap}`,
      variant: "default" as const
    });
  }

  if (homeCity) {
    badges.push({
      icon: MapPin,
      label: homeCity,
      variant: "secondary" as const
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <Badge key={index} variant={badge.variant} className="flex items-center gap-1">
          <badge.icon size={12} />
          <span className="text-xs">{badge.label}</span>
        </Badge>
      ))}
    </div>
  );
};