import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard, { CourseProps } from '@/components/CourseCard';
import SubjectCard from '@/components/SubjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, FileText, Video, Clock, Award, 
  X, ChevronDown, Check, BookOpen, SortAsc
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subjects, getSubjectsByCategory, initializedCategories } from '@/lib/categories';

const Courses = () => {
  // Estado dos filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 300]);
  const [showFilters, setShowFilters] = useState(false);

  // Dados simulados de cursos
  const allCourses: CourseProps[] = [
    // Combinando cursos da página inicial
    {
      id: '1',
      title: 'Pré-aceleração Sebrae Startups',
      category: 'Inovação',
      categorySlug: 'inovacao',
      image: 'https://picsum.photos/id/20/600/400',
      instructor: 'João Silva',
      duration: '85h',
      completionTime: '120 dias',
      isFree: true,
      slug: 'pre-aceleracao-sebrae-startups',
    },
    {
      id: '2',
      title: 'Curso Marketing digital para sua empresa: equipe comercial',
      category: 'Mercado e Vendas',
      categorySlug: 'mercado-vendas',
      image: 'https://picsum.photos/id/21/600/400',
      instructor: 'Maria Oliveira',
      duration: '3h',
      completionTime: '30 dias',
      isFree: true,
      slug: 'marketing-digital-equipe-comercial',
    },
    {
      id: '3',
      title: 'Legislação e negócios para o audiovisual',
      category: 'Negócios',
      categorySlug: 'negocios',
      image: 'https://picsum.photos/id/22/600/400',
      instructor: 'Pedro Santos',
      duration: '12h',
      completionTime: '30 dias',
      isFree: true,
      slug: 'legislacao-negocios-audiovisual',
    },
    {
      id: '4',
      title: 'React e TypeScript: desenvolvendo uma aplicação completa',
      category: 'Tecnologia',
      categorySlug: 'tecnologia',
      image: 'https://picsum.photos/id/23/600/400',
      instructor: 'Amanda Costa',
      duration: '40h',
      completionTime: '60 dias',
      isFree: false,
      price: 149.99,
      slug: 'react-typescript-aplicacao-completa',
    },
    {
      id: '5',
      title: 'Curso Marketing Digital para sua empresa: primeiros passos',
      category: 'Marketing',
      categorySlug: 'marketing',
      image: 'https://picsum.photos/id/25/600/400',
      instructor: 'Lucas Mendes',
      duration: '6h',
      completionTime: '30 dias',
      isFree: true,
      slug: 'marketing-digital-primeiros-passos',
    },
    {
      id: '6',
      title: 'Formação pedagógica: empreendedorismo e BNCC',
      category: 'Educação',
      categorySlug: 'educacao',
      image: 'https://picsum.photos/id/26/600/400',
      instructor: 'Carla Lima',
      duration: '40h',
      completionTime: '45 dias',
      isFree: true,
      slug: 'formacao-pedagogica-empreendedorismo',
    },
    {
      id: '7',
      title: 'Comercialização e distribuição para o Audiovisual',
      category: 'Negócios',
      categorySlug: 'negocios',
      image: 'https://picsum.photos/id/27/600/400',
      instructor: 'Roberto Alves',
      duration: '34h',
      completionTime: '30 dias',
      isFree: true,
      slug: 'comercializacao-distribuicao-audiovisual',
    },
    {
      id: '8',
      title: 'LGPD para gestão pública',
      category: 'Legislação',
      categorySlug: 'legislacao',
      image: 'https://picsum.photos/id/28/600/400',
      instructor: 'Juliana Paiva',
      duration: '6h',
      completionTime: '15 dias',
      isFree: true,
      slug: 'lgpd-gestao-publica',
    },
    {
      id: '9',
      title: 'Inteligência Artificial: Implementação Prática com Python',
      category: 'Tecnologia',
      categorySlug: 'tecnologia',
      image: 'https://picsum.photos/id/29/600/400',
      instructor: 'Rafael Costa',
      duration: '50h',
      completionTime: '60 dias',
      isFree: false,
      price: 289.90,
      slug: 'inteligencia-artificial-python',
    },
    {
      id: '10',
      title: 'Gestão Ágil de Projetos: Scrum, Kanban e XP',
      category: 'Negócios',
      categorySlug: 'negocios',
      image: 'https://picsum.photos/id/30/600/400',
      instructor: 'Fernanda Martins',
      duration: '30h',
      completionTime: '45 dias',
      isFree: false,
      price: 149.99,
      slug: 'gestao-agil-projetos',
    },
    {
      id: '11',
      title: 'Design Thinking e Design Sprint para Inovação',
      category: 'Inovação',
      categorySlug: 'inovacao',
      image: 'https://picsum.photos/id/31/600/400',
      instructor: 'Marcelo Almeida',
      duration: '25h',
      completionTime: '30 dias',
      isFree: false,
      price: 149.99,
      slug: 'design-thinking-sprint',
    },
    {
      id: '12',
      title: 'Marketing Digital Avançado: Estratégias de Conversão',
      category: 'Marketing',
      categorySlug: 'marketing',
      image: 'https://picsum.photos/id/32/600/400',
      instructor: 'Camila Souza',
      duration: '35h',
      completionTime: '45 dias',
      isFree: false,
      price: 289.90,
      slug: 'marketing-digital-avancado-conversao',
    },
    // Adicionando cursos com matérias escolares
    {
      id: '13',
      title: 'Matemática Básica: Fundamentos para o Ensino Médio',
      category: 'Matérias Escolares',
      categorySlug: 'materias-escolares',
      subject: 'Matemática',
      subjectSlug: 'matematica',
      image: 'https://picsum.photos/id/33/600/400',
      instructor: 'Carlos Eduardo Pereira',
      duration: '20h',
      completionTime: '45 dias',
      isFree: false,
      price: 89.90,
      slug: 'matematica-basica-ensino-medio',
    },
    {
      id: '14',
      title: 'Física para o ENEM: Mecânica e Cinemática',
      category: 'Matérias Escolares',
      categorySlug: 'materias-escolares',
      subject: 'Física',
      subjectSlug: 'fisica',
      image: 'https://picsum.photos/id/34/600/400',
      instructor: 'Ana Carla Silva',
      duration: '18h',
      completionTime: '40 dias',
      isFree: false,
      price: 79.90,
      slug: 'fisica-enem-mecanica-cinematica',
    },
    {
      id: '15',
      title: 'Redação para Vestibular: Como atingir nota máxima',
      category: 'Matérias Escolares',
      categorySlug: 'materias-escolares',
      subject: 'Redação',
      subjectSlug: 'redacao',
      image: 'https://picsum.photos/id/35/600/400',
      instructor: 'Paulo Ricardo Gomes',
      duration: '15h',
      completionTime: '30 dias',
      isFree: false,
      price: 99.90,
      slug: 'redacao-vestibular-nota-maxima',
    },
    {
      id: '16',
      title: 'Geografia do Brasil: Regiões e características',
      category: 'Matérias Escolares',
      categorySlug: 'materias-escolares',
      subject: 'Geografia',
      subjectSlug: 'geografia',
      image: 'https://picsum.photos/id/36/600/400',
      instructor: 'Roberto Carlos Mendes',
      duration: '12h',
      completionTime: '25 dias',
      isFree: true,
      slug: 'geografia-brasil-regioes',
    },
  ];

  // Filtrar cursos com base nos filtros selecionados
  const filteredCourses = allCourses.filter((course) => {
    // Filtro de pesquisa
    if (
      searchQuery &&
      !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !course.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(course.subject && course.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }

    // Filtro de categorias
    if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) {
      return false;
    }
    
    // Filtro de matérias
    if (selectedSubjects.length > 0 && (!course.subject || !selectedSubjects.includes(course.subject))) {
      return false;
    }

    // Filtro de duração
    if (selectedDurations.length > 0) {
      const duration = parseInt(course.duration.replace('h', ''));
      
      // Verificar se a duração do curso se encaixa em alguma das categorias selecionadas
      const durationMatches = selectedDurations.some(durationRange => {
        if (durationRange === 'Menos de 5h') return duration < 5;
        if (durationRange === '5h - 20h') return duration >= 5 && duration <= 20;
        if (durationRange === '20h - 40h') return duration > 20 && duration <= 40;
        if (durationRange === 'Mais de 40h') return duration > 40;
        return false;
      });
      
      if (!durationMatches) return false;
    }

    // Filtro de preço
    if (course.isFree) {
      // Se o curso é gratuito, verificar se o preço mínimo selecionado é 0
      if (selectedPriceRange[0] > 0) return false;
    } else if (course.price) {
      // Se o curso tem preço, verificar se está dentro do intervalo selecionado
      if (course.price < selectedPriceRange[0] || course.price > selectedPriceRange[1]) {
        return false;
      }
    }

    return true;
  });

  // Categorias disponíveis para filtrar
  const categories = ['Tecnologia', 'Negócios', 'Marketing', 'Educação', 'Inovação', 'Legislação', 'Mercado e Vendas', 'Matérias Escolares'];
  
  // Opções de duração para filtrar
  const durations = ['Menos de 5h', '5h - 20h', '20h - 40h', 'Mais de 40h'];

  // Toggle da categoria no filtro
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Toggle da matéria no filtro
  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  // Toggle da duração no filtro
  const toggleDuration = (duration: string) => {
    if (selectedDurations.includes(duration)) {
      setSelectedDurations(selectedDurations.filter(d => d !== duration));
    } else {
      setSelectedDurations([...selectedDurations, duration]);
    }
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedSubjects([]);
    setSelectedDurations([]);
    setSelectedPriceRange([0, 300]);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = () => {
    return (
      searchQuery.trim() !== '' ||
      selectedCategories.length > 0 ||
      selectedSubjects.length > 0 ||
      selectedDurations.length > 0 ||
      selectedPriceRange[0] > 0 ||
      selectedPriceRange[1] < 300
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Cabeçalho da página */}
        <section className="bg-brand-blue text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Explore Nossos Cursos</h1>
              <p className="text-lg mb-8 text-center max-w-2xl">
                Descubra uma variedade de cursos criados por instrutores especializados para ajudar você a dominar novas habilidades.
              </p>
              
              {/* Barra de pesquisa */}
              <div className="w-full max-w-2xl relative">
                <Input
                  type="text"
                  placeholder="Pesquisar cursos..."
                  className="pl-10 pr-4 py-6 w-full rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70 focus-visible:ring-brand-yellow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Seção de navegação por matérias escolares */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Matérias Escolares</h2>
            
            <Tabs defaultValue="popular">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="popular">Mais Populares</TabsTrigger>
                  <TabsTrigger value="exatas">Exatas</TabsTrigger>
                  <TabsTrigger value="humanas">Humanas</TabsTrigger>
                  <TabsTrigger value="linguagens">Linguagens</TabsTrigger>
                  <TabsTrigger value="ciencias">Ciências</TabsTrigger>
                </TabsList>
                
                <Button variant="link" className="text-brand-blue">
                  Ver todas as matérias
                </Button>
              </div>
              
              <TabsContent value="popular" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjects.slice(0, 8).map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="exatas" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjects.filter(s => ['matematica', 'algebra', 'geometria', 'estatistica', 'fisica'].includes(s.slug)).map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="humanas" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjects.filter(s => ['historia', 'geografia', 'filosofia', 'sociologia'].includes(s.slug)).map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="linguagens" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjects.filter(s => ['lingua-portuguesa', 'gramatica', 'redacao', 'literatura', 'ingles', 'espanhol'].includes(s.slug)).map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="ciencias" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjects.filter(s => ['biologia', 'quimica', 'fisica'].includes(s.slug)).map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Filtros e resultados */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filtros para mobile */}
            <div className="lg:hidden flex flex-col gap-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {showFilters && (
                <div className="bg-card border border-border rounded-lg p-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Categorias</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center">
                          <Checkbox 
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                            className="mr-2"
                          />
                          <label 
                            htmlFor={`category-${category}`} 
                            className="text-sm cursor-pointer"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Filtro de matérias escolares - só aparece quando a categoria está selecionada */}
                  {selectedCategories.includes('Matérias Escolares') && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Matérias Escolares</h3>
                      <div className="space-y-2 max-h-60 overflow-auto pr-2">
                        {subjects.map((subject) => (
                          <div key={subject.id} className="flex items-center">
                            <Checkbox
                              id={`subject-${subject.id}`}
                              checked={selectedSubjects.includes(subject.name)}
                              onCheckedChange={() => toggleSubject(subject.name)}
                              className="mr-2"
                            />
                            <label
                              htmlFor={`subject-${subject.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {subject.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Duração</h3>
                    <div className="space-y-2">
                      {durations.map((duration) => (
                        <div key={duration} className="flex items-center gap-2">
                          <Checkbox
                            id={`duration-${duration}`}
                            checked={selectedDurations.includes(duration)}
                            onCheckedChange={() => toggleDuration(duration)}
                          />
                          <label 
                            htmlFor={`duration-${duration}`}
                            className="text-sm cursor-pointer"
                          >
                            {duration}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtro de preço */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Preço
                    </h3>
                    <div className="px-2">
                      <Slider
                        defaultValue={[0, 300]}
                        max={300}
                        step={10}
                        value={selectedPriceRange}
                        onValueChange={setSelectedPriceRange}
                        className="mb-6"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>R$ {selectedPriceRange[0]}</span>
                        <span>R$ {selectedPriceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botão para limpar filtros */}
                  {hasActiveFilters() && (
                    <Button 
                      variant="outline"
                      className="w-full mt-3 text-muted-foreground"
                      onClick={clearAllFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar filtros
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Filtros para desktop */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="bg-card border border-border rounded-lg p-5 sticky top-20">
                <h2 className="font-bold text-lg mb-5">Filtros</h2>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Categorias</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                          className="mr-2"
                        />
                        <label 
                          htmlFor={`category-${category}`} 
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Filtro de matérias escolares - só aparece quando a categoria está selecionada */}
                {selectedCategories.includes('Matérias Escolares') && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Matérias Escolares</h3>
                    <div className="space-y-2 max-h-60 overflow-auto pr-2">
                      {subjects.map((subject) => (
                        <div key={subject.id} className="flex items-center">
                          <Checkbox
                            id={`subject-${subject.id}`}
                            checked={selectedSubjects.includes(subject.name)}
                            onCheckedChange={() => toggleSubject(subject.name)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={`subject-${subject.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {subject.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Duração</h3>
                  <div className="space-y-2">
                    {durations.map((duration) => (
                      <div key={duration} className="flex items-center gap-2">
                        <Checkbox
                          id={`duration-desktop-${duration}`}
                          checked={selectedDurations.includes(duration)}
                          onCheckedChange={() => toggleDuration(duration)}
                        />
                        <label 
                          htmlFor={`duration-desktop-${duration}`}
                          className="text-sm cursor-pointer"
                        >
                          {duration}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filtro de preço */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Preço
                  </h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 300]}
                      max={300}
                      step={10}
                      value={selectedPriceRange}
                      onValueChange={setSelectedPriceRange}
                      className="mb-6"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>R$ {selectedPriceRange[0]}</span>
                      <span>R$ {selectedPriceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Botão para limpar filtros */}
                {hasActiveFilters() && (
                  <Button 
                    variant="outline"
                    className="w-full mt-3 text-muted-foreground"
                    onClick={clearAllFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar filtros
                  </Button>
                )}
              </div>
            </div>

            {/* Lista de cursos */}
            <div className="flex-1">
              {/* Filtros ativos e ordenação */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2 items-center">
                  {hasActiveFilters() ? (
                    <>
                      <span className="text-sm font-medium mr-2">Filtros:</span>
                      
                      {selectedCategories.map(category => (
                        <Badge 
                          key={category} 
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {category}
                          <button onClick={() => toggleCategory(category)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      
                      {selectedDurations.map(duration => (
                        <Badge 
                          key={duration} 
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {duration}
                          <button onClick={() => toggleDuration(duration)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      
                      {(selectedPriceRange[0] > 0 || selectedPriceRange[1] < 300) && (
                        <Badge 
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          R$ {selectedPriceRange[0]} - R$ {selectedPriceRange[1]}
                          <button onClick={() => setSelectedPriceRange([0, 300])} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      
                      {searchQuery && (
                        <Badge 
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          "{searchQuery}"
                          <button onClick={() => setSearchQuery('')} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm text-muted-foreground"
                        onClick={clearAllFilters}
                      >
                        Limpar todos
                      </Button>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Mostrando todos os cursos</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Ordenar por:</span>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    <span>Mais populares</span>
                  </Button>
                </div>
              </div>

              {/* Resultado da pesquisa */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredCourses.length === 0 
                    ? 'Nenhum curso encontrado com os critérios selecionados' 
                    : `${filteredCourses.length} ${filteredCourses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}`}
                </p>
              </div>

              {/* Grid de cursos */}
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-lg">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
                  <p className="text-muted-foreground text-center max-w-sm mb-6">
                    Não encontramos cursos que correspondam aos filtros selecionados. Tente ajustar seus critérios de busca.
                  </p>
                  <Button onClick={clearAllFilters}>Limpar Filtros</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
