import React, { useState, useRef, useEffect } from 'react';
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

interface UserPhoto {
  id: string;
  url: string;
  isMain: boolean;
  displayOrder: number;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarUpdate
}) => {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load photos when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      loadUserPhotos();
    }
  }, [isOpen, user?.id]);

  const loadUserPhotos = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_photos')
        .select('id, photo_url, is_main_photo, display_order')
        .eq('user_id', user.id)
        .order('is_main_photo', { ascending: false })
        .order('display_order');

      if (error) throw error;

      const formattedPhotos: UserPhoto[] = data.map(photo => ({
        id: photo.id,
        url: photo.photo_url,
        isMain: photo.is_main_photo,
        displayOrder: photo.display_order
      }));

      setPhotos(formattedPhotos);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: "Kunde inte ladda foton.",
        variant: "destructive"
      });
    }
  };

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
      const fileName = `${user.id}/photo-${Date.now()}.jpg`;
      
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

      // Determine if this should be the main photo (if it's the first photo)
      const isFirstPhoto = photos.length === 0;
      const displayOrder = photos.length;

      // Insert into user_photos table
      const { data: photoData, error: insertError } = await supabase
        .from('user_photos')
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          is_main_photo: isFirstPhoto,
          display_order: displayOrder
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // If this is the first photo, update the profile avatar_url
      if (isFirstPhoto) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        onAvatarUpdate?.(publicUrl);
      }

      // Update local state
      const newPhoto: UserPhoto = {
        id: photoData.id,
        url: publicUrl,
        isMain: isFirstPhoto,
        displayOrder
      };

      setPhotos(prev => [...prev, newPhoto]);
      
      toast({
        title: "Bild uppladdad",
        description: isFirstPhoto ? "Din profilbild har uppdaterats." : "Bilden har lagts till i ditt galleri."
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

  const setAsMainPhoto = async (photo: UserPhoto) => {
    if (!user?.id) return;

    try {
      // Update all photos to not be main
      await supabase
        .from('user_photos')
        .update({ is_main_photo: false })
        .eq('user_id', user.id);

      // Set the selected photo as main
      await supabase
        .from('user_photos')
        .update({ is_main_photo: true })
        .eq('id', photo.id);

      // Update the profile avatar_url
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: photo.url })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setPhotos(prev => prev.map(p => ({
        ...p,
        isMain: p.id === photo.id
      })));

      onAvatarUpdate?.(photo.url);
      
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

  const deletePhoto = async (photo: UserPhoto) => {
    if (!user?.id) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from('user_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      // Delete from storage
      const fileName = photo.url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${fileName}`]);
      }

      // Update local state
      const updatedPhotos = photos.filter(p => p.id !== photo.id);
      setPhotos(updatedPhotos);

      // If we deleted the main photo, set the first remaining photo as main
      if (photo.isMain && updatedPhotos.length > 0) {
        await setAsMainPhoto(updatedPhotos[0]);
      } else if (photo.isMain && updatedPhotos.length === 0) {
        // No photos left, clear avatar
        await supabase
          .from('profiles')
          .update({ avatar_url: null })
          .eq('user_id', user.id);
        onAvatarUpdate?.('');
      }

      toast({
        title: "Bild borttagen",
        description: "Bilden har tagits bort från ditt galleri."
      });
    } catch (error: any) {
      toast({
        title: "Fel",
        description: "Kunde inte ta bort bilden.",
        variant: "destructive"
      });
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
                <div key={photo.id} className="relative group aspect-square">
                  <Avatar className="w-full h-full rounded-lg">
                    <AvatarImage src={photo.url} alt={`Foto ${index + 1}`} className="object-cover" />
                    <AvatarFallback className="rounded-lg">
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  
                  {photo.isMain && (
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
                        {!photo.isMain && (
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
