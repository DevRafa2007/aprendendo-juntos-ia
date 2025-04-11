# Documentação do Projeto Aprendendo Juntos IA

## Visão Geral
Este é um projeto de plataforma de cursos online desenvolvido com React, TypeScript, Vite e Supabase. A aplicação utiliza uma arquitetura moderna com componentes reutilizáveis e uma estrutura bem organizada.

## Tecnologias Principais
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Supabase (autenticação, banco de dados e armazenamento de mídia)
- React Query
- React Router DOM

## Estrutura do Projeto

### Diretórios Principais

#### `/src`
- **/components**: Componentes reutilizáveis da aplicação
  - `/ui`: Componentes de UI base (shadcn)
  - `/content`: Componentes de conteúdo do curso (ContentEditor, VideoPlayer, TextPlayer, QuizPlayer, DocumentPlayer)
  - `Navbar.tsx`: Barra de navegação principal
  - `Footer.tsx`: Rodapé da aplicação
  - `CourseCard.tsx`: Card para exibição de cursos
  - `AuthGuard.tsx`: Componente de proteção de rotas
  - `CategorySelector.tsx`: Seletor de categorias e matérias
  - `ImageUploader.tsx`: Componente para upload de imagens
  - `CourseProgress.tsx`: Componente para exibir progresso do curso do aluno

- **/pages**: Páginas principais da aplicação
  - `Index.tsx`: Página inicial
  - `Courses.tsx`: Listagem de cursos
  - `CourseDetail.tsx`: Detalhes do curso
  - `CreateCourse.tsx`: Criação de cursos
  - `Auth.tsx`: Autenticação
  - `Profile.tsx`: Perfil do usuário
  - `Support.tsx`: Página de suporte
  - `NotFound.tsx`: Página 404

- **/context**: Contextos da aplicação
  - `AuthContext.tsx`: Contexto de autenticação
  - `ProgressContext.tsx`: Contexto de progresso do aluno

- **/hooks**: Hooks personalizados
  - `useCourses.ts`: Gerenciamento de cursos
  - `useMediaUpload.ts`: Upload de mídia (imagens, vídeos, documentos)
  - `useCourseContent.ts`: Gerenciamento de conteúdo do curso
  - `useProfile.ts`: Gerenciamento de perfil do usuário
  - `useEnrollment.ts`: Gerenciamento de matrículas
  - `useContentProgress.ts`: Rastreamento de progresso do aluno em conteúdos

- **/lib**: Utilitários e configurações
  - `utils.ts`: Funções utilitárias
  - `categories.ts`: Dados de categorias e matérias
  - `timeFormat.ts`: Funções de formatação de tempo

- **/services**: Serviços da aplicação
  - `mediaService.ts`: Serviços para upload e gerenciamento de mídia com Supabase Storage
    - Upload de imagens, vídeos e documentos
    - Progresso personalizado para uploads
    - Remoção de arquivos
    - Utilitários para manipulação de arquivos

- **/integrations**: Integrações com serviços externos
  - `/supabase`: Configurações e funções do Supabase
    - `client.ts`: Cliente Supabase e funções para gerenciamento de buckets
    - `types.ts`: Tipagem para o banco de dados Supabase
  - `/firebase`: Configurações e funções do Firebase

- **/db**: Esquemas e scripts de banco de dados
  - `supabase-schema.sql`: Esquema principal do banco de dados
  - `supabase-schema-update.sql`: Versão modificada do esquema para aplicação segura
  - `update-schema.sql`: Scripts de atualização do esquema

### Configurações
- `package.json`: Dependências e scripts
- `tsconfig.json`: Configurações do TypeScript
- `vite.config.ts`: Configurações do Vite
- `tailwind.config.ts`: Configurações do Tailwind CSS
- `eslint.config.js`: Configurações do ESLint

## Estado Atual das Páginas

### Página Inicial (`Index.tsx`)
**Status**: Implementada
**Funcionalidades**:
- Exibição de cursos em destaque
- Categorias principais
- Seção de estatísticas
- Seção de destaque (hero)

**Pendências**:
- Integração real com API para cursos em destaque (atualmente usa dados simulados)
- Implementar carrossel de depoimentos

### Listagem de Cursos (`Courses.tsx`)
**Status**: Implementada
**Funcionalidades**:
- Listagem de cursos
- Filtros por categoria, matéria, preço e duração
- Busca por texto
- Paginação

**Pendências**:
- Integração real com API (atualmente usa dados simulados)
- Implementar filtros avançados
- Melhorar desempenho da busca

