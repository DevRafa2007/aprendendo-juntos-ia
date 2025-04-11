import React, { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CategoryType, SubjectType, categories, subjects, getSubjectsByCategory } from '@/lib/categories';

interface CategorySelectorProps {
  onCategoryChange: (category: CategoryType | null) => void;
  onSubjectChange: (subject: SubjectType | null) => void;
  selectedCategory: CategoryType | null;
  selectedSubject: SubjectType | null;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategoryChange,
  onSubjectChange,
  selectedCategory,
  selectedSubject,
}) => {
  const [openCategory, setOpenCategory] = useState(false);
  const [openSubject, setOpenSubject] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectType[]>([]);
  
  // Atualiza as matérias disponíveis quando a categoria muda
  useEffect(() => {
    if (selectedCategory) {
      const subjectsForCategory = getSubjectsByCategory(selectedCategory.id);
      setAvailableSubjects(subjectsForCategory);
      
      // Se a categoria mudar e a matéria atual não pertence a essa categoria, limpa a seleção
      if (selectedSubject && selectedSubject.categoryId !== selectedCategory.id) {
        onSubjectChange(null);
      }
    } else {
      setAvailableSubjects([]);
      onSubjectChange(null);
    }
  }, [selectedCategory, selectedSubject, onSubjectChange]);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Categoria do Curso
        </label>
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategory}
              className="w-full justify-between"
            >
              {selectedCategory ? selectedCategory.name : "Selecione a categoria"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar categoria..." />
              <CommandList>
                <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        onCategoryChange(
                          selectedCategory?.id === category.id ? null : category
                        );
                        setOpenCategory(false);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selectedCategory?.id === category.id
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Seletor de matéria só aparece se a categoria for "Matérias Escolares" */}
      {selectedCategory?.slug === "materias-escolares" && (
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium">
            Matéria Escolar
          </label>
          <Popover open={openSubject} onOpenChange={setOpenSubject}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSubject}
                className="w-full justify-between"
              >
                {selectedSubject ? selectedSubject.name : "Selecione a matéria"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar matéria..." />
                <CommandList>
                  <CommandEmpty>Nenhuma matéria encontrada.</CommandEmpty>
                  <CommandGroup>
                    {availableSubjects.map((subject) => (
                      <CommandItem
                        key={subject.id}
                        value={subject.name}
                        onSelect={() => {
                          onSubjectChange(
                            selectedSubject?.id === subject.id ? null : subject
                          );
                          setOpenSubject(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedSubject?.id === subject.id
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {subject.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default CategorySelector; 