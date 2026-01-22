import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { VaultProvider } from "@/contexts/VaultContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import RouteTitle from "@/components/RouteTitle";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <VaultProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <RouteTitle title="Cloud Vault">
                    <Landing />
                  </RouteTitle>
                }
              />

              <Route
                path="/login"
                element={
                  <RouteTitle title="Login ">
                    <Login />
                  </RouteTitle>
                }
              />

              <Route
                path="/signup"
                element={
                  <RouteTitle title="Signup ">
                    <Signup />
                  </RouteTitle>
                }
              />

              <Route
                path="/forgot-password"
                element={
                  <RouteTitle title="Forgot Password ">
                    <ForgotPassword />
                  </RouteTitle>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RouteTitle title="Dashboard ">
                      <Dashboard />
                    </RouteTitle>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <RouteTitle title="All Documents  ">
                      <Documents />
                    </RouteTitle>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <RouteTitle title="Profile Page ">
                      <Profile />
                    </RouteTitle>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <RouteTitle title="Settings ">
                      <Settings />
                    </RouteTitle>
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  <RouteTitle title="404 Not Found">
                    <NotFound />
                  </RouteTitle>
                }
              />
            </Routes>
          </VaultProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
