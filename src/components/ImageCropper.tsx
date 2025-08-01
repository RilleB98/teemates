import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X } from "lucide-react";

interface ImageCropperProps {
  image: File;
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedImage: File) => void;
}

export const ImageCropper = ({ image, isOpen, onClose, onCrop }: ImageCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, size: 200 });
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });

  useEffect(() => {
    if (!image || !isOpen) return;

    const img = new Image();
    img.onload = () => {
      setImageElement(img);
      
      // Calculate canvas size to fit image while maintaining aspect ratio
      const maxSize = 400;
      let canvasWidth = img.width;
      let canvasHeight = img.height;
      
      if (img.width > maxSize || img.height > maxSize) {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvasWidth = img.width * ratio;
        canvasHeight = img.height * ratio;
      }
      
      setCanvasSize({ width: canvasWidth, height: canvasHeight });
      
      // Set initial crop area to center of image
      const cropSize = Math.min(canvasWidth, canvasHeight) * 0.6;
      setCropArea({
        x: (canvasWidth - cropSize) / 2,
        y: (canvasHeight - cropSize) / 2,
        size: cropSize
      });
    };
    
    img.src = URL.createObjectURL(image);
    
    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [image, isOpen]);

  useEffect(() => {
    if (!imageElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image scaled to fit canvas
    ctx.drawImage(imageElement, 0, 0, canvasSize.width, canvasSize.height);

    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);

    // Draw crop border
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);

    // Draw corner handles
    const handleSize = 12;
    const handles = [
      { x: cropArea.x - handleSize/2, y: cropArea.y - handleSize/2 },
      { x: cropArea.x + cropArea.size - handleSize/2, y: cropArea.y - handleSize/2 },
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.size - handleSize/2 },
      { x: cropArea.x + cropArea.size - handleSize/2, y: cropArea.y + cropArea.size - handleSize/2 }
    ];

    ctx.fillStyle = '#10b981';
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
    });

    // Update preview
    updatePreview();
  }, [imageElement, cropArea, canvasSize]);

  const updatePreview = () => {
    if (!imageElement || !previewCanvasRef.current) return;

    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas.getContext('2d');
    if (!previewCtx) return;

    const previewSize = 150;
    previewCanvas.width = previewSize;
    previewCanvas.height = previewSize;

    // Calculate source coordinates on original image
    const scaleX = imageElement.width / canvasSize.width;
    const scaleY = imageElement.height / canvasSize.height;
    
    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceSize = cropArea.size * Math.min(scaleX, scaleY);

    previewCtx.drawImage(
      imageElement,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, previewSize, previewSize
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is inside crop area
    if (x >= cropArea.x && x <= cropArea.x + cropArea.size &&
        y >= cropArea.y && y <= cropArea.y + cropArea.size) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate new position, keeping crop area within bounds
    const newX = Math.max(0, Math.min(x - cropArea.size/2, canvasSize.width - cropArea.size));
    const newY = Math.max(0, Math.min(y - cropArea.size/2, canvasSize.height - cropArea.size));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (!imageElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outputSize = 300; // Final output size
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate source coordinates on original image
    const scaleX = imageElement.width / canvasSize.width;
    const scaleY = imageElement.height / canvasSize.height;
    
    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceSize = cropArea.size * Math.min(scaleX, scaleY);

    ctx.drawImage(
      imageElement,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, outputSize, outputSize
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'cropped-avatar.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        onCrop(croppedFile);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Beskär din profilbild</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 items-start">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Dra rutan för att välja vilket område som ska beskäras
            </p>
            <canvas
              ref={canvasRef}
              className="border border-gray-200 rounded-lg cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div>
              <p className="text-sm font-medium mb-2 text-center">Förhandsvisning</p>
              <canvas
                ref={previewCanvasRef}
                className="border border-gray-200 rounded-full"
                width={150}
                height={150}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCrop} size="sm">
                <Check className="w-4 h-4 mr-2" />
                Använd
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Avbryt
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
