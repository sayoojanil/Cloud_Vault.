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
  Trash2,
  Phone,
  Upload,
    CheckCircle2,
  AlertCircle
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
import { apiUpdateProfile, apiUploadAvatar, apiDeleteAvatar, apiUploadAdhar, apiDeleteAdhar, extractAadhaarText } from '@/lib/api';
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
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'Prefer not to say');
  const [dob, setDob] = useState(user?.dob ? user.dob.substring(0,10) : ''); // yyyy-mm-dd
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  // Token state to ensure Aadhaar image reloads after login/logout
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('vault_token'));

  // Update token when user changes (e.g., after login/logout)
  useEffect(() => {
    setAuthToken(localStorage.getItem('vault_token'));
  }, [user]);
  // Cropping states
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [adharDialogOpen, setAdharDialogOpen] = useState(false);
  const [isUploadingAdhar, setIsUploadingAdhar] = useState(false);
  const [isDeletingAdhar, setIsDeletingAdhar] = useState(false);

  const handleAdharUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Aadhaar image must be smaller than 5MB.'
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file (PNG, JPG, WebP).'
      });
      return;
    }

    setIsUploadingAdhar(true);
    const toastId = toast.loading('Uploading Aadhaar image...');
    try {
      const updatedUser = await apiUploadAdhar(file);
      updateUser({
        adharImage: updatedUser.adharImage,
        adharImagePublicId: updatedUser.adharImagePublicId
      });
      toast.success('Aadhaar image uploaded successfully', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload Aadhaar image', { id: toastId });
    } finally {
      setIsUploadingAdhar(false);
    }
  };

  const handleDeleteAdhar = async () => {
    if (!window.confirm("Are you sure you want to delete your Aadhaar image?")) {
      return;
    }
    setIsDeletingAdhar(true);
    const toastId = toast.loading('Removing Aadhaar image...');
    try {
      await apiDeleteAdhar();
      updateUser({
        adharImage: null,
        adharImagePublicId: null
      });
      toast.success('Aadhaar image removed successfully', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove Aadhaar image', { id: toastId });
    } finally {
      setIsDeletingAdhar(false);
    }
  };

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
    if (!window.confirm("Are you sure you want to delete your profile picture?")) {
      return;
    }
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
    const toastId = true;
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
    if (user?.phone) {
      setPhone(user.phone);
    }
    if (user?.gender) {
      setGender(user.gender);
    }
    if (user?.dob) {
      setDob(user.dob.substring(0,10));
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
      const updatePayload: any = { name: name.trim() };
      if (phone.trim()) updatePayload.phone = phone.trim();
      if (gender.trim()) updatePayload.gender = gender.trim();
      if (dob) updatePayload.dob = dob;
      const updatedUser = await apiUpdateProfile(updatePayload);
      updateUser({
        name: updatedUser.name,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
      });
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
                        <Button className='bg-red-500' variant="outline" onClick={() => setCropDialogOpen(false)}>
                          Cancel
                        </Button>
                       <Button
  className="bg-green-500 text-white"
  onClick={handleCropSave}
  disabled={isUploading}
>
  {isUploading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Updating...
    </>
  ) : (
    "Update"
  )}
</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Aadhaar Image Dialog */}
                  <Dialog open={adharDialogOpen} onOpenChange={setAdharDialogOpen}>
                    <DialogContent className="max-w-[90vw] sm:max-w-[600px] p-0 overflow-hidden bg-background border border-border/80 shadow-2xl">
                      <DialogHeader className="p-4 border-b border-border/50">
                        <DialogTitle className="text-sm font-semibold flex items-center justify-between">
                          <span>Aadhaar Card Document</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="p-4 flex items-center justify-center bg-muted/5 select-none">
                        {user?.adharImage && (
                          <img
                            key={authToken}
                            src={user?.adharImage ? `${user.adharImage}?token=${authToken}` : ''}
                            alt="Aadhaar Card Full View"
                            className="max-h-[60vh] w-auto object-contain rounded border shadow-md"
                          />
                        )}
                      </div>
                      <div className="p-3 bg-muted/15 flex justify-end gap-2 border-t border-border/50">
                        <Button variant="outline" size="sm" onClick={() => setAdharDialogOpen(false)}>
                          Close
                        </Button>
                        {user?.adharImage && (
                          <a
                            href={user.adharImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                          >
                            Open in New Tab
                          </a>
                        )}
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
                  {/* <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Phone className="w-4 h-4" />
                    <span>{user?.phone || 'Not provided'}</span>
                  </div> */}
                  {/* <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <User className="w-4 h-4" />
                    <span>{user?.gender || 'Prefer not to say'}</span>
                  </div> */}
                  {/* <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{user?.dob ? format(new Date(user.dob), 'MMMM d, yyyy') : 'Not provided'}</span>
                  </div> */}

                {/* Current Session Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                   
                  </div>
                  {loginDetails.lastLogin && (
                    <div className="flex items-center gap-1">
                     
                    </div>
                  )}
                </div>
              </div>

              <Button
                className='bg-green-600 hover:bg-green-600 text-white hover:text-white'
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

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              
            {/* Account Details */}
<div className="vault-card p-4">
  <h3 className="font-semibold mb-3 text-sm">Account Details</h3>

  <div className="space-y-3">
    {/* Full Name */}
    <div className="flex items-center gap-3 text-sm">
      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <Label className="w-20 text-xs font-medium">Full Name</Label>
      {isEditing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
          className="h-8 text-sm"
        />
      ) : (
        <span className="text-sm">{user?.name}</span>
      )}
    </div>

    {/* Phone */}
    <div className="flex items-center gap-3 text-sm">
      <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <Label className="w-20 text-xs font-medium">Phone</Label>
      {isEditing ? (
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isSaving}
          className="h-8 text-sm"
        />
      ) : (
        <span className="text-sm">{user?.phone || 'Not provided'}</span>
      )}
    </div>

    {/* Gender */}
    <div className="flex items-center gap-3 text-sm">
      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <Label className="w-20 text-xs font-medium">Gender</Label>
      {isEditing ? (
        <Input
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          disabled={isSaving}
          className="h-8 text-sm"
        />
      ) : (
        <span className="text-sm">{user?.gender || 'Prefer not to say'}</span>
      )}
    </div>

    {/* DOB */}
    <div className="flex items-center gap-3 text-sm">
      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <Label className="w-20 text-xs font-medium">Date of Birth</Label>
      {isEditing ? (
        <Input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          disabled={isSaving}
          className="h-8 text-sm"
        />
      ) : (
        <span className="text-sm">
          {user?.dob
            ? format(new Date(user.dob), 'MMM d, yyyy')
            : 'Not provided'}
        </span>
      )}
    </div>

    {/* Email */}
    <div className="flex items-center gap-3 text-sm opacity-60">
      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <Label className="w-20 text-xs font-medium">Email</Label>
      <span className="text-sm">{user?.email}</span>
    </div>

    {/* Member Since */}
    <div className="flex items-center gap-3 text-sm">
      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <Label className="w-20 text-xs font-medium">Member Since</Label>
      <span className="text-sm">
        {user?.createdAt
          ? format(new Date(user.createdAt), 'MMM d, yyyy')
          : 'N/A'}
      </span>
    </div>
  </div>
