import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Settings, X } from 'lucide-react';
import { SwipeFilters } from '@/hooks/useSwipeProfiles';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface SwipeFiltersProps {
  filters: SwipeFilters;
  onFiltersChange: (filters: SwipeFilters) => void;
}

export const SwipeFiltersComponent = ({ filters, onFiltersChange }: SwipeFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<SwipeFilters>(filters);

  const handleAgeChange = (values: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      minAge: values[0],
      maxAge: values[1]
    }));
  };

  const handleHandicapChange = (values: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      minHandicap: values[0],
      maxHandicap: values[1]
    }));
  };

  const handleGenderChange = (gender: string) => {
    setLocalFilters(prev => ({
      ...prev,
      gender: gender as 'all' | 'man' | 'kvinna'
    }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const resetFilters = () => {
    const defaultFilters: SwipeFilters = {
      minAge: 18,
      maxAge: 80,
      minHandicap: 0,
      maxHandicap: 54,
      gender: 'all'
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="mb-4">
          <Settings className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filtrera profiler</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Age Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Ålder: {localFilters.minAge} - {localFilters.maxAge} år
            </Label>
            <Slider
              value={[localFilters.minAge, localFilters.maxAge]}
              onValueChange={handleAgeChange}
              min={18}
              max={80}
              step={1}
              className="w-full"
            />
          </div>

          {/* Handicap Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Handikapp: {localFilters.minHandicap} - {localFilters.maxHandicap}
            </Label>
            <Slider
              value={[localFilters.minHandicap, localFilters.maxHandicap]}
              onValueChange={handleHandicapChange}
              min={0}
              max={54}
              step={1}
              className="w-full"
            />
          </div>

          {/* Gender Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Kön</Label>
            <Select value={localFilters.gender} onValueChange={handleGenderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla</SelectItem>
                <SelectItem value="man">Man</SelectItem>
                <SelectItem value="kvinna">Kvinna</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(localFilters.minAge > 18 || localFilters.maxAge < 80 || 
            localFilters.minHandicap > 0 || localFilters.maxHandicap < 54 || 
            localFilters.gender !== 'all') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Aktiva filter:</Label>
              <div className="flex flex-wrap gap-2">
                {localFilters.minAge > 18 || localFilters.maxAge < 80 ? (
                  <Badge variant="secondary">
                    Ålder {localFilters.minAge}-{localFilters.maxAge}
                  </Badge>
                ) : null}
                {localFilters.minHandicap > 0 || localFilters.maxHandicap < 54 ? (
                  <Badge variant="secondary">
                    HCP {localFilters.minHandicap}-{localFilters.maxHandicap}
                  </Badge>
                ) : null}
                {localFilters.gender !== 'all' ? (
                  <Badge variant="secondary">
                    {localFilters.gender === 'man' ? 'Man' : 'Kvinna'}
                  </Badge>
                ) : null}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={applyFilters} className="flex-1">
              Tillämpa filter
            </Button>
            <Button onClick={resetFilters} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Återställ
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};