### Detalhes do Curso (`CourseDetail.tsx`)
**Status**: Implementada
**Funcionalidades**:
- Exibição de informações do curso
- Lista de módulos e aulas
- Informações do instrutor
- Botão de matrícula
- Visualização de progresso para alunos matriculados ✅

**Pendências**:
- Implementar avaliações e comentários

### Criação de Cursos (`CreateCourse.tsx`)
**Status**: Implementada ✅
**Funcionalidades**:
- Formulário de criação de curso em três etapas:
  1. Informações básicas (título, descrição, categoria, imagem, duração, nível)
  2. Conteúdo (módulos e aulas)
  3. Preços e publicação
- Upload de imagens, vídeos e documentos
- Validação de formulário
- Organização do conteúdo em módulos e aulas

**Melhorias recentes**:
- Implementado o editor de conteúdo (ContentEditor) com suporte a:
  - Vídeos com thumbnail e duração
  - Documentos PDF/DOCX com visualização
  - Conteúdos de texto
  - Quizzes interativos com avaliação

**Pendências**:
- Implementar editor de rich text para conteúdo de texto
- Implementar prévia do curso

### Autenticação (`Auth.tsx`)
**Status**: Implementada
**Funcionalidades**:
- Login com email/senha
- Cadastro de novos usuários
- Recuperação de senha
- Login persistente
- Proteção de rotas com AuthGuard

**Pendências**:
- Implementar login social (Google, GitHub)
- Melhorar validação e feedback de erros

### Perfil do Usuário (`Profile.tsx`)
**Status**: Implementada
**Funcionalidades**:
- Visualização e edição de perfil
- Listagem de cursos matriculados
- Acesso aos cursos criados (para instrutores)
- Configurações da conta
- Histórico de progresso ✅

**Pendências**:
- Adicionar certificados
- Melhorar gestão de pagamentos

### Suporte (`Support.tsx`)
**Status**: Implementada
**Funcionalidades**:
- FAQ
- Formulário de contato
- Artigos de ajuda

**Pendências**:
- Integrar sistema de tickets
- Implementar chat de suporte

## Estado Atual dos Componentes

### Sistema de Progresso do Aluno
**Status**: Implementado ✅
**Componentes principais**:
- `ProgressContext.tsx`: Contexto global para gerenciar progresso
- `CourseProgress.tsx`: Visualização do progresso em um curso
- `VideoPlayer.tsx`: Player de vídeo com rastreamento de progresso
- `TextPlayer.tsx`: Visualizador de conteúdo de texto com rastreamento de leitura
- `QuizPlayer.tsx`: Motor de quiz interativo com avaliação
- `DocumentPlayer.tsx`: Visualizador de documentos PDF e outros arquivos

**Funcionalidades**:
- Rastreamento do progresso do aluno em diferentes tipos de conteúdo
- Marcação automática de conteúdo como concluído (baseado em critérios como visualização de 90% do vídeo)
- Persistência do progresso no localStorage
- Preparado para futura integração com o backend
- Visualização do progresso geral do curso e por módulo
- Continuação de onde o aluno parou (posição no vídeo, última página no documento)

### ContentEditor
**Status**: Implementado ✅
**Funcionalidades**:
- Editor de conteúdo para diferentes tipos (vídeo, texto, PDF, quiz)
- Interface de abas para cada tipo de conteúdo
- Validação de conteúdo
- Upload de mídia

**Pendências**:
- Adicionar editor de rich text
- Implementar arrastar e soltar para reorganizar conteúdos

### VideoPlayer
**Status**: Implementado ✅
**Funcionalidades**:
- Reprodução de vídeos
- Controles personalizados (play/pause, volume, tela cheia)
- Rastreamento de progresso
- Marcação automática como concluído
- Salvamento da posição atual
- Interface amigável com indicadores de progresso

### TextPlayer
**Status**: Implementado ✅
**Funcionalidades**:
- Exibição de conteúdo formatado com Markdown
- Rastreamento do progresso de leitura baseado na rolagem
- Tempo estimado de leitura
- Marcação automática como concluído ao ler o conteúdo

### QuizPlayer
**Status**: Implementado ✅
**Funcionalidades**:
- Suporte a diferentes tipos de questões (única escolha, múltipla escolha, verdadeiro/falso)
- Avaliação automática
- Feedback imediato sobre respostas
- Tempo limite para resposta
- Exibição de resultados e explicações
- Marcação como concluído baseado no desempenho
- Editor de quiz completo com funcionalidades de:
  - Adição de perguntas
  - Edição de perguntas e opções
  - Exclusão de perguntas
  - Configuração de respostas corretas para cada tipo de questão