</div>

              {/* Aadhaar Verification Card */}
              <div
               className="vault-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2 text-foreground">
                    <Shield className="w-5 h-5 text-primary" />
                    Identity Verification (Aadhaar)
                  </h3>
                {user?.adharImage ? (
  <Badge
    variant="outline"
    className="bg-green-100 text-green-700 font-semi-bold border-emerald-500/20 px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
  >
    <CheckCircle2 className="w-4 h-4" />
    Uploaded
  </Badge>
) : (
  <Badge
    variant="outline"
    className="bg-red-500 text-white px-2 py-0.5 text-xsfont-semi-bold rounded-full animate-pulse flex items-center gap-1"
  >
    <AlertCircle className="w-4 h-4" />
    Pending Upload
  </Badge>
)}
                </div>
                
                <p className="text-xs text-muted-foreground mb-4">
                  Verify your identity on Secure Vault Pro by uploading a clear photo of your Aadhaar card. This document is encrypted and stored securely.
                </p>

                <div className="mt-2">
                  {user?.adharImage ? (
                    <div
                    
              
                     className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/5 border-border hover:bg-muted/10 transition-all duration-200 group">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 rounded border bg-background overflow-hidden shrink-0 flex items-center justify-center shadow-sm relative group-hover:shadow transition-shadow">
                          <img
                          
                           onClick={() => setAdharDialogOpen(true)}
                           key={authToken}
                            src={user?.adharImage ? `${user.adharImage}?token=${authToken}` : ''}
                            alt="Aadhaar Card"
                            className="w-full h-full object-cover cursor-pointer"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Aadhaar Card Image</p>
                          <p className="text-xs text-muted-foreground font-medium">Uploaded & Securely Stored</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1.5 h-8 font-medium rounded-md hover:bg-primary hover:text-white transition-colors active:scale-95 duration-200"
                          onClick={() => setAdharDialogOpen(true)}
                        >
                          View Document
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-8 px-2.5 rounded-md active:scale-95 transition-transform"
                          onClick={handleDeleteAdhar}
                          disabled={isDeletingAdhar}
                        >
                          {isDeletingAdhar ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                          )}
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="adhar-profile-upload"
                        className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed rounded-lg bg-card border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/10 text-muted-foreground text-xs font-medium cursor-pointer transition-all duration-200"
                      >
                        {isUploadingAdhar ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span>Uploading Aadhaar Image...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-muted-foreground animate-bounce mb-1" />
                            <span>Upload Aadhaar Card Image</span>
                            <span className="text-[10px] text-muted-foreground/60">PNG, JPG, WebP up to 5MB</span>
                          </>
                        )}
                        <input
                          id="adhar-profile-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAdharUpload}
                          disabled={isUploadingAdhar}
                        />
                      </label>
                    </div>
                  )}
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
            {/* <div className="space-y-6"> */}
              {/* Session Details */}
              {/* <div className="vault-card p-6">
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
              </div> */}

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
              {/* <div className="vault-card p-6">
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
                </div> */}
              </div>
            {/* </div> */}
          {/* </div> */}
        </motion.div>
      </main>
    </div>
  );
}