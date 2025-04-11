import { CategoryType, SubjectType } from '@/lib/categories';

// Tipos para o formulário de criação de curso
export interface CourseFormValues {
  title: string;
  description: string;
  category: string;
  subject: string | null;
  duration: number;
  level: 'iniciante' | 'intermediario' | 'avancado' | 'todos';
  price: number;
  image_url: string | null;
}

// Tipos para a estrutura completa de um curso
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  categorySlug?: string;
  subject: string | null;
  subjectSlug?: string;
  duration: number;
  level: 'iniciante' | 'intermediario' | 'avancado' | 'todos';
  price: number;
  image_url: string | null;
  instructor_id: string;
  instructor_name?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  slug?: string;
  modules?: Module[];
}

// Tipos para os módulos do curso
export interface Module {
  id: number;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  contents: Content[];
}

// Tipo base para conteúdos
export interface BaseContent {
  id: number;
  module_id: number;
  type: ContentType;
  title: string;
  description?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export type ContentType = 'video' | 'text' | 'pdf' | 'assignment' | 'quiz' | 'link';

// Tipos específicos para cada tipo de conteúdo
export interface VideoContent extends BaseContent {
  type: 'video';
  video_url?: string;
  video_duration?: number;
  thumbnail_url?: string;
  is_uploaded: boolean;
}

export interface TextContent extends BaseContent {
  type: 'text';
  content: string; // Conteúdo HTML para texto rico
}

export interface PdfContent extends BaseContent {
  type: 'pdf';
  file_url?: string;
  file_name: string;
  file_size?: number;
  is_uploaded: boolean;
}

export interface LinkContent extends BaseContent {
  type: 'link';
  url: string;
  icon?: string;
}

export interface AssignmentContent extends BaseContent {
  type: 'assignment';
  instructions: string;
  due_date?: string;
  points?: number;
  file_attachments?: string[];
}

export interface QuizContent extends BaseContent {
  type: 'quiz';
  questions: QuizQuestion[];
  pass_score: number; // Porcentagem necessária para passar
  time_limit?: number; // Limite de tempo em minutos (opcional)
  shuffle_questions: boolean;
}

export interface QuizQuestion {
  id: number;
  text: string;
  type: 'single' | 'multiple' | 'text'; // Tipo de questão
  options?: QuizOption[]; // Para questões de escolha
  correct_answers: string[] | number[]; // IDs das opções corretas ou texto para respostas abertas
  points: number;
  explanation?: string; // Explicação da resposta para feedback
}

export interface QuizOption {
  id: number;
  text: string;
}

// União dos tipos de conteúdo
export type Content = 
  | VideoContent 
  | TextContent 
  | PdfContent 
  | LinkContent 
  | AssignmentContent 
  | QuizContent; 