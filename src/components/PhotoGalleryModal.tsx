import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, MoreVertical, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ImageCropper } from "@/components/ImageCropper";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarUpdate
}) => {
  const [photos, setPhotos] = useState<string[]>([currentAvatar].filter(Boolean));
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setShowImageCropper(true);
    }
  };

  const handleCroppedImage = async (croppedImageBlob: Blob) => {
    if (!user?.id) return;

    setUploading(true);
    try {
      // Use user ID in the path for better organization and RLS compatibility
      const fileName = `${user.id}/avatar-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedImageBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setPhotos(prev => [publicUrl, ...prev.filter(p => p !== currentAvatar)]);
      onAvatarUpdate?.(publicUrl);
      
      toast({
        title: "Bild uppladdad",
        description: "Din profilbild har uppdaterats."
      });
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte ladda upp bilden.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setShowImageCropper(false);
    }
  };

  const setAsMainPhoto = async (photoUrl: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: photoUrl })
        .eq('user_id', user.id);

      if (error) throw error;

      // Move photo to first position
      setPhotos(prev => [photoUrl, ...prev.filter(p => p !== photoUrl)]);
      onAvatarUpdate?.(photoUrl);
      
      toast({
        title: "Huvudbild uppdaterad",
        description: "Bilden är nu din huvudprofilbild."
      });
    } catch (error: any) {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera huvudbild.",
        variant: "destructive"
      });
    }
  };

  const deletePhoto = (photoUrl: string) => {
    setPhotos(prev => prev.filter(p => p !== photoUrl));
    if (photoUrl === currentAvatar) {
      const newMain = photos.find(p => p !== photoUrl);
      if (newMain) {
        setAsMainPhoto(newMain);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Hantera dina foton</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Add Photo Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || photos.length >= 6}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors disabled:opacity-50"
              >
                <Plus className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Lägg till</span>
              </button>

              {/* Existing Photos */}
              {photos.map((photo, index) => (
                <div key={photo} className="relative group aspect-square">
                  <Avatar className="w-full h-full rounded-lg">
                    <AvatarImage src={photo} alt={`Foto ${index + 1}`} className="object-cover" />
                    <AvatarFallback className="rounded-lg">
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  
                  {index === 0 && (
                    <Badge className="absolute top-1 left-1 text-xs bg-primary">
                      Huvud
                    </Badge>
                  )}
                  
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="w-6 h-6 p-0">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {index !== 0 && (
                          <DropdownMenuItem onClick={() => setAsMainPhoto(photo)}>
                            Sätt som huvudbild
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => deletePhoto(photo)}
                          className="text-destructive"
                        >
                          Ta bort
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {photos.length}/6 foton • Första bilden visas som profilbild
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </DialogContent>
      </Dialog>

      {selectedImage && (
        <ImageCropper
          isOpen={showImageCropper}
          onClose={() => setShowImageCropper(false)}
          image={selectedImage}
          onCrop={(croppedFile) => handleCroppedImage(croppedFile)}
        />
      )}
    </>
  );
};
