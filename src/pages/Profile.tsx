import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Clock,
  LogIn,
  Monitor,
  Save,
  Loader2,
  Camera,
  Trash2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useVault } from '@/contexts/VaultContext';
import { apiUpdateProfile, apiUploadAvatar, apiDeleteAvatar } from '@/lib/api';
import { toast } from 'sonner';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

// duplicate import removed

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { stats } = useVault();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  // Cropping states
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB is standard for avatars)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Avatar image must be smaller than 5MB.'
      });
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file (PNG, JPG, WebP, GIF).'
      });
      return;
    }

    // Prepare cropping
    const src = URL.createObjectURL(file);
    setImageSrc(src);
    setFileToUpload(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropDialogOpen(true);
  };

  const handleDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    const toastId = toast.loading('Removing profile picture...');
    try {
      await apiDeleteAvatar();
      updateUser({
        avatar: null,
        avatarPublicId: null
      });
      toast.success('Profile picture removed successfully', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove profile picture', { id: toastId });
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  // Helper to create Image object
  const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); // needed for CORS
      image.src = url;
    });
  };

  // Crop the image and return a Blob
  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob);
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    if (!fileToUpload || !croppedAreaPixels) return;
    setIsUploading(true);
    const toastId = toast.loading('Uploading profile picture...');
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], fileToUpload.name, { type: fileToUpload.type });
      const updatedUser = await apiUploadAvatar(croppedFile);
      updateUser({ avatar: updatedUser.avatar, avatarPublicId: updatedUser.avatarPublicId });
      toast.success('Profile picture updated successfully', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload cropped picture', { id: toastId });
    } finally {
      setIsUploading(false);
      setCropDialogOpen(false);
      setImageSrc('');
      setFileToUpload(null);
    }
  };
  const [loginDetails, setLoginDetails] = useState({
    lastLogin: null as string | null,
    loginCount: 0,
    currentSessionStart: null as string | null,
    deviceInfo: {} as Record<string, string>,
  });

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }

    // Load login details from localStorage
    loadLoginDetails();
  }, [user?.name]);

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser';
  };

  const loadLoginDetails = () => {
    const storedLastLogin = localStorage.getItem('lastLogin');
    const storedLoginCount = parseInt(localStorage.getItem('loginCount') || '0');
    const currentSessionStart = localStorage.getItem('currentSessionStart');

    // Get device/browser info
    const deviceInfo = {
      browser: getBrowserName(),
      platform: navigator.platform,
      userAgent: navigator.userAgent.split(' ')[0], // First part of UA
    };

    // Check if this is a new session (no current session start time)
    const now = new Date().toISOString();
    let loginCount = storedLoginCount;
    let lastLogin = storedLastLogin;

    if (!currentSessionStart) {
      // New session - increment login count
      loginCount += 1;
      lastLogin = now;

      // Store updated values
      localStorage.setItem('lastLogin', now);
      localStorage.setItem('loginCount', loginCount.toString());
      localStorage.setItem('currentSessionStart', now);
    } else {
      // Existing session - use stored values
      lastLogin = currentSessionStart; // For display, use when session started
    }

    setLoginDetails({
      lastLogin,
      loginCount,
      currentSessionStart: currentSessionStart || now,
      deviceInfo,
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatLoginTime = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = parseISO(dateString);
    let formattedDate = '';

    if (isToday(date)) {
      formattedDate = `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      formattedDate = `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      formattedDate = format(date, 'MMM d, yyyy h:mm a');
    }

    return `${formattedDate} (${formatDistanceToNow(date, { addSuffix: true })})`;
  };

  const getSessionDuration = () => {
    const start = loginDetails.currentSessionStart;
    if (!start) return 'N/A';

    const startTime = new Date(start).getTime();
    const now = Date.now();
    const durationMs = now - startTime;

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await apiUpdateProfile({ name: name.trim() });
      updateUser({ name: updatedUser.name });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const storagePercent = (stats.used / stats.limit) * 100;

  return (
    <div className="min-h-screen bg-vault-surface">
      <Header />

      <main className="pt-24 pb-12 container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-2xl font-bold">Profile</h1>

          {/* Avatar & Basic Info */}
          <div className="vault-card p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-border shadow-inner group">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-3xl font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  {/* Hover Overlay Trigger */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-white gap-1"
                  >
                    <Camera className="w-5 h-5 text-white animate-pulse" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Change</span>
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isUploading || isDeletingAvatar}
                    />
                  </label>

                  {/* Cropping Dialog */}
                  <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
                    <DialogContent className="w-[400px] h-[400px] sm:w-[500px] sm:h-[500px]">
                      <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                      </DialogHeader>
                      <div className="relative w-full h-[300px] sm:h-[400px]">
                        <Cropper
                          image={imageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                        />
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => setCropDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCropSave}>
                          Save
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {isUploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  )}
                </div>

                {user?.avatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 px-2 rounded-md active:scale-95 transition-transform"
                    onClick={handleDeleteAvatar}
                    disabled={isUploading || isDeletingAvatar}
                  >
                    {isDeletingAvatar ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-3 h-3 mr-1" />
                    )}
                    Remove
                  </Button>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                  {user?.isGuest && (
                    <Badge variant="secondary">Guest Account</Badge>
                  )}
                </div>

                <p className="text-muted-foreground mb-2">{user?.email}</p>

                {/* Current Session Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Current session: {getSessionDuration()}</span>
                  </div>
                  {loginDetails.lastLogin && (
                    <div className="flex items-center gap-1">
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Total logins: {loginDetails.loginCount}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant={isEditing ? 'default' : 'outline'}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save

                  </>

                ) : 'Edit Profile'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Account Details */}
              <div className="vault-card p-6">
                <h3 className="font-semibold mb-4">Account Details</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isSaving}
                        />
                      ) : (
                        <span>{user?.name}</span>
                      )}
                    </div>
                  </div>

                  <div className='cursor-not-allowed'>
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Member Since</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage Usage */}
              <div className="vault-card p-6">
                <h3 className="font-semibold mb-4">Storage Usage</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Used Storage</span>
                      <span className="text-sm font-medium">
                        {formatBytes(stats.used)} of {formatBytes(stats.limit)}
                      </span>
                    </div>
                    <Progress value={storagePercent} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-2xl font-bold">{stats.documentCount}</p>
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{storagePercent.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Storage Used</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Session Details */}
              <div className="vault-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Session Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Current Session Started</Label>
                    <p className="text-foreground mt-1">
                      {loginDetails.currentSessionStart
                        ? formatLoginTime(loginDetails.currentSessionStart)
                        : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm">Session Duration</Label>
                    <p className="text-foreground mt-1">{getSessionDuration()}</p>
                  </div>

                  <div>
                    <Label className="text-sm">Last Login</Label>
                    <p className="text-foreground mt-1">
                      {loginDetails.lastLogin
                        ? formatLoginTime(loginDetails.lastLogin)
                        : 'Never'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm">Total Logins</Label>
                    <p className="text-foreground mt-1">{loginDetails.loginCount}</p>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              {/* <div className="vault-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Device Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Browser</Label>
                    <p className="text-foreground mt-1">{loginDetails.deviceInfo.browser}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Platform</Label>
                    <p className="text-foreground mt-1">{loginDetails.deviceInfo.platform}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Current Status</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-green-400  text-white border-green-400">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Security */}
              <div className="vault-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Change your password</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <div>
                      <p className="font-medium">Session Management</p>
                      <p className="text-sm text-muted-foreground">View all active sessions</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <div>
                      <p className="font-medium">Login History</p>
                      <p className="text-sm text-muted-foreground">{loginDetails.loginCount} total logins</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}