### DocumentPlayer
**Status**: Implementado ✅
**Funcionalidades**:
- Visualização de PDFs diretamente no navegador
- Controles de navegação de página
- Suporte para download de diferentes tipos de documento
- Rastreamento da leitura
- Salvamento da última página visualizada

### DocumentUploader
**Status**: Implementado ✅
**Funcionalidades**:
- Upload de documentos (PDF, DOCX)
- Preview de documentos
- Validação de tipo e tamanho
- Interface de arrastar e soltar
- Gerenciamento de documentos (download, exclusão)

### VideoUploader
**Status**: Implementado ✅
**Funcionalidades**:
- Upload de vídeos
- Extração de thumbnail
- Cálculo de duração
- Interface de upload com arrastar e soltar

### ImageUploader
**Status**: Implementado ✅
**Funcionalidades**:
- Upload de imagens
- Preview de imagens
- Validação de tipo e tamanho
- Interface de arrastar e soltar
- Recorte de imagem

### CategorySelector
**Status**: Implementado ✅
**Funcionalidades**:
- Seleção de categorias principais
- Seleção de matérias específicas
- Interface interativa com cards

## Estrutura do Banco de Dados

### Tabelas Principais
- **profiles**: Perfis de usuários
- **courses**: Cursos
- **modules**: Módulos do curso
- **contents**: Conteúdos dos módulos
- **content_videos**: Conteúdo de vídeo
- **content_texts**: Conteúdo de texto
- **content_pdfs**: Conteúdo de PDF
- **content_quizzes**: Conteúdo de quiz
- **quiz_questions**: Perguntas de quiz
- **quiz_options**: Opções para perguntas de quiz
- **enrollments**: Matrículas dos alunos
- **student_progress**: Progresso dos alunos
- **quiz_results**: Resultados de quiz
- **quiz_answers**: Respostas às perguntas de quiz
- **course_reviews**: Avaliações de cursos
- **media_uploads**: Uploads de mídia

### Armazenamento
- **course-images**: Imagens de capa dos cursos
- **course-videos**: Vídeos das aulas
- **course-documents**: Documentos e materiais de apoio

## Próximos Passos

### Prioridade Alta
1. **Implementar Sistema de Notificações**: Alertas para alunos sobre novas aulas, comentários, etc.
2. **Melhorar o Editor de Conteúdo**: Adicionar rich text para conteúdo textual, aprimorar editor de quizzes.
3. **Implementar Sistema de Avaliações e Comentários**: Permitir que alunos avaliem e comentem nos cursos.
4. **Sincronização com Backend**: Integrar o sistema de progresso com o backend para persistência entre dispositivos.

### Prioridade Média
1. **Certificados de Conclusão**: Gerar certificados para cursos concluídos.
2. **Estatísticas para Instrutores**: Dashboard com estatísticas de engajamento e progresso dos alunos.
3. **Gamificação**: Adicionar elementos como badges, pontos e rankings para aumentar o engajamento.

### Prioridade Baixa
1. **Modo Offline**: Permitir baixar conteúdo para acesso offline.
2. **Personalização de Tema**: Opções de personalização de interface (modo claro/escuro).
3. **Integração com Fóruns de Discussão**: Espaço para discussão entre alunos e instrutores.

## Atualizações e Melhorias Recentes

### Infraestrutura e Serviços
- **Migração completa para Supabase Storage**: Substituição do Firebase Storage pelo Supabase Storage
  - Implementação de buckets específicos para diferentes tipos de mídia (course-images, course-videos, course-documents)
  - Criação de funções para gerenciamento de buckets
  - Rastreamento de progresso personalizado para uploads
  - Funções auxiliares para manipulação de arquivos (nomes, extensões, URLs)
- **Sistema de Sincronização de Progresso**: Implementação completa do sistema de sincronização entre frontend e backend
  - Tabelas otimizadas para armazenar progresso do aluno (student_progress_sync)
  - Sistema de rastreamento de interações com conteúdo (content_interactions)
  - Fila de sincronização para operações offline (sync_queue)
  - Rastreamento de sessões de usuário para sincronização multi-dispositivo
  - Regras de segurança (RLS) para proteger dados de progresso do aluno
  - Funções e triggers para atualização automática de timestamps

### Correções de Bugs
- **Tipagem em Componentes**: Resolução de problemas de tipagem e uso de 'any' em diversos componentes
- **CategorySelector**: Correção de funcionalidades de seleção e interface
- **ProgressContext**: Correção de referências de user.uid para user.id e ajuste de importações
- **Upload de Mídia**: Resolução de problemas de CORS e correção de caminhos de arquivos que usavam "undefined" como userId
- **Esquema de Banco de Dados**: Correção de erros de sintaxe em scripts SQL de sincronização

