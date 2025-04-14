// Este arquivo não existe ainda ou não está disponível para edição.
// Para implementar a funcionalidade no componente CourseDetail, precisamos atualizar o botão de matrícula
// para direcionar para a página de checkout.

// Sugestão de alteração no componente CourseDetail.tsx:
/*
// Substituir o botão de matrícula existente por:

{isEnrolled ? (
  <Button size="lg" onClick={() => navigate(`/curso/${id}/conteudo`)}>
    Continuar curso
  </Button>
) : (
  <Button 
    size="lg" 
    onClick={() => navigate(`/checkout/${id}`)}
    className="bg-gradient-to-r from-brand-blue to-brand-green hover:from-brand-blue/90 hover:to-brand-green/90 text-white"
  >
    Matricular-se por R$ {price?.toFixed(2)}
  </Button>
)}
*/ 