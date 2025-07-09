'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, RotateCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatar: string;
  onAvatarUpdate: (newAvatar: string) => void;
  userName: string;
}

export default function AvatarUpload({ currentAvatar, onAvatarUpdate, userName }: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    
    try {
      // Simulate upload process - replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onAvatarUpdate(selectedImage);
      setIsOpen(false);
      setSelectedImage(null);
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to update avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setIsOpen(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <>
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-lg">
          <img
            src={currentAvatar}
            alt={userName}
            className="w-full h-full object-cover"
          />
        </div>
        <Button
          size="icon"
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Camera className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {!selectedImage ? (
              <>
                {/* Current Avatar Preview */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                    <img
                      src={currentAvatar}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Upload Options */}
                <div className="space-y-3">
                  {isMobile() && (
                    <Button
                      onClick={triggerCameraInput}
                      className="w-full"
                      variant="outline"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  )}
                  
                  <Button
                    onClick={triggerFileInput}
                    className="w-full"
                    variant="outline"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isMobile() ? 'Choose from Gallery' : 'Upload from Computer'}
                  </Button>
                </div>

                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            ) : (
              <>
                {/* Image Preview */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Crop Preview */}
                  <div className="flex justify-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Profile preview:</p>
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mx-auto">
                        <img
                          src={selectedImage}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveAvatar}
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Upload Guidelines */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Supported formats: JPG, PNG, GIF</p>
              <p>• Maximum file size: 5MB</p>
              <p>• Recommended: Square images work best</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}