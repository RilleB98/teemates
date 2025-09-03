import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export function PremiumUpgradeModal({ isOpen, onClose, onUpgrade }: PremiumUpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Här skulle du normalt öppna App Store för köp
      // För nu stänger vi bara modalen
      onUpgrade?.();
      onClose();
    } catch (error) {
      console.error('Error during upgrade:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Obegränsat antal swipes",
    "Skapa och se spelförslag",
    "Öppna swipe-funktionen på specifika banor", 
    "Prioriterat stöd",
    "Tidiga tillgång till nya funktioner",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Uppgradera till Premium
          </DialogTitle>
          <DialogDescription>
            Lås upp alla funktioner och få den bästa upplevelsen
          </DialogDescription>
        </DialogHeader>

        <Card className="border-2 border-gradient-to-r from-yellow-400 to-orange-500">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">Premium</CardTitle>
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                Populärast
              </Badge>
            </div>
            <CardDescription className="text-2xl font-bold text-primary">
              99 kr/månad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 animate-pulse" />
                Laddar...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Skaffa Premium
              </div>
            )}
          </Button>
          
          <Button variant="ghost" onClick={onClose} className="w-full">
            Inte nu
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Betalning sker via App Store. Avsluta prenumeration när som helst.
        </p>
      </DialogContent>
    </Dialog>
  );
}