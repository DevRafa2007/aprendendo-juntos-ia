import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Radio,
  Checkbox,
  RadioGroup,
  Stack,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  CheckboxGroup,
  useToast,
  VStack,
  Heading,
  Divider,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Progress,
  Flex,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { useProgress } from '../../contexts/ProgressContext';

// Tipos de questões
type QuestionType = 'single' | 'multiple' | 'true_false';

// Interface para alternativas
interface Alternative {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Interface para uma questão
interface Question {
  id: string;
  type: QuestionType;
  text: string;
  explanation?: string;
  alternatives: Alternative[];
  points: number;
}

// Interface para o quiz completo
interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // em minutos, opcional
}

// Interface para as props do componente
interface QuizPlayerProps {
  quiz: Quiz;
  courseId: string;
  moduleId: string;
  contentId: string;
  onComplete?: (passed: boolean, score: number) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  courseId,
  moduleId,
  contentId,
  onComplete,
}) => {
  // Estados
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string[] }>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [remainingTime, setRemainingTime] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : 0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // Hooks
  const toast = useToast();
  const { markContentAsCompleted } = useProgress();
  
  // Calcular a pontuação total possível
  const totalPoints = quiz.questions.reduce((sum, question) => sum + question.points, 0);
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  
  // Temporizador para o quiz
  useEffect(() => {
    if (!quiz.timeLimit || isQuizSubmitted || isTimeUp) return;
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quiz.timeLimit, isQuizSubmitted, isTimeUp]);
  
  // Formatar o tempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Navegar para a próxima questão
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  // Navegar para a questão anterior
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Selecionar uma resposta para uma questão
  const handleSelectAnswer = (questionId: string, answerId: string, isMultiple: boolean) => {
    setSelectedAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      
      if (isMultiple) {
        // Para questões de múltipla escolha
        if (currentAnswers.includes(answerId)) {
          // Se já está selecionado, remove
          return {
            ...prev,
            [questionId]: currentAnswers.filter(id => id !== answerId)
          };
        } else {
          // Se não está selecionado, adiciona
          return {
            ...prev,
            [questionId]: [...currentAnswers, answerId]
          };
        }
      } else {
        // Para questões de escolha única
        return {
          ...prev,
          [questionId]: [answerId]
        };
      }
    });
  };
  
  // Calcular a pontuação do quiz
  const calculateScore = () => {
    let totalScore = 0;
    
    quiz.questions.forEach(question => {
      const userAnswers = selectedAnswers[question.id] || [];
      const correctAnswers = question.alternatives
        .filter(alt => alt.isCorrect)
        .map(alt => alt.id);
      
      // Para questões de múltipla escolha, todas as respostas corretas devem ser selecionadas
      // e nenhuma incorreta pode ser selecionada
      if (question.type === 'multiple') {
        const allCorrectSelected = correctAnswers.every(id => userAnswers.includes(id));
        const noIncorrectSelected = userAnswers.every(id => correctAnswers.includes(id));
        
        if (allCorrectSelected && noIncorrectSelected) {
          totalScore += question.points;
        }
      } else {
        // Para questões de escolha única ou verdadeiro/falso
        if (userAnswers.length === 1 && correctAnswers.includes(userAnswers[0])) {
          totalScore += question.points;
        }
      }
    });
    
    return totalScore;
  };
  
  // Enviar o quiz para avaliação
  const handleSubmitQuiz = () => {
    const finalScore = calculateScore();
    const percentageScore = (finalScore / totalPoints) * 100;
    const passed = percentageScore >= quiz.passingScore;
    
    setScore(finalScore);
    setIsQuizSubmitted(true);
    
    if (passed) {
      toast({
        title: 'Quiz concluído com sucesso!',
        description: `Você obteve ${finalScore} de ${totalPoints} pontos (${Math.round(percentageScore)}%).`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Marcar o conteúdo como concluído
      markContentAsCompleted(courseId, moduleId, contentId)
        .catch(err => console.error("Erro ao marcar quiz como concluído:", err));
    } else {
      toast({
        title: 'Quiz concluído',
        description: `Você obteve ${finalScore} de ${totalPoints} pontos (${Math.round(percentageScore)}%). Pontuação mínima necessária: ${quiz.passingScore}%.`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
    
    if (onComplete) {
      onComplete(passed, percentageScore);
    }
  };
  
  // Renderizar o resultado de uma questão específica
  const renderQuestionResult = (question: Question) => {
    const userAnswers = selectedAnswers[question.id] || [];
    
    return (
      <Box mt={4} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
        <Text fontWeight="medium" mb={2}>{question.text}</Text>
        
        <Stack spacing={2}>
          {question.alternatives.map(alt => {
            const isSelected = userAnswers.includes(alt.id);
            const isCorrect = alt.isCorrect;
            
            let bgColor = 'transparent';
            if (isSelected && isCorrect) bgColor = 'green.100';
            else if (isSelected && !isCorrect) bgColor = 'red.100';
            else if (!isSelected && isCorrect) bgColor = 'green.50';
            
            return (
              <Box 
                key={alt.id} 
                p={2} 
                borderRadius="md" 
                bg={bgColor}
                display="flex"
                alignItems="center"
              >
                <Box mr={2}>
                  {isSelected && isCorrect && <CheckCircleIcon color="green.500" />}
                  {isSelected && !isCorrect && <WarningIcon color="red.500" />}
                  {!isSelected && isCorrect && <InfoIcon color="green.500" />}
                </Box>
                <Text>{alt.text}</Text>
              </Box>
            );
          })}
        </Stack>
        
        {question.explanation && (
          <Alert status="info" mt={3}>
            <AlertIcon />
            <Box>
              <AlertTitle>Explicação:</AlertTitle>
              <Text>{question.explanation}</Text>
            </Box>
          </Alert>
        )}
      </Box>
    );
  };
  
  // Renderizar os resultados do quiz completo
  const renderQuizResults = () => {
    const percentageScore = (score / totalPoints) * 100;
    const passed = percentageScore >= quiz.passingScore;
    
    return (
      <VStack spacing={6} align="stretch" w="100%">
        <Box textAlign="center" p={6} borderRadius="lg" bg={passed ? "green.50" : "orange.50"}>
          <Heading size="md" mb={3}>
            {passed ? "Parabéns! Você passou no quiz." : "Você não atingiu a pontuação mínima."}
          </Heading>
          
          <Text fontSize="lg" fontWeight="bold">
            Pontuação: {score} de {totalPoints} pontos ({Math.round(percentageScore)}%)
          </Text>
          
          <Text mt={2}>
            Pontuação mínima necessária: {quiz.passingScore}%
          </Text>
        </Box>
        
        <Divider />
        
        <Heading size="md" mb={3}>Revisão das questões</Heading>
        
        {quiz.questions.map((question, index) => (
          <Box key={question.id} mb={4}>
            <Text fontWeight="bold" mb={2}>
              Questão {index + 1}: 
            </Text>
            {renderQuestionResult(question)}
          </Box>
        ))}
        
        <Button 
          colorScheme={passed ? "green" : "blue"} 
          mt={4}
          onClick={() => setIsQuizSubmitted(false)}
        >
          {passed ? "Continuar" : "Tentar novamente"}
        </Button>
      </VStack>
    );
  };
  
  // Renderizar uma questão
  const renderQuestion = () => {
    const question = quiz.questions[currentQuestionIndex];
    const selectedAnswerIds = selectedAnswers[question.id] || [];
    const isMultipleChoice = question.type === 'multiple';
    
    return (
      <Card variant="outline" w="100%">
        <CardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading size="md">
              Questão {currentQuestionIndex + 1} de {quiz.questions.length}
            </Heading>
            
            {quiz.timeLimit && (
              <Text 
                color={remainingTime < 60 ? "red.500" : remainingTime < 300 ? "orange.500" : "inherit"}
                fontWeight={remainingTime < 300 ? "bold" : "normal"}
              >
                Tempo: {formatTime(remainingTime)}
              </Text>
            )}
          </Flex>
        </CardHeader>
        
        <CardBody>
          <Text fontWeight="medium" mb={4}>{question.text}</Text>
          
          {isMultipleChoice ? (
            <CheckboxGroup value={selectedAnswerIds}>
              <Stack spacing={3}>
                {question.alternatives.map(alt => (
                  <Checkbox
                    key={alt.id}
                    value={alt.id}
                    onChange={() => handleSelectAnswer(question.id, alt.id, true)}
                  >
                    {alt.text}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          ) : (
            <RadioGroup value={selectedAnswerIds[0] || ''}>
              <Stack spacing={3}>
                {question.alternatives.map(alt => (
                  <Radio
                    key={alt.id}
                    value={alt.id}
                    onChange={() => handleSelectAnswer(question.id, alt.id, false)}
                  >
                    {alt.text}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          )}
        </CardBody>
        
        <CardFooter>
          <Flex justifyContent="space-between" w="100%">
            <Button
              onClick={handlePrevQuestion}
              isDisabled={currentQuestionIndex === 0}
            >
              Anterior
            </Button>
            
            {isLastQuestion ? (
              <Button
                colorScheme="blue"
                onClick={handleSubmitQuiz}
                isDisabled={!selectedAnswerIds.length}
              >
                Finalizar Quiz
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                onClick={handleNextQuestion}
                isDisabled={!selectedAnswerIds.length}
              >
                Próxima
              </Button>
            )}
          </Flex>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <Box w="100%">
      <Heading size="md" mb={4}>{quiz.title}</Heading>
      
      {quiz.description && (
        <Text mb={6}>{quiz.description}</Text>
      )}
      
      <Progress 
        value={(currentQuestionIndex / quiz.questions.length) * 100} 
        mb={6}
        colorScheme="blue"
        borderRadius="md"
        display={isQuizSubmitted ? "none" : "block"}
      />
      
      {isQuizSubmitted ? renderQuizResults() : renderQuestion()}
    </Box>
  );
}; 