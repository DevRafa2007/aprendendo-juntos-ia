
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, MessageSquare, HelpCircle, Mail, Phone, 
  Video, File, Book, CreditCard, Shield, Monitor, 
  User, Award, AlertCircle, Check, BrainCircuit
} from 'lucide-react';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Dados simulados de FAQs
  const faqCategories = [
    {
      id: 'getting-started',
      icon: <Book className="h-5 w-5" />,
      title: 'Primeiros Passos',
      description: 'Informações básicas para começar a utilizar a plataforma',
      faqs: [
        {
          question: 'Como criar uma conta?',
          answer: 'Para criar uma conta, clique no botão "Cadastrar" no canto superior direito da página inicial. Preencha o formulário com seu nome, email e senha, aceite os termos de uso e clique em "Criar conta".'
        },
        {
          question: 'Como encontrar cursos?',
          answer: 'Você pode encontrar cursos navegando pelas categorias na página inicial, usando a barra de pesquisa no topo da página, ou explorando a seção "Cursos" no menu principal.'
        },
        {
          question: 'Como me inscrever em um curso?',
          answer: 'Para se inscrever em um curso, acesse a página do curso desejado e clique no botão "Inscrever-se" ou "Comprar Agora". Para cursos gratuitos, você será matriculado imediatamente. Para cursos pagos, você será direcionado para a página de pagamento.'
        },
        {
          question: 'Posso acessar os cursos em dispositivos móveis?',
          answer: 'Sim, a plataforma Studying Place é totalmente responsiva e pode ser acessada em smartphones e tablets. Além disso, temos aplicativos disponíveis para iOS e Android que permitem baixar aulas para assistir offline.'
        },
      ]
    },
    {
      id: 'courses',
      icon: <Video className="h-5 w-5" />,
      title: 'Cursos e Conteúdo',
      description: 'Tudo sobre cursos, aulas e materiais de estudo',
      faqs: [
        {
          question: 'Quanto tempo tenho para concluir um curso?',
          answer: 'Uma vez matriculado, você tem acesso vitalício ao curso, podendo estudar em seu próprio ritmo. Não há prazo para conclusão, e você pode revisitar o conteúdo quantas vezes quiser.'
        },
        {
          question: 'Como obtenho um certificado?',
          answer: 'Para obter o certificado, você precisa concluir todas as aulas e atividades obrigatórias do curso. Após isso, o certificado será automaticamente disponibilizado na sua área de certificados, dentro do seu perfil.'
        },
        {
          question: 'Os cursos possuem legenda ou transcrição?',
          answer: 'Sim, trabalhamos para garantir acessibilidade. A maioria dos nossos cursos possui legendas em português, e alguns também oferecem legendas em outros idiomas. Além disso, muitos cursos incluem transcrições das aulas para facilitar o estudo.'
        },
        {
          question: 'Posso baixar as aulas para assistir offline?',
          answer: 'Sim, nosso aplicativo móvel permite que você baixe aulas para assistir offline. Essa funcionalidade está disponível para todos os alunos matriculados nos cursos.'
        },
      ]
    },
    {
      id: 'payments',
      icon: <CreditCard className="h-5 w-5" />,
      title: 'Pagamentos e Reembolsos',
      description: 'Informações sobre formas de pagamento e política de reembolso',
      faqs: [
        {
          question: 'Quais formas de pagamento são aceitas?',
          answer: 'Aceitamos cartões de crédito (Visa, Mastercard, American Express), PayPal, boleto bancário e Pix. Para alguns cursos, também oferecemos a opção de parcelamento em até 12x no cartão de crédito.'
        },
        {
          question: 'Como funciona a garantia de satisfação?',
          answer: 'Oferecemos garantia de satisfação de 30 dias para todos os cursos pagos. Se você não estiver satisfeito com o curso, pode solicitar reembolso total dentro desse período, sem precisar apresentar justificativa.'
        },
        {
          question: 'Como emitir nota fiscal?',
          answer: 'A nota fiscal é emitida automaticamente após a confirmação do pagamento e enviada para o email cadastrado. Caso precise de uma segunda via, acesse a seção "Histórico de Compras" no seu perfil.'
        },
        {
          question: 'É seguro fornecer dados de cartão de crédito?',
          answer: 'Sim, utilizamos tecnologia de criptografia SSL de 256 bits para proteger todas as transações. Além disso, não armazenamos dados completos de cartões, pois trabalhamos com gateways de pagamento confiáveis e certificados.'
        },
      ]
    },
    {
      id: 'teaching',
      icon: <User className="h-5 w-5" />,
      title: 'Ensino e Criação de Cursos',
      description: 'Informações para instrutores e criadores de conteúdo',
      faqs: [
        {
          question: 'Como me tornar um instrutor?',
          answer: 'Para se tornar um instrutor, acesse a seção "Criar Curso" no menu principal. Você precisará completar um perfil de instrutor, onde informará sua experiência, área de conhecimento e outras informações relevantes. Após a aprovação, você poderá começar a criar seus cursos.'
        },
        {
          question: 'Quanto custa publicar um curso?',
          answer: 'Publicar um curso é gratuito. A plataforma opera com um modelo de receita compartilhada, onde o instrutor recebe entre 60% e 85% do valor das vendas, dependendo do plano escolhido e do volume de vendas.'
        },
        {
          question: 'Quais são os requisitos para os vídeos?',
          answer: 'Recomendamos vídeos em resolução Full HD (1920x1080), formato MP4, com boa iluminação e áudio claro. Cada aula deve ter entre 5 e 30 minutos para manter o engajamento dos alunos. Oferecemos guias detalhados de produção na área de suporte ao instrutor.'
        },
        {
          question: 'Como recebo pelos cursos vendidos?',
          answer: 'Os pagamentos são realizados mensalmente, a partir do dia 15, para todos os valores acumulados no mês anterior que ultrapassem o mínimo de R$ 50,00. Aceitamos transferência bancária, PIX ou pagamento via PayPal.'
        },
      ]
    },
    {
      id: 'technical',
      icon: <Monitor className="h-5 w-5" />,
      title: 'Suporte Técnico',
      description: 'Resolução de problemas técnicos e dúvidas',
      faqs: [
        {
          question: 'O vídeo não está carregando, o que fazer?',
          answer: 'Primeiro, verifique sua conexão com a internet. Em seguida, tente atualizar a página, limpar o cache do navegador ou usar outro navegador. Se o problema persistir, verifique se há bloqueadores de conteúdo ativos e desative-os para nosso site. Caso nada resolva, entre em contato com nosso suporte técnico.'
        },
        {
          question: 'Como recuperar minha senha?',
          answer: 'Na página de login, clique em "Esqueceu a senha?". Você receberá um email com instruções para criar uma nova senha. Se não receber o email em alguns minutos, verifique sua pasta de spam ou entre em contato com o suporte.'
        },
        {
          question: 'Quais navegadores são compatíveis com a plataforma?',
          answer: 'Nossa plataforma é compatível com as versões atuais dos principais navegadores: Google Chrome, Mozilla Firefox, Safari, Microsoft Edge e Opera. Recomendamos manter seu navegador sempre atualizado para a melhor experiência.'
        },
        {
          question: 'Como resolver problemas de áudio nas aulas?',
          answer: 'Se estiver com problemas de áudio, verifique se o volume do seu dispositivo e do player de vídeo estão ativados. Teste usar fones de ouvido. Se o problema persistir, tente ajustar a qualidade do vídeo para uma opção mais baixa, o que pode ajudar em conexões mais lentas.'
        },
      ]
    },
    {
      id: 'account',
      icon: <Shield className="h-5 w-5" />,
      title: 'Conta e Privacidade',
      description: 'Gerenciamento de conta e proteção de dados',
      faqs: [
        {
          question: 'Como alterar meus dados de cadastro?',
          answer: 'Para alterar seus dados, acesse seu perfil clicando no seu nome ou avatar no canto superior direito da tela. Na seção "Configurações" você pode atualizar seus dados pessoais, foto de perfil, email e outras informações.'
        },
        {
          question: 'Como excluir minha conta?',
          answer: 'Para excluir sua conta, acesse as configurações do seu perfil e vá até a seção "Zona de Perigo". Lá você encontrará a opção para excluir sua conta. Lembre-se que esta ação é irreversível e você perderá acesso a todos os cursos e certificados.'
        },
        {
          question: 'Quais dados pessoais são coletados pela plataforma?',
          answer: 'Coletamos dados básicos como nome, email, dados de pagamento e informações de uso da plataforma. Todos os dados são tratados conforme nossa Política de Privacidade, em conformidade com a LGPD (Lei Geral de Proteção de Dados). Não compartilhamos seus dados com terceiros sem seu consentimento.'
        },
        {
          question: 'Posso usar a mesma conta em múltiplos dispositivos?',
          answer: 'Sim, você pode acessar sua conta em múltiplos dispositivos simultaneamente. No entanto, para proteger nossos instrutores, limitamos a reprodução de vídeos a no máximo dois dispositivos ao mesmo tempo.'
        },
      ]
    },
    {
      id: 'certificates',
      icon: <Award className="h-5 w-5" />,
      title: 'Certificados',
      description: 'Informações sobre certificados e validação',
      faqs: [
        {
          question: 'Os certificados têm validade legal?',
          answer: 'Nossos certificados são documentos digitais que comprovam a conclusão do curso e podem ser incluídos em currículos e perfis profissionais. Eles não substituem diplomas universitários ou certificações profissionais regulamentadas, mas são reconhecidos pelo mercado como comprovação de desenvolvimento de habilidades.'
        },
        {
          question: 'Como compartilhar meu certificado no LinkedIn?',
          answer: 'Após receber seu certificado, você verá um botão "Compartilhar no LinkedIn". Ao clicar nele, você será redirecionado para adicionar o certificado ao seu perfil profissional, com os dados do curso já preenchidos automaticamente.'
        },
        {
          question: 'É possível verificar a autenticidade de um certificado?',
          answer: 'Sim, todos os nossos certificados possuem um código QR e um código de verificação único. Qualquer pessoa pode verificar a autenticidade do certificado acessando nosso site e inserindo o código na seção "Verificar Certificado".'
        },
        {
          question: 'Por que ainda não recebi meu certificado?',
          answer: 'Os certificados são gerados automaticamente após a conclusão de 100% do conteúdo obrigatório do curso. Verifique se você concluiu todas as aulas e atividades marcadas como obrigatórias. A emissão pode levar até 24 horas após a conclusão. Se persistir o problema, contate nosso suporte.'
        },
      ]
    },
    {
      id: 'ai-integration',
      icon: <BrainCircuit className="h-5 w-5" />,
      title: 'Chatbot e IA',
      description: 'Informações sobre nossa assistente virtual inteligente',
      faqs: [
        {
          question: 'Como o chatbot IA pode me ajudar?',
          answer: 'Nosso chatbot inteligente pode auxiliar em diversas tarefas: responder dúvidas sobre os cursos, ajudar a encontrar conteúdos específicos dentro das aulas, criar resumos personalizados, sugerir materiais complementares e até mesmo gerar quizzes para testar seu conhecimento sobre o tema estudado.'
        },
        {
          question: 'O chatbot tem acesso ao conteúdo dos cursos?',
          answer: 'Sim, nosso chatbot é treinado com o conteúdo de todos os cursos da plataforma. Isso significa que ele pode responder perguntas específicas sobre o material de estudo, explicar conceitos abordados nas aulas e ajudar a esclarecer dúvidas sobre o conteúdo.'
        },
        {
          question: 'Como usar o chatbot de forma eficiente?',
          answer: 'Para obter as melhores respostas, seja específico em suas perguntas. Mencione o nome do curso e o tópico sobre o qual tem dúvidas. Você também pode pedir ao chatbot para "explicar em palavras mais simples" ou "dar um exemplo prático" se precisar de maior clareza. O histórico da conversa é mantido, então você pode fazer perguntas de acompanhamento.'
        },
        {
          question: 'O chatbot substitui o suporte humano?',
          answer: 'Não, o chatbot é uma ferramenta complementar. Para questões mais complexas, problemas técnicos ou assuntos relacionados a pagamentos e reembolsos, direcionamos você para nossa equipe de suporte humano, que está disponível via chat, email ou telefone em horário comercial.'
        },
      ]
    },
  ];

  const allFaqs = faqCategories.flatMap(category => 
    category.faqs.map(faq => ({
      ...faq,
      category: category.title,
      categoryId: category.id
    }))
  );

  // Função de pesquisa
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredFaqs([]);
      setHasSearched(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = allFaqs.filter(
      faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
    );
    
    setFilteredFaqs(results);
    setHasSearched(true);
  };

  // Executar pesquisa ao pressionar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Cabeçalho */}
        <section className="bg-brand-blue text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Como podemos ajudar?</h1>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Encontre respostas para suas dúvidas ou entre em contato com nossa equipe de suporte.
            </p>
            <div className="max-w-2xl mx-auto relative">
              <Input
                className="pl-10 pr-4 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70 focus-visible:ring-white"
                placeholder="Busque por palavras-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={handleSearch}
              >
                Buscar
              </Button>
            </div>
          </div>
        </section>

        {/* Resultados da Pesquisa */}
        {hasSearched && (
          <section className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">
              {filteredFaqs.length > 0 
                ? `Resultados da pesquisa para "${searchQuery}" (${filteredFaqs.length})` 
                : `Nenhum resultado encontrado para "${searchQuery}"`}
            </h2>
            
            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader className="py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span className="bg-muted px-2 py-1 rounded-full">{faq.category}</span>
                      </div>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-muted rounded-lg">
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-xl font-medium mb-2">Não encontramos o que você procura</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Tente usar palavras-chave diferentes ou entre em contato com nossa equipe de suporte para obter ajuda personalizada.
                </p>
                <Button>Contatar Suporte</Button>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setFilteredFaqs([]);
                setHasSearched(false);
              }}>
                Limpar Pesquisa
              </Button>
            </div>
          </section>
        )}

        {/* Conteúdo principal */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="faq">
            <TabsList className="mb-8 grid w-full grid-cols-2">
              <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
            </TabsList>
            
            {/* Tab de FAQ */}
            <TabsContent value="faq">
              {!hasSearched && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {faqCategories.map((category) => (
                    <Card key={category.id} className="cursor-pointer hover:border-brand-blue transition-colors">
                      <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-3">
                          {category.icon}
                        </div>
                        <CardTitle>{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
              
              {!hasSearched && (
                <div className="space-y-8">
                  {faqCategories.map((category) => (
                    <div key={category.id} id={category.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                          {category.icon}
                        </div>
                        <h2 className="text-2xl font-bold">{category.title}</h2>
                      </div>
                      
                      <Accordion type="single" collapsible className="mb-8">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem value={`${category.id}-${index}`} key={`${category.id}-${index}`}>
                            <AccordionTrigger className="font-medium text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground">{faq.answer}</p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      <Separator className="my-8" />
                    </div>
                  ))}
                </div>
              )}
              
              <Card className="bg-muted/50 mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-brand-blue" />
                    Não encontrou o que procurava?
                  </CardTitle>
                  <CardDescription>
                    Nossa equipe de suporte está pronta para ajudar com suas dúvidas específicas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => document.querySelector('[data-value="contact"]')?.dispatchEvent(new Event('click'))}>
                    Entrar em Contato
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tab de Contato */}
            <TabsContent value="contact">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Envie sua mensagem</CardTitle>
                      <CardDescription>
                        Preencha o formulário abaixo e nossa equipe responderá o mais breve possível.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input id="name" placeholder="Seu nome" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="seu@email.com" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subject">Assunto</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o assunto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Problema Técnico</SelectItem>
                              <SelectItem value="account">Conta e Acesso</SelectItem>
                              <SelectItem value="payment">Pagamento e Reembolso</SelectItem>
                              <SelectItem value="course">Dúvida sobre Curso</SelectItem>
                              <SelectItem value="certificate">Certificados</SelectItem>
                              <SelectItem value="instructor">Suporte ao Instrutor</SelectItem>
                              <SelectItem value="other">Outro Assunto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="message">Mensagem</Label>
                          <Textarea 
                            id="message" 
                            placeholder="Descreva em detalhes como podemos ajudar..." 
                            className="min-h-32"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="attachment">Anexos (opcional)</Label>
                          <Input id="attachment" type="file" className="cursor-pointer" />
                          <p className="text-xs text-muted-foreground">
                            Você pode anexar capturas de tela ou documentos que ajudem a explicar seu problema (máx: 5MB)
                          </p>
                        </div>
                        
                        <Button type="submit" className="w-full">Enviar Mensagem</Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Canais de Atendimento</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">Chat ao Vivo</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Disponível de segunda a sexta, das 8h às 20h
                            </p>
                            <Button variant="outline" size="sm">Iniciar Chat</Button>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">Email</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              Resposta em até 24 horas
                            </p>
                            <a href="mailto:suporte@studyingplace.com.br" className="text-brand-blue hover:underline">
                              suporte@studyingplace.com.br
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">Telefone</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              De segunda a sexta, das 9h às 18h
                            </p>
                            <a href="tel:+551140028922" className="text-brand-blue hover:underline">
                              (11) 4002-8922
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">FAQ Rápido</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <Check className="h-4 w-4 text-brand-green" />
                            Quanto tempo para reembolso?
                          </h3>
                          <p className="text-sm text-muted-foreground ml-6">
                            O reembolso é processado em até 7 dias úteis, dependendo da instituição financeira.
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <Check className="h-4 w-4 text-brand-green" />
                            Como recuperar minha senha?
                          </h3>
                          <p className="text-sm text-muted-foreground ml-6">
                            Na tela de login, clique em "Esqueceu a senha?" e siga as instruções enviadas ao seu email.
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <Check className="h-4 w-4 text-brand-green" />
                            Posso acessar em dispositivos móveis?
                          </h3>
                          <p className="text-sm text-muted-foreground ml-6">
                            Sim, temos aplicativo para iOS e Android, além do site responsivo.
                          </p>
                        </div>
                        
                        <div className="pt-2">
                          <Button variant="link" className="px-0" onClick={() => document.querySelector('[data-value="faq"]')?.dispatchEvent(new Event('click'))}>
                            Ver todas as perguntas frequentes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-yellow-800">Tempo de resposta</h3>
                            <p className="text-sm text-yellow-700">
                              Nosso tempo médio de resposta atual é de 2 horas para chat, 6 horas para email e imediato para telefone.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