### Novas Funcionalidades
- **Editor de Quiz**: Implementação completa do editor para criar, editar e excluir perguntas com diferentes tipos de resposta
- **Tratamento de Erros**: Adição de logs detalhados e tratamento de exceções para facilitar depuração
- **Monitoramento de Progresso**: Aprimoramento no sistema de rastreamento de progresso de uploads e visualização de conteúdo
- **Sincronização Offline-Online**: Capacidade de trabalhar offline e sincronizar quando a conexão é restabelecida

## Próximos Passos Atualizados

### Fase 1: Sistema de Avaliações e Feedback
**Status**: Em andamento
**Tarefas**:
- [x] Implementar modelo de dados para avaliações de cursos
- [x] Criar componente de exibição de avaliações (ReviewItem)
- [x] Implementar classificação com estrelas (StarRating)
- [x] Desenvolver formulário de criação/edição de avaliações (ReviewForm)
- [x] Criar componente para listar avaliações com filtros e paginação (ReviewList)
- [x] Integrar sistema de avaliações na página de detalhes do curso
- [ ] Implementar sistema de reações às avaliações (útil/não útil)
- [ ] Integrar sistema de denúncias de avaliações
- [ ] Implementar sistema de moderação de avaliações 
- [ ] Adicionar métricas e resumos de avaliações (média, distribuição)
- [ ] Implementar sistema de respostas do instrutor às avaliações
- [ ] Criar página de administração para gerenciar avaliações

**Próximos passos imediatos**:
1. Testar e corrigir bugs no sistema de avaliações
2. Implementar a moderação de avaliações por instrutores e administradores
3. Adicionar validações para verificar se o usuário concluiu pelo menos parte do curso antes de avaliar

### Fase 2: Melhorias na Experiência do Usuário
**Status**: Planejado
**Tarefas**:
- [ ] Implementar modo escuro/claro com preferências salvas
- [ ] Melhorar responsividade em dispositivos móveis
- [ ] Adicionar animações e transições para uma experiência mais fluida
- [ ] Implementar sistema de notificações in-app
- [ ] Desenvolver tour guiado para novos usuários

### Fase 3: Recursos de Comunidade e Interação
**Status**: Planejado
**Tarefas**:
- [ ] Implementar fóruns de discussão por curso
- [ ] Adicionar sistema de mensagens diretas entre alunos e instrutores
- [ ] Desenvolver área de comunidade para compartilhamento de recursos
- [ ] Implementar recursos de colaboração em tempo real

### Fase 4: Gamificação e Engajamento
**Status**: Planejado
**Tarefas**:
- [ ] Desenvolver sistema de conquistas e badges
- [ ] Implementar níveis de experiência para alunos
- [ ] Adicionar desafios semanais e competições
- [ ] Criar tabelas de classificação por curso e global 

## Correções de Bugs e Melhorias Recentes

### Correções na Integração com Supabase
- **Tipagem correta**: Correção dos erros de TypeScript relacionados à tipagem no cliente Supabase
- **Manipulação de erros**: Melhoria na forma como erros do Supabase são capturados e exibidos para o usuário
- **Carregamento de perfil**: Correção de bugs no carregamento de dados de perfil do usuário
- **Feedback visual**: Adição de indicadores de carregamento para melhor experiência do usuário
- **Logs detalhados**: Implementação de logs detalhados para facilitar a depuração de problemas de conexão
- **Prevenção de deadlocks**: Uso correto de setTimeout para evitar deadlocks ao buscar dados de perfil após autenticação
- **Upload de avatar**: Correção na funcionalidade de upload de avatar para perfil de usuário

### Melhorias na Página de Perfil
- **Tratamento de estados**: Melhor gerenciamento de estados de carregamento e exibição de dados
- **Validação de dados**: Corrigido problema com campos obrigatórios ao exibir dados de perfil
- **Experiência do usuário**: Implementação de feedback visual durante operações assíncronas
- **Edição de perfil**: Simplificação do fluxo de edição de informações de perfil
- **Visualização de cursos**: Corrigida a exibição de cursos em andamento e concluídos do usuário

### Melhorias de Performance e UX
- **Inicialização otimizada**: Melhor sequência de inicialização do cliente Supabase
- **Gestão de sessão**: Tratamento correto da sessão do usuário para evitar problemas de autenticação
- **Prevenção de erros**: Verificações mais robustas antes de realizar operações que exigem autenticação
- **Consistência de dados**: Garantia de que os dados apresentados são atualizados após modificações
