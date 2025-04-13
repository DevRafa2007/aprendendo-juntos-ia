import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import CourseCard, { CourseProps } from '@/components/CourseCard';
import CategoryCard from '@/components/CategoryCard';
import { Code, Briefcase, PaintBucket, MessageSquare, LineChart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  // Dados simulados de cursos em destaque
  const featuredCourses: CourseProps[] = [
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
  ];

  // Mais cursos recentes
  const recentCourses: CourseProps[] = [
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
  ];

  // Cursos premium
  const premiumCourses: CourseProps[] = [
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
  ];

  // Categorias
  const categories = [
    { icon: <Code className="h-6 w-6 text-white" />, name: 'Tecnologia', courseCount: 120, slug: 'tecnologia', color: 'bg-brand-blue' },
    { icon: <Briefcase className="h-6 w-6 text-white" />, name: 'Negócios', courseCount: 95, slug: 'negocios', color: 'bg-brand-green' },
    { icon: <PaintBucket className="h-6 w-6 text-white" />, name: 'Criatividade', courseCount: 78, slug: 'criatividade', color: 'bg-purple-500' },
    { icon: <MessageSquare className="h-6 w-6 text-white" />, name: 'Marketing', courseCount: 65, slug: 'marketing', color: 'bg-orange-500' },
    { icon: <LineChart className="h-6 w-6 text-white" />, name: 'Finanças', courseCount: 42, slug: 'financas', color: 'bg-emerald-500' },
    { icon: <Sparkles className="h-6 w-6 text-white" />, name: 'Inovação', courseCount: 38, slug: 'inovacao', color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        
        <StatsSection />

        {/* Categorias */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Explore por Categoria</h2>
            <Link to="/categorias">
              <Button variant="outline">Ver Todas</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </section>

        {/* Cursos em Destaque */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Cursos em Destaque</h2>
            <Link to="/cursos">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>

        {/* Banner promocional */}
        <section className="bg-brand-blue text-white py-12 my-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Compartilhe seu conhecimento</h2>
              <p className="text-lg mb-6">Crie seu curso e alcance estudantes de todo o Brasil. Defina seu próprio preço e comece a ensinar!</p>
              <Link to="/criar-curso">
                <Button size="lg" className="bg-white hover:bg-white/95 shadow-md">
                  <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent font-semibold">
                    Começar a Ensinar
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Cursos Recentes Gratuitos */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Cursos Gratuitos</h2>
            <Link to="/cursos?filter=gratuitos">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>

        {/* Cursos Premium */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Cursos Premium</h2>
            <Link to="/cursos?filter=premium">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>

        {/* Banner de inscrição */}
        <section className="bg-gradient-to-r from-brand-green to-brand-blue py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Fique por dentro das novidades</h2>
              <p className="mb-6">Receba atualizações sobre novos cursos e promoções especiais diretamente no seu email.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  className="px-4 py-3 rounded-lg w-full text-black"
                />
                <Button className="bg-brand-yellow text-black hover:bg-brand-yellow/90 whitespace-nowrap">
                  Inscrever-se
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
