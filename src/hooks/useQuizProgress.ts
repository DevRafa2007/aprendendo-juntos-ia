import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEnrollment } from './useEnrollment';
import { useContentProgress } from './useContentProgress';

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  text: string;
  type: 'single' | 'multiple' | 'text';
  points: number;
  explanation: string | null;
  order_index: number;
  options?: QuizOption[];
}

export interface QuizOption {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
}

export interface QuizResultType {
  id: number;
  enrollment_id: number;
  quiz_id: number;
  score: number;
  max_score: number;
  passed: boolean;
  started_at: string;
  completed_at: string;
  time_spent: number; // em segundos
}

export interface QuizAnswerType {
  id: number;
  result_id: number;
  question_id: number;
  selected_options: number[] | null;
  text_answer: string | null;
  is_correct: boolean;
  points_earned: number;
}

export interface QuizSubmissionData {
  quizId: number;
  startedAt: string;
  answers: {
    questionId: number;
    selectedOptions?: number[];
    textAnswer?: string;
  }[];
}

export function useQuizProgress() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { checkEnrollment } = useEnrollment();
  const { markContentAsCompleted } = useContentProgress();

  /**
   * Busca as questões e opções de um quiz
   */
  const getQuizQuestions = async (quizId: number) => {
    try {
      setIsLoading(true);
      
      // Buscar as questões
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;

      // Para cada questão, buscar as opções
      const questionsWithOptions = await Promise.all(
        questions.map(async (question) => {
          const { data: options, error: optionsError } = await supabase
            .from('quiz_options')
            .select('*')
            .eq('question_id', question.id);

          if (optionsError) throw optionsError;

          // Para alunos, não retornar a informação de qual opção é correta
          const sanitizedOptions = user?.id ? 
            options.map(opt => ({ ...opt, is_correct: undefined })) : 
            options;

          return {
            ...question,
            options: sanitizedOptions
          };
        })
      );

      return { data: questionsWithOptions, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar questões do quiz:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica se um usuário já completou um quiz
   */
  const hasCompletedQuiz = async (courseId: string, quizId: number) => {
    if (!user) {
      return { completed: false, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);

      // Verificar se o usuário está inscrito no curso
      const { isEnrolled, enrollmentData } = await checkEnrollment(courseId);

      if (!isEnrolled || !enrollmentData) {
        return { completed: false, error: new Error('Usuário não inscrito no curso') };
      }

      // Verificar se existe um resultado para o quiz
      const { data, error } = await supabase
        .from('quiz_results')
        .select('passed')
        .eq('enrollment_id', enrollmentData.id)
        .eq('quiz_id', quizId)
        .maybeSingle();

      if (error) throw error;

      return { 
        completed: !!data, 
        passed: data?.passed || false, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao verificar se quiz foi completado:', error);
      return { completed: false, passed: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Submete as respostas de um quiz
   */
  const submitQuiz = async (courseId: string, contentId: number, submissionData: QuizSubmissionData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para submeter um quiz"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);

      // Verificar se o usuário está inscrito no curso
      const { isEnrolled, enrollmentData } = await checkEnrollment(courseId);

      if (!isEnrolled || !enrollmentData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você não está inscrito neste curso"
        });
        return { data: null, error: new Error('Usuário não inscrito no curso') };
      }

      // Buscar informações do quiz
      const { data: quizData, error: quizError } = await supabase
        .from('content_quizzes')
        .select('*')
        .eq('content_id', contentId)
        .single();

      if (quizError) throw quizError;

      // Buscar todas as questões e suas opções corretas
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          quiz_options (
            id,
            is_correct
          )
        `)
        .eq('quiz_id', submissionData.quizId);

      if (questionsError) throw questionsError;

      // Calcular a pontuação
      let totalScore = 0;
      let maxScore = 0;
      const answersToSave: any[] = [];

      // Para cada questão, verificar se a resposta está correta
      for (const question of questions) {
        maxScore += question.points;
        
        const userAnswer = submissionData.answers.find(
          a => a.questionId === question.id
        );

        if (!userAnswer) continue;

        let isCorrect = false;
        let pointsEarned = 0;

        if (question.type === 'text') {
          // Para perguntas de texto, precisaria de uma lógica de correção mais complexa
          // Neste exemplo, apenas marcamos como correto se houver texto
          isCorrect = !!userAnswer.textAnswer;
          pointsEarned = isCorrect ? question.points : 0;
        } else {
          // Para perguntas de escolha única ou múltipla
          const correctOptionIds = question.quiz_options
            .filter((opt: any) => opt.is_correct)
            .map((opt: any) => opt.id);

          // Verificar se as opções selecionadas pelo usuário correspondem às corretas
          const selectedIds = userAnswer.selectedOptions || [];
          
          if (question.type === 'single') {
            // Para questões de escolha única, a resposta está correta se selecionou a opção correta
            isCorrect = selectedIds.length === 1 && correctOptionIds.includes(selectedIds[0]);
          } else if (question.type === 'multiple') {
            // Para questões de múltipla escolha, todas as opções corretas devem ser selecionadas
            // e nenhuma incorreta deve ser selecionada
            const allCorrectSelected = correctOptionIds.every(id => selectedIds.includes(id));
            const noIncorrectSelected = selectedIds.every(id => correctOptionIds.includes(id));
            isCorrect = allCorrectSelected && noIncorrectSelected;
          }
          
          pointsEarned = isCorrect ? question.points : 0;
        }

        totalScore += pointsEarned;

        // Preparar dados da resposta para salvar
        answersToSave.push({
          question_id: question.id,
          selected_options: userAnswer.selectedOptions || null,
          text_answer: userAnswer.textAnswer || null,
          is_correct: isCorrect,
          points_earned: pointsEarned
        });
      }

      // Verificar se o aluno passou no quiz
      const percentageScore = (totalScore / maxScore) * 100;
      const passed = percentageScore >= quizData.pass_score;

      // Calcular o tempo gasto
      const startTime = new Date(submissionData.startedAt).getTime();
      const endTime = new Date().getTime();
      const timeSpentSeconds = Math.round((endTime - startTime) / 1000);

      // Salvar o resultado do quiz
      const { data: resultData, error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          enrollment_id: enrollmentData.id,
          quiz_id: submissionData.quizId,
          score: totalScore,
          max_score: maxScore,
          passed,
          started_at: submissionData.startedAt,
          completed_at: new Date().toISOString(),
          time_spent: timeSpentSeconds
        })
        .select()
        .single();

      if (resultError) throw resultError;

      // Salvar as respostas
      const answersWithResultId = answersToSave.map(answer => ({
        ...answer,
        result_id: resultData.id
      }));

      const { error: answersError } = await supabase
        .from('quiz_answers')
        .insert(answersWithResultId);

      if (answersError) throw answersError;

      // Se passou no quiz, marcar o conteúdo como concluído
      if (passed) {
        await markContentAsCompleted(courseId, contentId);
      }

      // Exibir mensagem de sucesso ou falha
      if (passed) {
        toast({
          title: "Quiz concluído com sucesso!",
          description: `Você acertou ${totalScore} de ${maxScore} pontos (${Math.round(percentageScore)}%)`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Você não atingiu a pontuação mínima",
          description: `Sua pontuação: ${Math.round(percentageScore)}%. Mínimo necessário: ${quizData.pass_score}%`
        });
      }

      return { 
        data: { 
          result: resultData, 
          score: totalScore, 
          maxScore, 
          percentage: percentageScore, 
          passed 
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao submeter quiz:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar quiz",
        description: "Ocorreu um erro ao processar suas respostas"
      });
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca os resultados anteriores de um quiz
   */
  const getQuizResults = async (courseId: string, quizId: number) => {
    if (!user) {
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);

      // Verificar se o usuário está inscrito no curso
      const { isEnrolled, enrollmentData } = await checkEnrollment(courseId);

      if (!isEnrolled || !enrollmentData) {
        return { data: null, error: new Error('Usuário não inscrito no curso') };
      }

      // Buscar os resultados
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('enrollment_id', enrollmentData.id)
        .eq('quiz_id', quizId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar resultados do quiz:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca os detalhes de um resultado específico de quiz
   */
  const getQuizResultDetails = async (resultId: number) => {
    if (!user) {
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);

      // Buscar o resultado
      const { data: result, error: resultError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (resultError) throw resultError;

      // Verificar se o resultado pertence ao usuário atual
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('user_id')
        .eq('id', result.enrollment_id)
        .single();

      if (enrollmentError) throw enrollmentError;

      if (enrollment.user_id !== user.id) {
        return { data: null, error: new Error('Você não tem permissão para acessar este resultado') };
      }

      // Buscar as respostas
      const { data: answers, error: answersError } = await supabase
        .from('quiz_answers')
        .select(`
          *,
          quiz_questions (
            text,
            type,
            points,
            explanation
          )
        `)
        .eq('result_id', resultId);

      if (answersError) throw answersError;

      return { 
        data: { 
          result, 
          answers 
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do resultado do quiz:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getQuizQuestions,
    hasCompletedQuiz,
    submitQuiz,
    getQuizResults,
    getQuizResultDetails
  };
} 