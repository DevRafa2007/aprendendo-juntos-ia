
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface ProfileType {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  social_links?: Record<string, string> | null;
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
        console.log('Fetching profile for user:', targetUserId);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }

        console.log('Profile data fetched:', data);
        // Convert data to ProfileType to ensure compatibility
        const profileData: ProfileType = {
          id: data.id,
          name: data.name,
          email: data.email,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
          // Convert Json to Record<string, string>
          social_links: data.social_links ? data.social_links as Record<string, string> : null
        };
        setProfile(profileData);
      } catch (error: any) {
        console.error('Error in profile fetch:', error);
        setError(error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar perfil",
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user, toast]);

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
      console.log('Updating profile for user:', targetUserId, updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar perfil",
          description: error.message
        });
        throw error;
      }

      console.log('Profile updated successfully:', data);
      // Convert data to ProfileType to ensure compatibility
      const profileData: ProfileType = {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // Convert Json to Record<string, string>
        social_links: data.social_links ? data.social_links as Record<string, string> : null
      };
      setProfile(profileData);
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso!"
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in profile update:', error);
      return { data: null, error };
    }
  };

  return { profile, isLoading, error, updateProfile };
}
