
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground mt-2">
              Democratizando o acesso à educação de qualidade, conectando professores e alunos em uma jornada de aprendizado eficaz.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-brand-blue">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-brand-blue">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-brand-blue">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-brand-blue">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-brand-blue">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Para Alunos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cursos" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Explorar Cursos
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/depoimentos" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Depoimentos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Para Professores</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/criar-curso" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Criar um Curso
                </Link>
              </li>
              <li>
                <Link to="/dicas-criacao" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Dicas de Criação
                </Link>
              </li>
              <li>
                <Link to="/precos" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Planos de Preços
                </Link>
              </li>
              <li>
                <Link to="/afiliados" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Programa de Afiliados
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contato" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-brand-blue">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-sm text-muted-foreground hover:text-brand-blue">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Studying Place. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
