import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  AspectRatio,
  Button,
  Text,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  IconButton,
  Tooltip,
  Progress,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaForward,
  FaBackward,
  FaCheck,
} from 'react-icons/fa';
import { useProgress } from '../../contexts/ProgressContext';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  courseId: string;
  moduleId: string;
  contentId: string;
  autoMarkComplete?: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  courseId,
  moduleId,
  contentId,
  autoMarkComplete = true,
  onComplete,
  onError,
}) => {
  // Refs e estados
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchPercentage, setWatchPercentage] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // Hooks do Chakra UI
  const controlsBg = useColorModeValue('blackAlpha.700', 'blackAlpha.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Context do progresso
  const { 
    updateContentProgress, 
    markContentAsCompleted, 
    getContentProgress 
  } = useProgress();
  
  // Formatar tempo no formato mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Carregar progresso salvo anteriormente
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const progress = getContentProgress(courseId, moduleId, contentId);
        
        if (progress) {
          setHasCompleted(progress.completed);
          
          if (progress.position > 0 && videoRef.current) {
            videoRef.current.currentTime = progress.position;
            setCurrentTime(progress.position);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar progresso salvo:", err);
      }
    };
    
    if (videoRef.current) {
      loadSavedProgress();
    }
  }, [courseId, moduleId, contentId, getContentProgress]);

  // Monitorar eventos do vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const percentage = (video.currentTime / video.duration) * 100;
      setWatchPercentage(percentage);
      
      // Verificar se o aluno assistiu a mais de 90% do vídeo para marcar como concluído
      if (autoMarkComplete && percentage > 90 && !hasCompleted) {
        setHasCompleted(true);
        if (onComplete) onComplete();
        markContentAsCompleted(courseId, moduleId, contentId)
          .catch(err => console.error("Erro ao marcar conteúdo como concluído:", err));
      }
    };
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleError = () => {
      setLoading(false);
      const errorMsg = "Erro ao carregar vídeo. Verifique sua conexão ou tente novamente mais tarde.";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (!hasCompleted) {
        setHasCompleted(true);
        if (onComplete) onComplete();
        markContentAsCompleted(courseId, moduleId, contentId)
          .catch(err => console.error("Erro ao marcar conteúdo como concluído:", err));
      }
    };

    // Registrar eventos
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    // Iniciar intervalo para salvar o progresso a cada 5 segundos de reprodução
    progressInterval.current = window.setInterval(() => {
      if (video && isPlaying) {
        updateContentProgress(
          courseId,
          moduleId,
          contentId,
          video.currentTime,
          hasCompleted
        ).catch(err => console.error("Erro ao atualizar progresso:", err));
      }
    }, 5000);

    // Limpeza
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      // Salvar progresso ao desmontar
      updateContentProgress(
        courseId,
        moduleId,
        contentId,
        video.currentTime,
        hasCompleted
      ).catch(err => console.error("Erro ao salvar progresso:", err));
    };
  }, [
    courseId, 
    moduleId, 
    contentId, 
    isPlaying, 
    hasCompleted, 
    autoMarkComplete, 
    onComplete, 
    onError, 
    updateContentProgress, 
    markContentAsCompleted
  ]);

  // Manipuladores de controle de vídeo
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    if (value === 0) {
      video.muted = true;
    } else if (isMuted) {
      video.muted = false;
    }
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = (value / 100) * duration;
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, duration);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (error) {
    return (
      <Box p={5} borderWidth="1px" borderRadius="lg" bg="red.50" color="red.700">
        <Text fontWeight="bold">Erro ao carregar vídeo</Text>
        <Text mt={2}>{error}</Text>
        <Button mt={4} colorScheme="red" onClick={() => setError(null)}>
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      position="relative"
      borderRadius="md"
      overflow="hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      bg="black"
    >
      {/* Vídeo */}
      <AspectRatio ratio={16 / 9}>
        <Box>
          <video
            ref={videoRef}
            src={videoUrl}
            onClick={togglePlay}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            playsInline
          />
          
          {loading && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              alignItems="center"
              justifyContent="center"
              bg="blackAlpha.600"
            >
              <Box textAlign="center" color="white">
                <Text mb={4}>Carregando vídeo...</Text>
                <Progress isIndeterminate width="200px" colorScheme="blue" />
              </Box>
            </Flex>
          )}
        </Box>
      </AspectRatio>

      {/* Título do vídeo */}
      <Text 
        position="absolute" 
        top="0" 
        left="0" 
        m={4} 
        color="white" 
        fontWeight="bold"
        textShadow="0px 0px 4px rgba(0,0,0,0.8)"
        opacity={showControls ? 1 : 0}
        transition="opacity 0.3s"
      >
        {title}
      </Text>

      {/* Controles */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        bg={controlsBg}
        p={2}
        opacity={showControls ? 1 : 0}
        transition="opacity 0.3s"
      >
        {/* Slider de progresso */}
        <Slider
          aria-label="progresso-video"
          min={0}
          max={100}
          value={(currentTime / duration) * 100 || 0}
          onChange={handleSeek}
          mb={2}
        >
          <SliderTrack bg="gray.600">
            <SliderFilledTrack bg="blue.500" />
          </SliderTrack>
          <SliderThumb boxSize={3} />
        </Slider>

        {/* Botões de controle */}
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <IconButton
              aria-label="Retroceder 10 segundos"
              icon={<FaBackward />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={skipBackward}
              mr={1}
            />
            <IconButton
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              icon={isPlaying ? <FaPause /> : <FaPlay />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={togglePlay}
              mr={1}
            />
            <IconButton
              aria-label="Avançar 10 segundos"
              icon={<FaForward />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={skipForward}
              mr={3}
            />
            
            <IconButton
              aria-label={isMuted ? "Ativar som" : "Desativar som"}
              icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={toggleMute}
              mr={2}
            />
            
            <Slider
              aria-label="volume"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              width="80px"
              mr={4}
              display={{ base: "none", md: "block" }}
            >
              <SliderTrack bg="gray.600">
                <SliderFilledTrack bg="white" />
              </SliderTrack>
              <SliderThumb boxSize={2} />
            </Slider>
            
            <Text color="white" fontSize="sm" mr={2}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </Flex>

          <Flex align="center">
            {hasCompleted && (
              <Tooltip label="Conteúdo concluído">
                <Icon as={FaCheck} color="green.300" mr={2} />
              </Tooltip>
            )}
            
            <IconButton
              aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              icon={isFullscreen ? <FaCompress /> : <FaExpand />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={toggleFullscreen}
            />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}; 