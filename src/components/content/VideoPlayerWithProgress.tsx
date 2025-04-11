import React, { useState, useEffect, useRef } from 'react';
import { useContentProgress } from '@/hooks/useContentProgress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Maximize,
  CheckCircle
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerWithProgressProps {
  videoUrl: string;
  videoTitle: string;
  contentId: number;
  courseId: string;
  thumbnailUrl?: string;
  onComplete?: () => void;
  autoMarkComplete?: boolean;
}

const VideoPlayerWithProgress: React.FC<VideoPlayerWithProgressProps> = ({ 
  videoUrl, 
  videoTitle,
  contentId,
  courseId,
  thumbnailUrl,
  onComplete,
  autoMarkComplete = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const { 
    isLoading,
    getContentProgress, 
    saveVideoPosition,
    markContentAsCompleted 
  } = useContentProgress();
  
  const { toast } = useToast();
  
  // Carregar progresso anterior, se houver
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoadingProgress(true);
        const { data } = await getContentProgress(courseId, contentId);
        
        if (data) {
          setCompleted(data.completed);
          
          // Se há uma posição salva e o vídeo não está concluído, retomar de onde parou
          if (data.last_position && !data.completed && videoRef.current) {
            videoRef.current.currentTime = data.last_position;
            setCurrentTime(data.last_position);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar progresso do vídeo:', error);
      } finally {
        setLoadingProgress(false);
      }
    };
    
    if (contentId && courseId) {
      loadProgress();
    }
  }, [contentId, courseId]);
  
  // Configurar eventos do vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      handleVideoCompletion();
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      
      // Salvar posição atual quando pausar
      if (video.currentTime > 0) {
        saveProgress();
      }
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    // Configurar o timer para salvar o progresso a cada 10 segundos
    progressTimerRef.current = window.setInterval(() => {
      if (isPlaying && video.currentTime > 0) {
        saveProgress();
      }
    }, 10000);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      
      // Limpar o timer quando desmontar
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      
      // Salvar posição antes de desmontar
      if (video.currentTime > 0) {
        saveProgress();
      }
    };
  }, [isPlaying, videoUrl]);
  
  // Handler de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Auto-hide de controles
  useEffect(() => {
    let timeout: number;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      
      timeout = window.setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const player = playerRef.current;
    if (player) {
      player.addEventListener('mousemove', handleMouseMove);
      player.addEventListener('mouseleave', () => {
        if (isPlaying) {
          setShowControls(false);
        }
      });
      player.addEventListener('mouseenter', () => {
        setShowControls(true);
      });
    }
    
    return () => {
      clearTimeout(timeout);
      if (player) {
        player.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isPlaying]);
  
  // Função para salvar o progresso atual
  const saveProgress = async () => {
    if (!videoRef.current || !courseId || isLoading) return;
    
    try {
      await saveVideoPosition(courseId, contentId, Math.floor(videoRef.current.currentTime));
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };
  
  // Marcar vídeo como concluído 
  const handleVideoCompletion = async () => {
    if (completed || !autoMarkComplete) return;
    
    try {
      await markContentAsCompleted(courseId, contentId);
      setCompleted(true);
      
      if (onComplete) {
        onComplete();
      }
      
      toast({
        title: "Conteúdo concluído",
        description: "Este vídeo foi marcado como concluído"
      });
    } catch (error) {
      console.error('Erro ao marcar vídeo como concluído:', error);
    }
  };
  
  // Marca manualmente o vídeo como concluído
  const handleMarkComplete = async () => {
    if (completed) return;
    
    try {
      await markContentAsCompleted(courseId, contentId);
      setCompleted(true);
      
      if (onComplete) {
        onComplete();
      }
      
      toast({
        title: "Conteúdo concluído",
        description: "Este vídeo foi marcado como concluído"
      });
    } catch (error) {
      console.error('Erro ao marcar vídeo como concluído:', error);
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar o vídeo como concluído"
      });
    }
  };
  
  // Função para play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  
  // Função para mutar/desmutar
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setIsMuted(!isMuted);
    video.muted = !isMuted;
  };
  
  // Função para fullscreen
  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;
    
    if (!document.fullscreenElement) {
      player.requestFullscreen().catch(err => {
        console.error('Erro ao entrar em tela cheia:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Funções para pular para frente/trás
  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  };
  
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };
  
  // Função para mudar o volume
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  };
  
  // Função para mudar a posição do vídeo
  const handlePositionChange = (values: number[]) => {
    const newPosition = values[0];
    setCurrentTime(newPosition);
    
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = newPosition;
  };
  
  // Formatar o tempo
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let result = '';
    
    if (hrs > 0) {
      result += `${hrs}:${mins < 10 ? '0' : ''}`;
    }
    
    result += `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    return result;
  };
  
  return (
    <div 
      ref={playerRef} 
      className={`relative overflow-hidden rounded-md bg-black ${
        isFullscreen ? 'w-screen h-screen' : 'w-full aspect-video'
      }`}
    >
      {/* Vídeo */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        poster={thumbnailUrl}
        onClick={togglePlay}
        preload="metadata"
      />
      
      {/* Overlay de carregamento */}
      {loadingProgress && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Controles */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/50 via-transparent to-black/50 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Título do Vídeo */}
        <div className="text-white font-medium drop-shadow-md">
          {videoTitle}
        </div>
        
        {/* Área central (play/pause) */}
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          {!isPlaying && (
            <div className="bg-black/30 rounded-full p-4 transform transition-transform hover:scale-110">
              <Play className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
        
        {/* Controles inferiores */}
        <div className="space-y-2">
          {/* Barra de progresso */}
          <div className="flex items-center">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handlePositionChange}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={skipBackward}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={skipForward}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Botão de marcar como concluído */}
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 text-white hover:bg-white/20 ${completed ? 'text-green-500' : ''}`}
                onClick={handleMarkComplete}
                disabled={completed}
              >
                <CheckCircle className={`h-5 w-5 mr-1 ${completed ? 'text-green-500' : ''}`} />
                {completed ? 'Concluído' : 'Marcar como concluído'}
              </Button>
              
              <div className="flex items-center w-24 gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-14"
                />
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerWithProgress; 