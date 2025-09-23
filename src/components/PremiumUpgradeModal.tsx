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
import { Check, Crown, Star, Zap, RefreshCw } from 'lucide-react';
import { useInAppPurchase } from '@/hooks/useInAppPurchase';


interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export function PremiumUpgradeModal({ isOpen, onClose, onUpgrade }: PremiumUpgradeModalProps) {
  const { offerings, purchasing, purchasePackage, restorePurchases, isNativeApp } = useInAppPurchase();
  
  const handleUpgrade = async () => {
    if (!isNativeApp) {
      // För webläsare, visa info om att ladda ner appen
      return;
    }

    try {
      // Använd det första tillgängliga paketet
      const firstOffering = offerings[0];
      if (firstOffering?.availablePackages?.[0]) {
        await purchasePackage(firstOffering.availablePackages[0]);
        onUpgrade?.();
        onClose();
      }
    } catch (error) {
      console.error('Error during upgrade:', error);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      onUpgrade?.();
      onClose();
    } catch (error) {
      console.error('Error during restore:', error);
    }
  };

  const features = [
    "Obegränsat antal swipes",
    "Skapa och se spelförslag",
    "Öppna swipe-funktionen på specifika banor",
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
              59 kr/månad
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
            disabled={purchasing}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
          >
            {purchasing ? (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 animate-pulse" />
                Laddar...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                {isNativeApp ? 'Skaffa Premium' : 'Ladda ner appen'}
              </div>
            )}
          </Button>
          
          {isNativeApp && (
            <Button 
              variant="outline" 
              onClick={handleRestore}
              disabled={purchasing}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Återställ köp
            </Button>
          )}
          
          <Button variant="ghost" onClick={onClose} className="w-full">
            Inte nu
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {isNativeApp 
            ? "Betalning sker via App Store. Avsluta prenumeration när som helst."
            : "Premium-funktioner kräver iOS-appen. Ladda ner från App Store."
          }
        </p>
      </DialogContent>
    </Dialog>
  );
}