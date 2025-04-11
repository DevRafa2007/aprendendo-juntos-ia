import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@chakra-ui/react';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  enrolled_at: string;
  completed_at?: string;
  last_accessed_at?: string;
  certificate_issued: boolean;
  certificate_url?: string;
}

export interface EnrollmentWithCourseDetails extends Enrollment {
  course: {
    id: string;
    title: string;
    description: string;
    cover_image: string;
    instructor_name: string;
    category: string;
    duration: number;
    level: string;
  };
}

export function useEnrollment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, getToken } = useAuth();
  const toast = useToast();
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Função para obter token de autenticação
  const getAuthToken = async () => {
    try {
      return await getToken();
    } catch (err) {
      console.error('Erro ao obter token:', err);
      throw new Error('Erro de autenticação');
    }
  };

  // Matricular o usuário em um curso
  const enrollInCourse = async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      
      const response = await axios.post(`${apiUrl}/enrollments`, {
        course_id: courseId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast({
        title: 'Sucesso',
        description: 'Você foi matriculado no curso com sucesso!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return { success: true, data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao matricular no curso';
      setError(errorMessage);
      
      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o usuário está matriculado em um curso
  const checkEnrollment = async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      
      const response = await axios.get(`${apiUrl}/enrollments/check/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { 
        success: true, 
        data: { 
          isEnrolled: response.data.enrolled,
          enrollmentData: response.data.enrollment || null
        }, 
        error: null 
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao verificar matrícula';
      setError(errorMessage);
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Obter todas as matrículas do usuário
  const getUserEnrollments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      
      const response = await axios.get(`${apiUrl}/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data as EnrollmentWithCourseDetails[], error: null };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar matrículas';
      setError(errorMessage);
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status da matrícula
  const updateEnrollmentStatus = async (enrollmentId: string, status: 'active' | 'completed' | 'paused' | 'cancelled') => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      
      const response = await axios.patch(`${apiUrl}/enrollments/${enrollmentId}`, {
        status
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast({
        title: 'Sucesso',
        description: 'Status da matrícula atualizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar status da matrícula';
      setError(errorMessage);
      
      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Marcar curso como concluído
  const markCourseAsCompleted = async (enrollmentId: string) => {
    return updateEnrollmentStatus(enrollmentId, 'completed');
  };

  // Pausar matrícula
  const pauseEnrollment = async (enrollmentId: string) => {
    return updateEnrollmentStatus(enrollmentId, 'paused');
  };

  // Reativar matrícula pausada
  const resumeEnrollment = async (enrollmentId: string) => {
    return updateEnrollmentStatus(enrollmentId, 'active');
  };

  // Cancelar matrícula
  const cancelEnrollment = async (enrollmentId: string) => {
    return updateEnrollmentStatus(enrollmentId, 'cancelled');
  };

  // Registrar acesso ao curso (atualizar last_accessed_at)
  const registerCourseAccess = async (enrollmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      
      const response = await axios.post(`${apiUrl}/enrollments/${enrollmentId}/access`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar acesso ao curso';
      setError(errorMessage);
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Atualizar progresso geral da matrícula
  const updateEnrollmentProgress = async (enrollmentId: string, progress: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      
      const response = await axios.patch(`${apiUrl}/enrollments/${enrollmentId}/progress`, {
        progress
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar progresso da matrícula';
      setError(errorMessage);
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Obter certificado do curso
  const getCertificate = async (enrollmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      
      const response = await axios.get(`${apiUrl}/enrollments/${enrollmentId}/certificate`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar certificado';
      setError(errorMessage);
      
      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    enrollInCourse,
    checkEnrollment,
    getUserEnrollments,
    updateEnrollmentStatus,
    markCourseAsCompleted,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment,
    registerCourseAccess,
    updateEnrollmentProgress,
    getCertificate
  };
} 