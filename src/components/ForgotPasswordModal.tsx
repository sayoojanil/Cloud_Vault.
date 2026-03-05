// components/ForgotPasswordModal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Key, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailForm = z.infer<typeof emailSchema>;
type OTPForm = z.infer<typeof otpSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const { forgotPassword, verifyOTP, resetPassword } = useAuth();

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onEmailSubmit = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setEmail(data.email);
      setStep('otp');
      startTimer();
      toast.success('OTP sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPForm) => {
    setIsLoading(true);
    try {
      await verifyOTP(email, data.otp);
      setStep('password');
      toast.success('OTP verified successfully');
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      await resetPassword(email, otpForm.getValues('otp'), data.password);
      toast.success('Password reset successfully');
      setTimeout(() => {
        onBackToLogin();
        onClose();
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (timer > 0) return;
    
    setIsLoading(true);
    try {
      await forgotPassword(email);
      startTimer();
      toast.success('OTP resent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-background rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => {
              if (step === 'otp') setStep('email');
              else if (step === 'password') setStep('otp');
              else onBackToLogin();
            }}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">Reset Password</h2>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {['Email', 'OTP', 'New Password'].map((label, index) => {
            const stepNumber = index + 1;
            const isActive = 
              (step === 'email' && index === 0) ||
              (step === 'otp' && index === 1) ||
              (step === 'password' && index === 2);
            const isCompleted = 
              (step === 'otp' && index === 0) ||
              (step === 'password' && (index === 0 || index === 1));

            return (
              <div key={label} className="flex-1 text-center">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2
                  ${isActive ? 'bg-primary text-primary-foreground' : 
                    isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                <p className={`text-xs ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  {...emailForm.register('email')}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-destructive text-xs mt-1">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <p className="text-sm text-muted-foreground mb-2">
                We've sent a 6-digit code to {email}
              </p>
              <div className="relative mt-1.5">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="pl-9 text-center text-lg tracking-widest"
                  {...otpForm.register('otp')}
                />
              </div>
              {otpForm.formState.errors.otp && (
                <p className="text-destructive text-xs mt-1">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={resendOTP}
                disabled={timer > 0 || isLoading}
                className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                Resend OTP {timer > 0 && `(${timer}s)`}
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </form>
        )}

        {/* New Password Step */}
        {step === 'password' && (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...passwordForm.register('password')}
                />
              </div>
              {passwordForm.formState.errors.password && (
                <p className="text-destructive text-xs mt-1">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...passwordForm.register('confirmPassword')}
                />
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}