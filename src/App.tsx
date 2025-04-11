
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { useEffect } from "react";
import mediaService from "@/services/mediaService";
import AuthGuard from "@/components/AuthGuard";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CreateCourse from "./pages/CreateCourse";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import TestUploader from "./pages/test-uploader";

const queryClient = new QueryClient();

// Componente para inicializar serviços
const InitializeServices = () => {
  useEffect(() => {
    // Inicializar buckets de armazenamento
    const initServices = async () => {
      try {
        console.log("Ambiente de desenvolvimento detectado, configurando buckets...");
        await mediaService.initializeStorageBuckets();
      } catch (error) {
        console.error("Erro crítico ao inicializar buckets de armazenamento:", error);
        alert("Erro ao configurar armazenamento. Alguns recursos de upload podem não funcionar corretamente. Consulte o console para mais detalhes.");
      }
    };
    
    initServices();
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProgressProvider>
          <InitializeServices />
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
              <Route path="/teste-uploader" element={<TestUploader />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ProgressProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
