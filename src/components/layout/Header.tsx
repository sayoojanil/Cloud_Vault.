import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, UserRound, Menu, X, Search, Bell, ChevronDown, Moon, Sun, Laptop } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  type Theme = 'light' | 'dark' | 'system';
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const applyTheme = (targetTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (targetTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(targetTheme);
    }
    
    localStorage.setItem('theme', targetTheme);
    window.dispatchEvent(new Event('themeChanged'));
  };

  const handleThemeToggle = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  // Sync theme when it is updated elsewhere (like Settings page or system preference)
  // Apply stored theme on initial load
  useEffect(() => {
    applyTheme(theme);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = (localStorage.getItem('theme') as Theme) || 'system';
      setTheme(currentTheme);
    };

    window.addEventListener('themeChanged', handleThemeChange);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll for header animation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.error("You have been logged out", {
      description: "Login again for viewing your personal documents."
    });
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 glass border-b border-border transition-all duration-300",
          scrolled ? "bg-background/95 backdrop-blur-lg shadow-lg" : "bg-background/80 backdrop-blur-md"
        )}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to={user ? '/dashboard' : '/'}>
                <img src="/cloudvault_logo.png" alt="CloudVault" className="h-24 w-auto" />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {!user ? (
                <>
                  
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="hover:scale-105 rounded-full active:scale-95 transition-transform">
                        Sign In
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Link to="/signup">
                      <Button size="sm" className="hover:scale-105 rounded-full active:scale-95 transition-transform bg-[#6C3CF0]">
                        Get Started
                      </Button>
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Search Bar */}
                  {/* <AnimatePresence>
                    {searchOpen ? (
                      <motion.form
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onSubmit={handleSearch}
                        className="flex items-center"
                      >
                        <div className="relative w-full">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            ref={searchInputRef}
                            type="search"
                            placeholder="Search documents, files..."
                            className="pl-10 pr-10 w-full bg-background/50 border-border focus:border-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setSearchOpen(false)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSearchOpen(true)}
                        className="p-2 rounded-full hover:bg-accent transition-colors"
                        aria-label="Search"
                      >
                        <Search className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence> */}

                  {/* User Links */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hover:scale-105 active:scale-95">
                      Dashboard
                    </Link>
                  </motion.div>
                  {/* {user.isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                    >
                      <Link to="/admin" className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors hover:scale-105 active:scale-95">
                        Admin
                      </Link>
                    </motion.div>
                  )} */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Link to="/documents" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hover:scale-105 active:scale-95">
                      Documents
                    </Link>
                  </motion.div>

                  {/* Notifications */}
                  {/* <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-full hover:bg-accent transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </motion.button> */}

                  {/* User Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 group hover:scale-105 active:scale-95 transition-transform flex items-center pl-1.5 pr-2 py-1.5 h-auto rounded-full bg-accent/20 border border-border/40 hover:bg-accent/40">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border shadow-inner group-hover:border-primary/50 transition-colors flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="hidden sm:inline font-medium text-foreground/90 group-hover:text-foreground transition-colors max-w-[120px] truncate">{user.name}</span>
                          <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="flex items-center gap-2">
                            <UserRound className="w-4 h-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        {user.isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="flex items-center gap-2 text-rose-400 focus:text-rose-400/90 font-medium">
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          {/* <Link to="/settings" className="flex items-center gap-2">
                            Settings
                          </Link> */}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <div className="flex flex-col gap-1 px-2 py-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium">
                              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary" /> : theme === 'light' ? <Sun className="w-3.5 h-3.5 text-primary" /> : <Laptop className="w-3.5 h-3.5 text-primary" />}
                              Theme
                            </span>
                            <div className="flex items-center gap-0.5 bg-accent/40 rounded-full p-0.5 border border-border/30">
                              <button
                                type="button"
                                onClick={() => handleThemeToggle('light')}
                                className={cn(
                                  "p-1 rounded-full hover:bg-background/80 hover:text-foreground transition-all duration-200",
                                  theme === 'light' && "bg-background text-primary shadow-sm"
                                )}
                                title="Light Mode"
                              >
                                <Sun className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleThemeToggle('dark')}
                                className={cn(
                                  "p-1 rounded-full hover:bg-background/80 hover:text-foreground transition-all duration-200",
                                  theme === 'dark' && "bg-background text-primary shadow-sm"
                                )}
                                title="Dark Mode"
                              >
                                <Moon className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleThemeToggle('system')}
                                className={cn(
                                  "p-1 rounded-full hover:bg-background/80 hover:text-foreground transition-all duration-200",
                                  theme === 'system' && "bg-background text-primary shadow-sm"
                                )}
                                title="System Preference"
                              >
                                <Laptop className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={confirmLogout} 
                          className="text-destructive hover:scale-105 active:scale-95 transition-transform"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg"
            >
              <nav className="container-wide py-4 flex flex-col gap-2">
                {!user ? (
                  <>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* <Link 
                        to="/#features" 
                        className="py-2 text-muted-foreground hover:text-foreground transition-colors block"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Features
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <Link 
                        to="/#security" 
                        className="py-2 text-muted-foreground hover:text-foreground transition-colors block"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Security
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                    > */}
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Sign In
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* User Info with Avatar for Mobile Navigation */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 px-3 py-3 border-b border-border/40 mb-2 bg-accent/10 rounded-xl"
                    >
                      
                      <div
                       className="relative w-10 h-10 rounded-full overflow-hidden border border-border shadow-inner flex-shrink-0">
                        {user.avatar ? (
                          
                          <img
                          
                          
                        onClick={() => navigate("/profile")}
                            
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                          
                          
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div onClick={() => navigate("/profile")} className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </motion.div>
                        

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link 
                        to="/dashboard" 
                        className="py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                    {user.isAdmin && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        <Link 
                          to="/admin" 
                          className="py-2 text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-2 font-semibold"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <Link 
                        to="/documents" 
                        className="py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Documents
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                    >
                      <Link 
                        to="/profile" 
                        className="py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      <Link
                        to="/settings"
                        className="py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      {/* Theme Toggle in Mobile Menu */}
                      <div className="flex items-center justify-between px-3 py-2 border-t border-border/40 mt-2">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary" /> : theme === 'light' ? <Sun className="w-3.5 h-3.5 text-primary" /> : <Laptop className="w-3.5 h-3.5 text-primary" />}
                          Theme
                        </span>
                        <div className="flex items-center gap-0.5 bg-accent/40 rounded-full p-0.5 border border-border/30">
                          <button
                            type="button"
                            onClick={() => handleThemeToggle('light')}
                            className={cn(
                              "p-1 rounded-full hover:bg-background/80 hover:text-foreground transition-all duration-200",
                              theme === 'light' && "bg-background text-primary shadow-sm"
                            )}
                            title="Light Mode"
                          >
                            <Sun className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleThemeToggle('dark')}
                            className={cn(
                              "p-1 rounded-full hover:bg-background/80 hover:text-foreground transition-all duration-200",
                              theme === 'dark' && "bg-background text-primary shadow-sm"
                            )}
                            title="Dark Mode"
                          >
                            <Moon className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleThemeToggle('system')}
                            className={cn(
                              "p-1 rounded-full hover:bg-background/80 hover:text-foreground transition-all duration-200",
                              theme === 'system' && "bg-background text-primary shadow-sm"
                            )}
                            title="System Preference"
                          >
                            <Laptop className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.4 }}
                    >
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:scale-105 active:scale-95 transition-transform"
                        onClick={() => { 
                          confirmLogout(); 
                          setMobileMenuOpen(false); 
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </motion.div>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to logout? You'll need to login again to access your personal documents.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLogoutDialogOpen(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setLogoutDialogOpen(false);
                  handleLogout();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>  
      </Dialog>
    </>
  );
}