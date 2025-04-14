import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, User, LogIn, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import SyncStatusIndicator from './SyncStatusIndicator';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Interfaces para mensagens e notificações
interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'system' | 'course' | 'message' | 'payment';
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar_url?: string;
}

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user;
  const { toast } = useToast();
  
  // Estados para notificações e mensagens
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // Buscar notificações e mensagens quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchMessages();
      
      // Configurar inscrição para notificações em tempo real
      const notificationSubscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();
        
      // Configurar inscrição para mensagens em tempo real
      const messageSubscription = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, () => {
          fetchMessages();
        })
        .subscribe();
        
      return () => {
        notificationSubscription.unsubscribe();
        messageSubscription.unsubscribe();
      };
    }
  }, [user]);
  
  // Calcular contagem de notificações e mensagens não lidas
  useEffect(() => {
    setUnreadNotifications(notifications.filter(n => !n.read).length);
    setUnreadMessages(messages.filter(m => !m.read).length);
  }, [notifications, messages]);
  
  // Função para buscar notificações
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };
  
  // Função para buscar mensagens
  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            name:profiles(name),
            avatar_url:profiles(avatar_url)
          )
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Processar dados para mapear informações do remetente
      const processedMessages = data?.map(message => ({
        ...message,
        sender_name: message.sender?.[0]?.name || 'Usuário',
        sender_avatar_url: message.sender?.[0]?.avatar_url
      })) || [];
      
      setMessages(processedMessages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };
  
  // Função para marcar notificação como lida
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };
  
  // Função para marcar mensagem como lida
  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
        
      if (error) throw error;
      
      // Atualizar estado local
      setMessages(prev => 
        prev.map(m => m.id === messageId ? { ...m, read: true } : m)
      );
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };
  
  // Função para marcar todas as notificações como lidas
  const markAllNotificationsAsRead = async () => {
    if (notifications.filter(n => !n.read).length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);
        
      if (error) throw error;
      
      // Atualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({
        title: "Notificações",
        description: "Todas as notificações foram marcadas como lidas"
      });
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
    }
  };
  
  // Função para marcar todas as mensagens como lidas
  const markAllMessagesAsRead = async () => {
    if (messages.filter(m => !m.read).length === 0) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user?.id)
        .eq('read', false);
        
      if (error) throw error;
      
      // Atualizar estado local
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
      toast({
        title: "Mensagens",
        description: "Todas as mensagens foram marcadas como lidas"
      });
    } catch (error) {
      console.error('Erro ao marcar todas mensagens como lidas:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Logo />
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-foreground hover:text-brand-blue transition-colors font-medium">
              Home
            </Link>
            <Link to="/cursos" className="text-foreground hover:text-brand-blue transition-colors font-medium">
              Cursos
            </Link>
            {isAuthenticated && (
              <Link to="/criar-curso" className="text-foreground hover:text-brand-blue transition-colors font-medium">
                Criar Curso
              </Link>
            )}
            <Link to="/suporte" className="text-foreground hover:text-brand-blue transition-colors font-medium">
              Suporte
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Pesquisar cursos..."
              className="pl-9 pr-4 py-2 bg-muted rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <SyncStatusIndicator />
              
              {/* Botão de Notificações */}
              <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-brand-blue relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge className="bg-rose-500 text-white absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center rounded-full">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-auto">
                  <div className="flex items-center justify-between p-2">
                    <DropdownMenuLabel className="py-2">Notificações</DropdownMenuLabel>
                    {unreadNotifications > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={markAllNotificationsAsRead}
                      >
                        Marcar todas como lidas
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>Você não tem notificações</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className={`p-3 cursor-pointer flex flex-col items-start ${!notification.read ? 'bg-muted/50' : ''}`}
                        onClick={() => {
                          if (!notification.read) markNotificationAsRead(notification.id);
                          if (notification.action_url) navigate(notification.action_url);
                          setNotificationOpen(false);
                        }}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="font-medium">{notification.title}</div>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-rose-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                  
                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/perfil/notificacoes" className="p-2 text-center text-sm text-brand-blue hover:text-brand-blue/80 w-full">
                          Ver todas notificações
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Botão de Mensagens */}
              <DropdownMenu open={messageOpen} onOpenChange={setMessageOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-brand-blue relative">
                    <MessageSquare className="h-5 w-5" />
                    {unreadMessages > 0 && (
                      <Badge className="bg-rose-500 text-white absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center rounded-full">
                        {unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-auto">
                  <div className="flex items-center justify-between p-2">
                    <DropdownMenuLabel className="py-2">Mensagens</DropdownMenuLabel>
                    {unreadMessages > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={markAllMessagesAsRead}
                      >
                        Marcar todas como lidas
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  
                  {messages.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>Você não tem mensagens</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <DropdownMenuItem 
                        key={message.id} 
                        className={`p-3 cursor-pointer ${!message.read ? 'bg-muted/50' : ''}`}
                        onClick={() => {
                          if (!message.read) markMessageAsRead(message.id);
                          navigate(`/mensagens/${message.sender_id}`);
                          setMessageOpen(false);
                        }}
                      >
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={message.sender_avatar_url || ''} />
                            <AvatarFallback>{message.sender_name?.substring(0, 2).toUpperCase() || 'US'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="font-medium truncate">{message.sender_name}</div>
                              {!message.read && (
                                <div className="h-2 w-2 bg-rose-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{message.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                  
                  {messages.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/mensagens" className="p-2 text-center text-sm text-brand-blue hover:text-brand-blue/80 w-full">
                          Ver todas mensagens
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Dropdown do Perfil */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-brand-blue to-brand-green text-white">
                        {profile?.name?.substring(0, 2).toUpperCase() || <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{profile?.name || 'Usuário'}</span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil" className="cursor-pointer hover:bg-accent hover:text-accent-foreground w-full">Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/meus-cursos" className="cursor-pointer hover:bg-accent hover:text-accent-foreground w-full">Meus Cursos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button variant="gradient" className="flex items-center gap-2">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
