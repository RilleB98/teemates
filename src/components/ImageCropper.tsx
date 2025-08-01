import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, ZoomIn, ZoomOut } from "lucide-react";

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
  const [zoom, setZoom] = useState(1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!image || !isOpen) return;

    const img = new Image();
    img.onload = () => {
      setImageElement(img);
      
      // Calculate canvas size
      const maxSize = Math.min(400, window.innerWidth - 100);
      setCanvasSize({ width: maxSize, height: maxSize });
      
      // Reset zoom and offset
      setZoom(1);
      setImageOffset({ x: 0, y: 0 });
      
      // Set initial crop area to center
      const cropSize = maxSize * 0.6;
      setCropArea({
        x: (maxSize - cropSize) / 2,
        y: (maxSize - cropSize) / 2,
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

    // Calculate image dimensions with zoom
    const imgAspect = imageElement.width / imageElement.height;
    let drawWidth = canvasSize.width * zoom;
    let drawHeight = canvasSize.height * zoom;
    
    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect;
    } else {
      drawWidth = drawHeight * imgAspect;
    }

    // Calculate image position with offset
    const imgX = (canvasSize.width - drawWidth) / 2 + imageOffset.x;
    const imgY = (canvasSize.height - drawHeight) / 2 + imageOffset.y;

    // Draw image
    ctx.drawImage(imageElement, imgX, imgY, drawWidth, drawHeight);

    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);

    // Draw crop border
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);

    // Draw corner handles for better mobile interaction
    const handleSize = 20;
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
  }, [imageElement, cropArea, canvasSize, zoom, imageOffset]);

  const updatePreview = () => {
    if (!imageElement || !previewCanvasRef.current) return;

    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas.getContext('2d');
    if (!previewCtx) return;

    const previewSize = 150;
    previewCanvas.width = previewSize;
    previewCanvas.height = previewSize;

    // Calculate source coordinates on original image
    const imgAspect = imageElement.width / imageElement.height;
    let drawWidth = canvasSize.width * zoom;
    let drawHeight = canvasSize.height * zoom;
    
    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect;
    } else {
      drawWidth = drawHeight * imgAspect;
    }

    const imgX = (canvasSize.width - drawWidth) / 2 + imageOffset.x;
    const imgY = (canvasSize.height - drawHeight) / 2 + imageOffset.y;

    // Calculate crop area relative to the actual image
    const scaleX = imageElement.width / drawWidth;
    const scaleY = imageElement.height / drawHeight;
    
    const sourceX = Math.max(0, (cropArea.x - imgX) * scaleX);
    const sourceY = Math.max(0, (cropArea.y - imgY) * scaleY);
    const sourceSize = cropArea.size * Math.min(scaleX, scaleY);

    previewCtx.drawImage(
      imageElement,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, previewSize, previewSize
    );
  };

  const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getEventPosition(e);
    
    // Check if position is inside crop area
    if (pos.x >= cropArea.x && pos.x <= cropArea.x + cropArea.size &&
        pos.y >= cropArea.y && pos.y <= cropArea.y + cropArea.size) {
      setIsDragging(true);
      setDragStart({
        x: pos.x - cropArea.x,
        y: pos.y - cropArea.y
      });
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const pos = getEventPosition(e);
    
    // Calculate new position, keeping crop area within bounds
    const newX = Math.max(0, Math.min(pos.x - dragStart.x, canvasSize.width - cropArea.size));
    const newY = Math.max(0, Math.min(pos.y - dragStart.y, canvasSize.height - cropArea.size));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleCrop = () => {
    if (!imageElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate image dimensions and position
    const imgAspect = imageElement.width / imageElement.height;
    let drawWidth = canvasSize.width * zoom;
    let drawHeight = canvasSize.height * zoom;
    
    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect;
    } else {
      drawWidth = drawHeight * imgAspect;
    }

    const imgX = (canvasSize.width - drawWidth) / 2 + imageOffset.x;
    const imgY = (canvasSize.height - drawHeight) / 2 + imageOffset.y;

    // Calculate source coordinates on original image
    const scaleX = imageElement.width / drawWidth;
    const scaleY = imageElement.height / drawHeight;
    
    const sourceX = Math.max(0, (cropArea.x - imgX) * scaleX);
    const sourceY = Math.max(0, (cropArea.y - imgY) * scaleY);
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
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <DialogTitle>Beskär din profilbild</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm px-3">Zoom: {Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Dra den gröna rutan för att välja område. Använd zoom för att justera storleken.
              </p>
              <canvas
                ref={canvasRef}
                className="border border-gray-200 rounded-lg cursor-move touch-none w-full"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            
            <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
