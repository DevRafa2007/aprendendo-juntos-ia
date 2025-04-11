import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = '',
  onChange,
  placeholder = 'Comece a digitar...',
  className = '',
  disabled = false
}) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  // Configure o editor com extensões
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-md max-w-full',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert focus:outline-none max-w-none min-h-[150px] ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`,
        placeholder: placeholder,
      },
    },
  });

  // Atualiza o conteúdo do editor se a prop initialContent mudar
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  // Função para adicionar link
  const addLink = () => {
    if (!linkUrl || !editor) return;
    
    // Se texto estiver selecionado, transforme em link
    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}" target="_blank">${linkUrl}</a>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setLink({ href: linkUrl, target: '_blank' })
        .run();
    }
    
    setLinkUrl('');
    setLinkDialogOpen(false);
  };

  // Função para adicionar imagem
  const addImage = () => {
    if (!imageUrl || !editor) return;
    
    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl })
      .run();
    
    setImageUrl('');
    setImageDialogOpen(false);
  };

  // Adiciona uma tabela simples
  const addTable = () => {
    if (!editor) return;
    
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  if (!editor) {
    return null;
  }

  const toolbar = [
    { 
      icon: <Bold size={18} />, 
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Negrito'
    },
    { 
      icon: <Italic size={18} />, 
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Itálico'
    },
    { 
      icon: <UnderlineIcon size={18} />, 
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      title: 'Sublinhado'
    },
    { type: 'divider' },
    { 
      icon: <Heading1 size={18} />, 
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Título 1'
    },
    { 
      icon: <Heading2 size={18} />, 
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Título 2'
    },
    { 
      icon: <Heading3 size={18} />, 
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      title: 'Título 3'
    },
    { type: 'divider' },
    { 
      icon: <List size={18} />, 
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Lista com marcadores'
    },
    { 
      icon: <ListOrdered size={18} />, 
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Lista numerada'
    },
    { type: 'divider' },
    { 
      icon: <AlignLeft size={18} />, 
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
      title: 'Alinhar à esquerda'
    },
    { 
      icon: <AlignCenter size={18} />, 
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
      title: 'Centralizar'
    },
    { 
      icon: <AlignRight size={18} />, 
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
      title: 'Alinhar à direita'
    },
    { 
      icon: <AlignJustify size={18} />, 
      action: () => editor.chain().focus().setTextAlign('justify').run(),
      isActive: editor.isActive({ textAlign: 'justify' }),
      title: 'Justificar'
    },
    { type: 'divider' },
    { 
      icon: <LinkIcon size={18} />, 
      action: () => setLinkDialogOpen(true),
      isActive: editor.isActive('link'),
      title: 'Adicionar link'
    },
    { 
      icon: <ImageIcon size={18} />, 
      action: () => setImageDialogOpen(true),
      isActive: false,
      title: 'Adicionar imagem'
    },
    { 
      icon: <TableIcon size={18} />, 
      action: addTable,
      isActive: editor.isActive('table'),
      title: 'Inserir tabela'
    },
    { type: 'divider' },
    { 
      icon: <Undo size={18} />, 
      action: () => editor.chain().focus().undo().run(),
      isActive: false,
      title: 'Desfazer',
      disabled: !editor.can().undo()
    },
    { 
      icon: <Redo size={18} />, 
      action: () => editor.chain().focus().redo().run(),
      isActive: false,
      title: 'Refazer',
      disabled: !editor.can().redo()
    },
  ];

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Barra de ferramentas */}
      <div className="flex flex-wrap items-center p-2 border-b gap-0.5 bg-muted/30">
        {toolbar.map((item, index) => (
          item.type === 'divider' ? (
            <div key={`divider-${index}`} className="h-6 w-px bg-border mx-1" />
          ) : (
            <Button
              key={`button-${index}`}
              variant={item.isActive ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={item.action}
              title={item.title}
              disabled={disabled || item.disabled}
            >
              {item.icon}
            </Button>
          )
        ))}
      </div>
      
      {/* Conteúdo do editor */}
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
      
      {/* Diálogo para adicionar link */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  placeholder="https://exemplo.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <Button 
                  variant="default" 
                  onClick={addLink}
                  disabled={!linkUrl}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para adicionar imagem */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar imagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da imagem</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button 
                  variant="default" 
                  onClick={addImage}
                  disabled={!imageUrl}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RichTextEditor; 