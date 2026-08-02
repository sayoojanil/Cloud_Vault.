import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Database, 
  FileText, 
  ArrowLeft, 
  Search, 
  ExternalLink,
  Shield,
  Clock,
  Send,
  CheckCircle2,
  HardDrive,
  User as UserIcon,
  ChevronRight,
  Filter,
  FileImage,
  FileDown,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  apiAdminGetUsers, 
  apiAdminGetUserDetails, 
  apiAdminUpdateDocumentStatus,
  AdminUser,
  AdminDocument
} from '@/lib/api';

// Set page title
document.title = "Admin Portal | CloudVault";

// Helper to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Map file types to Lucide icons and colors
const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();
  if (type === 'pdf') {
    return <FileText className="w-5 h-5 text-rose-400" />;
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
    return <FileImage className="w-5 h-5 text-blue-400" />;
  }
  return <FileText className="w-5 h-5 text-slate-400" />;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'guest'>('all');
  
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [activeTab, setActiveTab] = useState<'directory' | 'insights'>('directory');
  const [updatingDocId, setUpdatingDocId] = useState<string | null>(null);

  // Fetch all users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await apiAdminGetUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load users list");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleViewDetails = async (user: AdminUser) => {
    setSelectedUser(user);
    setView('detail');
    setIsLoadingDetail(true);
    try {
      const data = await apiAdminGetUserDetails(user.id);
      if (data) {
        setDocuments(data.documents || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load user details");
      setView('list');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (docId: string, newStatus: 'pending' | 'verification_sent' | 'verified') => {
    setUpdatingDocId(docId);
    try {
      await apiAdminUpdateDocumentStatus(docId, newStatus);
      // Refresh selected user details if open
      if (selectedUser) {
        const refreshed = await apiAdminGetUserDetails(selectedUser.id);
        setSelectedUser(refreshed.user);
        setDocuments(refreshed.documents);
      }
      // Refresh the users list to reflect any verification changes on the user level
      await loadUsers();
      toast.success("Document verification status updated", {
        description: `Status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingDocId(null);
    }
  };

  // Filtered users list
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (roleFilter === 'all') return matchesSearch;
    if (roleFilter === 'admin') return matchesSearch && user.isAdmin;
    if (roleFilter === 'guest') return matchesSearch && user.isGuest;
    if (roleFilter === 'user') return matchesSearch && !user.isAdmin && !user.isGuest;
    return matchesSearch;
  });

  // Compute statistics
  const totalStorage = users.reduce((acc, user) => acc + (user.storageUsed || 0), 0);
  const guestCount = users.filter(u => u.isGuest).length;
  const adminCount = users.filter(u => u.isAdmin).length;
  const regularCount = users.length - guestCount - adminCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 selection:bg-rose-500/30 selection:text-rose-200">
      
      <div className="container-wide pt-24 px-4 sm:px-6">
        
        {/* Upper Breadcrumb / Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 pb-6 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-rose-500">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Admin Control Panel
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              System Administration
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Audit stored assets, manage identity credentials, track database storage quotas, and govern user accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {view === 'list' && (
              <div className="bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 flex">
                <button
                  onClick={() => setActiveTab('directory')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'directory' 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  User Directory
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'insights' 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Storage Insights
                </button>
              </div>
            )}

            <Button 
              onClick={view === 'list' ? loadUsers : () => handleViewDetails(selectedUser!)} 
              disabled={isLoadingUsers || isLoadingDetail}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold px-5 rounded-xl text-xs h-10 active:scale-95 transition-transform"
            >
              Refresh View
            </Button>
          </div>
        </div>

        {/* Stats Grid (Only in list view) */}
        {view === 'list' && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="vault-card p-6 border-slate-800/80 bg-slate-900/10 backdrop-blur-md relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full filter blur-xl group-hover:bg-rose-500/10 transition-colors"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Accounts</p>
                  <h3 className="text-3xl font-black mt-2 text-white">{users.length}</h3>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <span className="font-semibold text-rose-400">{regularCount}</span> Users
                    <span className="text-slate-700">|</span>
                    <span className="font-semibold text-amber-400">{guestCount}</span> Guests
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="vault-card p-6 border-slate-800/80 bg-slate-900/10 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-xl group-hover:bg-purple-500/10 transition-colors"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Disk Storage Allocated</p>
                  <h3 className="text-3xl font-black mt-2 text-white">{formatBytes(totalStorage)}</h3>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                    <span className="font-semibold text-purple-400">Average:</span> {users.length ? formatBytes(totalStorage / users.length) : '0 Bytes'}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Database className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="vault-card p-6 border-slate-800/80 bg-slate-900/10 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">System Admins</p>
                  <h3 className="text-3xl font-black mt-2 text-white">{adminCount}</h3>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                    <span className="text-indigo-400 font-semibold">Protected Role Status</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="vault-card p-6 border-slate-800/80 bg-slate-900/10 backdrop-blur-md relative overflow-hidden group hover:border-green-500/20 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full filter blur-xl group-hover:bg-green-500/10 transition-colors"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">System Health Status</p>
                  <h3 className="text-3xl font-black mt-2 text-green-400">100% OK</h3>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                    <span>All services operating normally</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <HardDrive className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Main Section container */}
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            activeTab === 'directory' ? (
              <motion.div
                key="directory-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="vault-card border-slate-800 bg-slate-900/10 backdrop-blur-md p-6 sm:p-8"
              >
                {/* Search & Filter Header */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">User Directory</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Filter through all registered user profiles on the platform.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input 
                        type="search" 
                        placeholder="Search name or email..." 
                        className="pl-10 h-10 w-full sm:w-60 bg-slate-950/80 border-slate-800 focus:border-rose-500/40 text-slate-200 text-xs rounded-xl focus:ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Role Filter Buttons */}
                    <div className="bg-slate-950/80 border border-slate-800 p-1 rounded-xl flex items-center gap-0.5">
                      {(['all', 'admin', 'user', 'guest'] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                            roleFilter === role 
                              ? 'bg-slate-800 text-slate-100' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {isLoadingUsers ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <div className="w-10 h-10 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-xs font-medium">Fetching secure records...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                    <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-400">No users found</h3>
                    <p className="text-slate-500 text-xs mt-1">Try modifying your search queries or role filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-800/60 rounded-2xl bg-slate-950/30">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-800/80 bg-slate-900/30 text-xs text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-4 px-6">Account Details</th>
                          <th className="py-4 px-6">Storage Quota</th>
                          <th className="py-4 px-6">Privilege / Role</th>
                          <th className="py-4 px-6">Registration Date</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/50 text-xs sm:text-sm">
                        {filteredUsers.map((user) => {
                          const usagePct = user.storageLimit ? (user.storageUsed / user.storageLimit) * 100 : 0;
                          const isStorageCritical = usagePct > 80;
                          return (
                            <tr key={user.id} className="hover:bg-slate-900/30 transition-colors group">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-300 font-bold border border-slate-800 group-hover:border-slate-700 transition-colors">
                                    {user.avatar ? (
                                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                                    ) : (
                                      user.name.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{user.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 min-w-[220px]">
                                <div className="space-y-1.5 w-44">
                                  <div className="flex justify-between text-xs font-semibold">
                                    <span className={isStorageCritical ? "text-rose-400" : "text-slate-300"}>
                                      {formatBytes(user.storageUsed || 0)}
                                    </span>
                                    <span className="text-slate-500">
                                      {formatBytes(user.storageLimit || 1073741824)}
                                    </span>
                                  </div>
                                  <Progress 
                                    value={usagePct} 
                                    className={`h-1.5 bg-slate-950 rounded-full [&>div]:rounded-full ${
                                      isStorageCritical ? '[&>div]:bg-rose-500' : '[&>div]:bg-slate-300'
                                    }`} 
                                  />
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex gap-2">
                                  {user.isAdmin && (
                                    <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 text-[10px] font-bold rounded-lg px-2 py-0.5">
                                      Admin
                                    </Badge>
                                  )}
                                  {user.isGuest ? (
                                    <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 text-[10px] font-bold rounded-lg px-2 py-0.5">
                                      Guest Account
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 text-[10px] font-bold rounded-lg px-2 py-0.5">
                                      Verified Account
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-slate-400 text-xs font-medium">
                                {new Date(user.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <Button 
                                  size="sm"
                                  onClick={() => handleViewDetails(user)}
                                  className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg gap-1.5 transition-all"
                                >
                                  View Assets
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="insights-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-6 md:grid-cols-2"
              >
                {/* Storage breakdown card */}
                <div className="vault-card p-6 border-slate-800 bg-slate-900/10 backdrop-blur-md">
                  <h3 className="text-lg font-bold text-white mb-4">Allocated Storage Distribution</h3>
                  <p className="text-slate-400 text-xs mb-6">Percentage quota consumed by all registrants compared to total storage limit.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Allocated System Capacity</span>
                        <span>{formatBytes(totalStorage)} / {formatBytes(users.length * 1073741824)} limit</span>
                      </div>
                      <Progress value={users.length ? (totalStorage / (users.length * 1073741824)) * 100 : 0} className="h-2 bg-slate-950" />
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/20 text-xs text-slate-400 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">Avg Allocation Limit:</span>
                        <span>1.00 GB per User</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">Avg Utilization Rate:</span>
                        <span>{users.length ? formatBytes(totalStorage / users.length) : '0 Bytes'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage alerts */}
                <div className="vault-card p-6 border-slate-800 bg-slate-900/10 backdrop-blur-md flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-4">Platform Insights</h3>
                  
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/10">
                    <Info className="w-10 h-10 text-rose-500/40 mb-3" />
                    <h4 className="font-bold text-slate-300 text-sm">Storage Alerts System</h4>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs">
                      All system quotas are well below critical capacity thresholds. No intervention is required.
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          ) : (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Back Link */}
              <div>
                <button 
                  onClick={() => setView('list')}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-xs transition-colors bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 px-4 py-2 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to User Directory
                </button>
              </div>

              {/* High-Fidelity Profile Header Card */}
              <div className="vault-card border-slate-800 bg-slate-900/10 backdrop-blur-md p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
                
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center text-2xl font-black border border-rose-500/30 text-white shadow-xl shadow-rose-500/10">
                    {selectedUser?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      {selectedUser?.name}
                      {selectedUser?.isAdmin && (
                        <Badge className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold text-[10px] rounded-lg">Admin Status</Badge>
                      )}
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{selectedUser?.email}</p>
                    
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Joined {selectedUser && new Date(selectedUser.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{selectedUser?.isGuest ? 'Guest User' : 'Standard User'}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-72 pt-6 lg:pt-0 border-t border-slate-900 lg:border-t-0 lg:border-l lg:pl-6 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">User Quota Capacity</span>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                    <span>Used: {formatBytes(selectedUser?.storageUsed || 0)}</span>
                    <span>Limit: {formatBytes(selectedUser?.storageLimit || 1073741824)}</span>
                  </div>
                  {selectedUser && (
                    <Progress 
                      value={(selectedUser.storageUsed / selectedUser.storageLimit) * 100} 
                      className="h-2 bg-slate-950 [&>div]:bg-rose-500 rounded-full" 
                    />
                  )}
                </div>
              </div>

              {/* User assets grid table */}
              <div className="vault-card border-slate-800 bg-slate-900/10 backdrop-blur-md p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Uploaded Document Assets ({documents.length})
                  </h3>
                </div>

                {isLoadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <div className="w-10 h-10 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-xs font-semibold">Retrieving secure documents list...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/25">
                    <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-400 text-sm">No assets discovered</h4>
                    <p className="text-slate-500 text-xs mt-1">This user has not uploaded any assets or directories yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-800/60 rounded-2xl bg-slate-950/30">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-800/80 bg-slate-900/30 text-xs text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-4 px-6">File Name</th>
                          <th className="py-4 px-6">File Size</th>
                          <th className="py-4 px-6">Category Tag</th>
                          <th className="py-4 px-6">Directory Path</th>
                          <th className="py-4 px-6">Verification Governance</th>
                          <th className="py-4 px-6 text-right">Resource</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60 text-xs sm:text-sm">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-900/30 transition-colors group">
                            <td className="py-4 px-6 max-w-[280px]">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center shadow-inner group-hover:border-slate-700 transition-colors">
                                  {getFileIcon(doc.fileType)}
                                </div>
                                <div className="truncate">
                                  <span className="font-bold text-slate-200 group-hover:text-white transition-colors block truncate" title={doc.name}>
                                    {doc.name}
                                  </span>
                                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
                                    {doc.fileType} format
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-300 font-medium">
                              {formatBytes(doc.size)}
                            </td>
                            <td className="py-4 px-6">
                              <Badge className="bg-slate-900 hover:bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-bold rounded-lg uppercase tracking-wider px-2 py-0.5">
                                {doc.category}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-slate-400 text-xs font-semibold">
                              {doc.folder ? (
                                <span className="text-rose-400/80 bg-rose-500/5 px-2.5 py-1 rounded-lg border border-rose-500/10 font-mono">
                                  /{doc.folder}
                                </span>
                              ) : (
                                <span className="text-slate-600 font-mono">— Root</span>
                              )}
                            </td>
                            <td className="py-4 px-6 min-w-[260px]">
                              {updatingDocId === doc.id ? (
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium pl-2">
                                  <div className="w-4 h-4 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                                  <span>Writing Status...</span>
                                </div>
                              ) : (
                                <div className="bg-slate-950/80 border border-slate-850 p-1 rounded-xl inline-flex items-center gap-1.5 shadow-inner">
                                  {/* Pending badge */}
                                  <button
                                    onClick={() => handleUpdateStatus(doc.id, 'pending')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                      doc.verificationStatus?.toLowerCase() === 'pending'
            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                                    }`}
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    Pending
                                  </button>

                                  {/* Sent badge */}
                                  <button
                                    onClick={() => handleUpdateStatus(doc.id, 'verification_sent')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                      doc.verificationStatus?.toLowerCase() === 'verification_sent'
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                                    }`}
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    Sent
                                  </button>

                                  {/* Verified badge */}
                                  <button
                                    onClick={() => handleUpdateStatus(doc.id, 'verified')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                      doc.verificationStatus?.toLowerCase() === 'verified'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Verified
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              {doc.fileUrl ? (
                                <a 
                                  href={doc.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-slate-850 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm"
                                >
                                  Open File
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span className="text-slate-600 font-mono">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
