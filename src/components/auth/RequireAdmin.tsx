import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton-custom';
import { error } from 'console';
import { toast } from 'sonner';

interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-8 w-32 bg-slate-800" />
          <Skeleton className="h-4 w-48 bg-slate-800" />
          <Skeleton className="h-32 w-full rounded-lg bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
      
    toast.error("You can't access to admin panel")
    return <Navigate to="/dashboard" replace />;
    
  }

  return <>{children}</>; 
}
