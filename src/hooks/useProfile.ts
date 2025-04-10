
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileType {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);
      } catch (error: any) {
        console.error('Erro ao buscar perfil:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user]);

  const updateProfile = async (updates: Partial<ProfileType>) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado"
      });
      throw new Error('Usuário não autenticado');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar perfil",
          description: error.message
        });
        throw error;
      }

      setProfile(data);
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso!"
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    }
  };

  return { profile, isLoading, error, updateProfile };
}
