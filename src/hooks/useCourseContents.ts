import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { deleteMediaByUrl } from '@/services/mediaService';
import { 
  Module, 
  Content, 
  BaseContent, 
  ContentType,
  VideoContent,
  TextContent,
  PdfContent,
  LinkContent,
  AssignmentContent,
  QuizContent,
  QuizQuestion,
  QuizOption
} from '@/types/course';

export function useCourseContents() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Busca todos os módulos de um curso
   */
  const fetchModules = async (courseId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar módulos:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca um módulo específico por ID
   */
  const fetchModuleById = async (moduleId: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar módulo:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cria um novo módulo para um curso
   */
  const createModule = async (courseId: string, moduleData: Partial<Module>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para criar um módulo"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Obtém o maior order_index existente para adicionar o novo no final
      const { data: modules, error: countError } = await supabase
        .from('modules')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1);
      
      if (countError) throw countError;
      
      const nextOrderIndex = modules && modules.length > 0 ? modules[0].order_index + 1 : 0;
      
      const { data, error } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          title: moduleData.title || 'Novo Módulo',
          description: moduleData.description || '',
          order_index: nextOrderIndex
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar módulo",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Módulo criado",
        description: "Módulo criado com sucesso!"
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar módulo:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza um módulo existente
   */
  const updateModule = async (moduleId: number, moduleData: Partial<Module>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para atualizar um módulo"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .update({
          ...moduleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId)
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar módulo",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Módulo atualizado",
        description: "Módulo atualizado com sucesso!"
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar módulo:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deleta um módulo e todos os seus conteúdos
   */
  const deleteModule = async (moduleId: number) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para deletar um módulo"
      });
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Busca os conteúdos do módulo para deletar arquivos de mídia associados
      const { data: contents } = await supabase
        .from('contents')
        .select(`
          id,
          type,
          content_videos(video_url),
          content_pdfs(file_url)
        `)
        .eq('module_id', moduleId);
      
      // Remove arquivos de mídia (vídeos, PDFs, etc)
      if (contents && contents.length > 0) {
        for (const content of contents) {
          if (content.type === 'video' && content.content_videos?.video_url) {
            await deleteMediaByUrl(content.content_videos.video_url);
          }
          
          if (content.type === 'pdf' && content.content_pdfs?.file_url) {
            await deleteMediaByUrl(content.content_pdfs.file_url);
          }
        }
      }
      
      // Deleta o módulo (os conteúdos serão deletados em cascata)
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao deletar módulo",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Módulo deletado",
        description: "Módulo deletado com sucesso!"
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao deletar módulo:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reordena módulos de um curso
   */
  const reorderModules = async (courseId: string, moduleIds: number[]) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para reordenar módulos"
      });
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Cria transações para atualizar cada módulo com seu novo índice
      const updates = moduleIds.map((id, index) => ({
        id,
        order_index: index
      }));
      
      const { error } = await supabase.from('modules').upsert(updates);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao reordenar módulos",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Módulos reordenados",
        description: "A ordem dos módulos foi atualizada!"
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao reordenar módulos:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca todos os conteúdos de um módulo
   */
  const fetchContents = async (moduleId: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contents')
        .select(`
          *,
          content_videos(*),
          content_texts(*),
          content_pdfs(*),
          content_links(*),
          content_assignments(*),
          content_quizzes(*)
        `)
        .eq('module_id', moduleId)
        .order('order_index');

      if (error) throw error;
      
      // Transforma os dados para corresponder às interfaces TypeScript
      const transformedData = data?.map(item => {
        let contentData: Content;
        
        switch (item.type) {
          case 'video':
            contentData = {
              ...item,
              type: 'video',
              video_url: item.content_videos?.video_url,
              video_duration: item.content_videos?.video_duration,
              thumbnail_url: item.content_videos?.thumbnail_url,
              is_uploaded: item.content_videos?.is_uploaded || false
            } as VideoContent;
            break;
          
          case 'text':
            contentData = {
              ...item,
              type: 'text',
              content: item.content_texts?.content || ''
            } as TextContent;
            break;
          
          case 'pdf':
            contentData = {
              ...item,
              type: 'pdf',
              file_url: item.content_pdfs?.file_url,
              file_name: item.content_pdfs?.file_name || '',
              file_size: item.content_pdfs?.file_size,
              is_uploaded: item.content_pdfs?.is_uploaded || false
            } as PdfContent;
            break;
          
          case 'link':
            contentData = {
              ...item,
              type: 'link',
              url: item.content_links?.url || '',
              icon: item.content_links?.icon
            } as LinkContent;
            break;
          
          case 'assignment':
            contentData = {
              ...item,
              type: 'assignment',
              instructions: item.content_assignments?.instructions || '',
              due_date: item.content_assignments?.due_date,
              points: item.content_assignments?.points,
              file_attachments: item.content_assignments?.file_attachments
            } as AssignmentContent;
            break;
          
          case 'quiz':
            contentData = {
              ...item,
              type: 'quiz',
              questions: [], // Precisará buscar as perguntas separadamente
              pass_score: item.content_quizzes?.pass_score || 60,
              time_limit: item.content_quizzes?.time_limit,
              shuffle_questions: item.content_quizzes?.shuffle_questions || false
            } as QuizContent;
            break;
          
          default:
            contentData = item as BaseContent;
        }
        
        return contentData;
      }) || [];
      
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar conteúdos:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cria um novo conteúdo base (comum a todos os tipos)
   */
  const createBaseContent = async (moduleId: number, contentType: ContentType, title: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para criar conteúdo"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Obtém o maior order_index existente
      const { data: contents, error: countError } = await supabase
        .from('contents')
        .select('order_index')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: false })
        .limit(1);
      
      if (countError) throw countError;
      
      const nextOrderIndex = contents && contents.length > 0 ? contents[0].order_index + 1 : 0;
      
      // Cria o conteúdo base
      const { data, error } = await supabase
        .from('contents')
        .insert({
          module_id: moduleId,
          type: contentType,
          title: title || `Novo ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
          order_index: nextOrderIndex
        })
        .select()
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Erro ao criar conteúdo base:`, error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cria um conteúdo de vídeo
   */
  const createVideoContent = async (moduleId: number, title: string) => {
    try {
      const { data: baseContent, error: baseError } = await createBaseContent(moduleId, 'video', title);
      
      if (baseError) throw baseError;
      
      // Cria o registro específico de vídeo
      const { data, error } = await supabase
        .from('content_videos')
        .insert({
          content_id: baseContent.id,
          is_uploaded: false
        })
        .select()
        .single();
      
      if (error) {
        // Rollback: se falhou, remove o conteúdo base
        await supabase.from('contents').delete().eq('id', baseContent.id);
        throw error;
      }
      
      toast({
        title: "Vídeo adicionado",
        description: "Conteúdo de vídeo adicionado com sucesso!"
      });
      
      return { 
        data: {
          ...baseContent,
          type: 'video',
          is_uploaded: data.is_uploaded
        } as VideoContent, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao criar conteúdo de vídeo:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar vídeo",
        description: error.message
      });
      return { data: null, error };
    }
  };

  /**
   * Cria um conteúdo de texto
   */
  const createTextContent = async (moduleId: number, title: string) => {
    try {
      const { data: baseContent, error: baseError } = await createBaseContent(moduleId, 'text', title);
      
      if (baseError) throw baseError;
      
      // Cria o registro específico de texto
      const { data, error } = await supabase
        .from('content_texts')
        .insert({
          content_id: baseContent.id,
          content: '' // Inicialmente vazio
        })
        .select()
        .single();
      
      if (error) {
        // Rollback: se falhou, remove o conteúdo base
        await supabase.from('contents').delete().eq('id', baseContent.id);
        throw error;
      }
      
      toast({
        title: "Texto adicionado",
        description: "Conteúdo de texto adicionado com sucesso!"
      });
      
      return { 
        data: {
          ...baseContent,
          type: 'text',
          content: data.content
        } as TextContent, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao criar conteúdo de texto:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar texto",
        description: error.message
      });
      return { data: null, error };
    }
  };

  /**
   * Cria um conteúdo de PDF
   */
  const createPdfContent = async (moduleId: number, title: string, fileName: string = 'documento.pdf') => {
    try {
      const { data: baseContent, error: baseError } = await createBaseContent(moduleId, 'pdf', title);
      
      if (baseError) throw baseError;
      
      // Cria o registro específico de PDF
      const { data, error } = await supabase
        .from('content_pdfs')
        .insert({
          content_id: baseContent.id,
          file_name: fileName,
          is_uploaded: false
        })
        .select()
        .single();
      
      if (error) {
        // Rollback: se falhou, remove o conteúdo base
        await supabase.from('contents').delete().eq('id', baseContent.id);
        throw error;
      }
      
      toast({
        title: "PDF adicionado",
        description: "Conteúdo de PDF adicionado com sucesso!"
      });
      
      return { 
        data: {
          ...baseContent,
          type: 'pdf',
          file_name: data.file_name,
          is_uploaded: data.is_uploaded
        } as PdfContent, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao criar conteúdo de PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar PDF",
        description: error.message
      });
      return { data: null, error };
    }
  };

  /**
   * Cria um conteúdo de link
   */
  const createLinkContent = async (moduleId: number, title: string, url: string = '') => {
    try {
      const { data: baseContent, error: baseError } = await createBaseContent(moduleId, 'link', title);
      
      if (baseError) throw baseError;
      
      // Cria o registro específico de link
      const { data, error } = await supabase
        .from('content_links')
        .insert({
          content_id: baseContent.id,
          url: url
        })
        .select()
        .single();
      
      if (error) {
        // Rollback: se falhou, remove o conteúdo base
        await supabase.from('contents').delete().eq('id', baseContent.id);
        throw error;
      }
      
      toast({
        title: "Link adicionado",
        description: "Link externo adicionado com sucesso!"
      });
      
      return { 
        data: {
          ...baseContent,
          type: 'link',
          url: data.url
        } as LinkContent, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao criar conteúdo de link:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar link",
        description: error.message
      });
      return { data: null, error };
    }
  };

  /**
   * Cria um conteúdo de tarefa/exercício
   */
  const createAssignmentContent = async (moduleId: number, title: string) => {
    try {
      const { data: baseContent, error: baseError } = await createBaseContent(moduleId, 'assignment', title);
      
      if (baseError) throw baseError;
      
      // Cria o registro específico de tarefa
      const { data, error } = await supabase
        .from('content_assignments')
        .insert({
          content_id: baseContent.id,
          instructions: ''
        })
        .select()
        .single();
      
      if (error) {
        // Rollback: se falhou, remove o conteúdo base
        await supabase.from('contents').delete().eq('id', baseContent.id);
        throw error;
      }
      
      toast({
        title: "Tarefa adicionada",
        description: "Tarefa adicionada com sucesso!"
      });
      
      return { 
        data: {
          ...baseContent,
          type: 'assignment',
          instructions: data.instructions
        } as AssignmentContent, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar tarefa",
        description: error.message
      });
      return { data: null, error };
    }
  };

  /**
   * Cria um conteúdo de quiz
   */
  const createQuizContent = async (moduleId: number, title: string) => {
    try {
      const { data: baseContent, error: baseError } = await createBaseContent(moduleId, 'quiz', title);
      
      if (baseError) throw baseError;
      
      // Cria o registro específico de quiz
      const { data, error } = await supabase
        .from('content_quizzes')
        .insert({
          content_id: baseContent.id,
          pass_score: 60,
          shuffle_questions: false
        })
        .select()
        .single();
      
      if (error) {
        // Rollback: se falhou, remove o conteúdo base
        await supabase.from('contents').delete().eq('id', baseContent.id);
        throw error;
      }
      
      toast({
        title: "Quiz adicionado",
        description: "Quiz adicionado com sucesso!"
      });
      
      return { 
        data: {
          ...baseContent,
          type: 'quiz',
          questions: [],
          pass_score: data.pass_score,
          shuffle_questions: data.shuffle_questions
        } as QuizContent, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao criar quiz:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar quiz",
        description: error.message
      });
      return { data: null, error };
    }
  };

  /**
   * Deleta um conteúdo e seus dados específicos
   */
  const deleteContent = async (contentId: number, contentType: ContentType) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para deletar conteúdo"
      });
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Deleta mídia associada se necessário
      if (contentType === 'video') {
        const { data } = await supabase
          .from('content_videos')
          .select('video_url')
          .eq('content_id', contentId)
          .single();
          
        if (data?.video_url) {
          await deleteMediaByUrl(data.video_url);
        }
      }
      
      if (contentType === 'pdf') {
        const { data } = await supabase
          .from('content_pdfs')
          .select('file_url')
          .eq('content_id', contentId)
          .single();
          
        if (data?.file_url) {
          await deleteMediaByUrl(data.file_url);
        }
      }
      
      // Deleta o conteúdo base (as tabelas específicas serão deletadas em cascata)
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', contentId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao deletar conteúdo",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Conteúdo deletado",
        description: "Conteúdo deletado com sucesso!"
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao deletar conteúdo:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reordena conteúdos de um módulo
   */
  const reorderContents = async (moduleId: number, contentIds: number[]) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para reordenar conteúdos"
      });
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Cria transações para atualizar cada conteúdo com seu novo índice
      const updates = contentIds.map((id, index) => ({
        id,
        order_index: index
      }));
      
      const { error } = await supabase.from('contents').upsert(updates);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao reordenar conteúdos",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Conteúdos reordenados",
        description: "A ordem dos conteúdos foi atualizada!"
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao reordenar conteúdos:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Retorna todas as funções disponíveis
  return {
    isLoading,
    
    // Funções para módulos
    fetchModules,
    fetchModuleById,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    
    // Funções para conteúdos
    fetchContents,
    createVideoContent,
    createTextContent,
    createPdfContent,
    createLinkContent,
    createAssignmentContent,
    createQuizContent,
    deleteContent,
    reorderContents
  };
} 