
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CreateCourse from "./pages/CreateCourse";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cursos" element={<Courses />} />
            <Route path="/curso/:slug" element={<CourseDetail />} />
            <Route path="/criar-curso" element={
              <AuthGuard requireAuth redirectTo="/login">
                <CreateCourse />
              </AuthGuard>
            } />
            <Route path="/login" element={
              <AuthGuard redirectIfAuth redirectAuthTo="/">
                <Auth />
              </AuthGuard>
            } />
            <Route path="/cadastro" element={
              <AuthGuard redirectIfAuth redirectAuthTo="/">
                <Auth />
              </AuthGuard>
            } />
            <Route path="/perfil" element={
              <AuthGuard requireAuth redirectTo="/login">
                <Profile />
              </AuthGuard>
            } />
            <Route path="/suporte" element={<Support />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
