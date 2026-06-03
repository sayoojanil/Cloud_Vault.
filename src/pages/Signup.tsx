import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { extractAadhaarText } from '@/lib/api';
import { Eye, EyeOff, ArrowRight, Check, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

const benefits = [
  '1 GB secure storage',
  'Unlimited document uploads',
  'Advanced search & filters',
];

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adharFile, setAdharFile] = useState<File | null>(null);
  const [adharPreview, setAdharPreview] = useState<string | null>(null);
  const [adharOcrText, setAdharOcrText] = useState<string>('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const handleAdharChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setAdharFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAdharPreview(previewUrl);
    
    // Run OCR to extract text
    try {
      const ocrResult = await extractAadhaarText(file);
      setAdharOcrText(ocrResult.trim());
      // You can use adharOcrText for verification or store it
      console.log('Extracted Aadhaar text:', ocrResult);
    } catch (err) {
      console.error('OCR extraction failed', err);
    }
  };

  const clearAdharFile = () => {
    setAdharFile(null);
    if (adharPreview) {
      URL.revokeObjectURL(adharPreview);
      setAdharPreview(null);
    }
    setAdharOcrText('');
  };

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      // Pass the Aadhaar file to signup function
      const success = await signup(data.name, data.email, data.password, adharFile);
      
      if (success) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-primary-foreground max-w-md"
        >
          <h2 className="text-3xl font-bold mb-6">Start protecting your documents today</h2>
          <p className="opacity-80 mb-8">
            Join thousands of users who trust Vault to keep their personal data safe and organized.
          </p>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="inline-block mb-8">
            <Logo />
          </Link>

          <h1 className="text-2xl font-bold mb-2">Create your vault</h1>
          <p className="text-muted-foreground mb-8">
            Get started with your secure document storage
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Full Name"
                className="mt-1.5"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className="mt-1.5"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1.5"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="adharImage" className="text-sm font-medium">Aadhaar Card Image</Label>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Optional</span>
              </div>
              
              {!adharPreview ? (
                <label
                  htmlFor="adharImage"
                  className="flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/30 border-muted-foreground/20 hover:border-muted-foreground/40 transition-all duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-3 pb-3">
                    <Upload className="w-5 h-5 text-muted-foreground mb-1 animate-pulse" />
                    <p className="text-xs text-muted-foreground font-medium">Click to upload Aadhaar Image</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">PNG, JPG, WebP up to 5MB</p>
                  </div>
                  <input
                    id="adharImage"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAdharChange}
                  />
                </label>
              ) : (
                <div className="relative border rounded-lg p-2.5 flex items-center justify-between bg-muted/10 border-border/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden border bg-background shrink-0 flex items-center justify-center shadow-sm">
                      <img
                        src={adharPreview}
                        alt="Aadhaar Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate max-w-[180px]">
                        {adharFile?.name || 'adhar_image.jpg'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {adharFile ? (adharFile.size / 1024 / 1024).toFixed(2) : 0} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-md active:scale-95 transition-transform"
                    onClick={clearAdharFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full gap-2 rounded-md" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}