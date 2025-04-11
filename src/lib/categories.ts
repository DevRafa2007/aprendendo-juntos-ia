// Lista de categorias e suas subcategorias (matérias escolares)
export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  subjects?: SubjectType[];
}

export interface SubjectType {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

// Categorias principais
export const categories: CategoryType[] = [
  {
    id: "1",
    name: "Tecnologia",
    slug: "tecnologia",
  },
  {
    id: "2",
    name: "Negócios",
    slug: "negocios",
  },
  {
    id: "3",
    name: "Marketing",
    slug: "marketing",
  },
  {
    id: "4",
    name: "Educação",
    slug: "educacao",
  },
  {
    id: "5",
    name: "Inovação",
    slug: "inovacao",
  },
  {
    id: "6",
    name: "Legislação",
    slug: "legislacao",
  },
  {
    id: "7",
    name: "Mercado e Vendas",
    slug: "mercado-vendas",
  },
  {
    id: "8",
    name: "Matérias Escolares",
    slug: "materias-escolares",
  }
];

// Matérias escolares (subcategorias)
export const subjects: SubjectType[] = [
  // Matemática
  {
    id: "s1",
    name: "Matemática",
    slug: "matematica",
    categoryId: "8",
  },
  {
    id: "s2",
    name: "Álgebra",
    slug: "algebra",
    categoryId: "8",
  },
  {
    id: "s3",
    name: "Geometria",
    slug: "geometria",
    categoryId: "8",
  },
  {
    id: "s4",
    name: "Estatística",
    slug: "estatistica",
    categoryId: "8",
  },
  
  // Português
  {
    id: "s5",
    name: "Língua Portuguesa",
    slug: "lingua-portuguesa",
    categoryId: "8",
  },
  {
    id: "s6",
    name: "Gramática",
    slug: "gramatica",
    categoryId: "8",
  },
  {
    id: "s7",
    name: "Redação",
    slug: "redacao",
    categoryId: "8",
  },
  {
    id: "s8",
    name: "Literatura",
    slug: "literatura",
    categoryId: "8",
  },
  
  // Ciências
  {
    id: "s9",
    name: "Biologia",
    slug: "biologia",
    categoryId: "8",
  },
  {
    id: "s10",
    name: "Física",
    slug: "fisica",
    categoryId: "8",
  },
  {
    id: "s11",
    name: "Química",
    slug: "quimica",
    categoryId: "8",
  },
  
  // Ciências Humanas
  {
    id: "s12",
    name: "História",
    slug: "historia",
    categoryId: "8",
  },
  {
    id: "s13",
    name: "Geografia",
    slug: "geografia",
    categoryId: "8",
  },
  {
    id: "s14",
    name: "Filosofia",
    slug: "filosofia",
    categoryId: "8",
  },
  {
    id: "s15",
    name: "Sociologia",
    slug: "sociologia",
    categoryId: "8",
  },
  
  // Línguas Estrangeiras
  {
    id: "s16",
    name: "Inglês",
    slug: "ingles",
    categoryId: "8",
  },
  {
    id: "s17",
    name: "Espanhol",
    slug: "espanhol",
    categoryId: "8",
  },
  
  // Outros
  {
    id: "s18",
    name: "Educação Física",
    slug: "educacao-fisica",
    categoryId: "8",
  },
  {
    id: "s19",
    name: "Artes",
    slug: "artes",
    categoryId: "8",
  },
  {
    id: "s20",
    name: "Informática Educativa",
    slug: "informatica-educativa",
    categoryId: "8",
  },
];

// Função para obter matérias de uma categoria específica
export function getSubjectsByCategory(categoryId: string): SubjectType[] {
  return subjects.filter(subject => subject.categoryId === categoryId);
}

// Inicializa as categorias com suas subcategorias
export const initializedCategories: CategoryType[] = categories.map(category => ({
  ...category,
  subjects: getSubjectsByCategory(category.id)
}));

// Função para obter uma categoria pelo slug
export function getCategoryBySlug(slug: string): CategoryType | undefined {
  return initializedCategories.find(category => category.slug === slug);
}

// Função para obter uma matéria pelo slug
export function getSubjectBySlug(slug: string): SubjectType | undefined {
  return subjects.find(subject => subject.slug === slug);
} 