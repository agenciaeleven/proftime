export const mockLessons = [
  {
    id: 1,
    subject: "Matemática",
    topic: "Equações do 2º Grau",
    grade: "9º Ano",
    duration: "50 min",
    date: "2026-04-04",
    status: "concluída"
  },
  {
    id: 2,
    subject: "Português",
    topic: "Interpretação de Texto",
    grade: "7º Ano",
    duration: "45 min",
    date: "2026-04-05",
    status: "pendente"
  },
  {
    id: 3,
    subject: "Ciências",
    topic: "Sistema Solar",
    grade: "6º Ano",
    duration: "50 min",
    date: "2026-04-06",
    status: "pendente"
  }
];

export const mockStudents = [
  { id: 1, name: "Ana Silva", grade: "9º Ano", score: 8.5, status: "aprovado" },
  { id: 2, name: "Bruno Costa", grade: "9º Ano", score: 6.0, status: "aprovado" },
  { id: 3, name: "Carla Souza", grade: "9º Ano", score: 4.5, status: "reprovado" },
  { id: 4, name: "Daniel Lima", grade: "9º Ano", score: 9.0, status: "aprovado" },
  { id: 5, name: "Elena Martins", grade: "9º Ano", score: 7.5, status: "aprovado" },
  { id: 6, name: "Felipe Oliveira", grade: "9º Ano", score: 3.0, status: "reprovado" },
  { id: 7, name: "Gabriela Santos", grade: "9º Ano", score: 8.0, status: "aprovado" },
  { id: 8, name: "Hugo Pereira", grade: "9º Ano", score: 5.5, status: "aprovado" },
];

export const mockFinancial = {
  totalReceive: 12500.00,
  totalPay: 3200.00,
  entries: [
    { id: 1, name: "Escola Municipal Centro", value: 4500.00, date: "2026-04-01", type: "entrada" },
    { id: 2, name: "Colégio São Paulo", value: 3800.00, date: "2026-04-01", type: "entrada" },
    { id: 3, name: "Aulas Particulares", value: 2200.00, date: "2026-04-03", type: "entrada" },
    { id: 4, name: "Curso de Capacitação", value: 1200.00, date: "2026-04-05", type: "saída" },
    { id: 5, name: "Material Didático", value: 800.00, date: "2026-04-02", type: "saída" },
    { id: 6, name: "Transporte", value: 600.00, date: "2026-04-04", type: "saída" },
    { id: 7, name: "Reforço Escolar", value: 2000.00, date: "2026-04-06", type: "entrada" },
    { id: 8, name: "Software Educacional", value: 600.00, date: "2026-04-03", type: "saída" },
  ]
};

export const mockTrends = [
  {
    id: 1,
    title: "Inteligência Artificial na Educação",
    category: "Tecnologia",
    description: "Descubra como usar IA para personalizar o aprendizado de cada aluno e otimizar seu tempo de preparo de aulas.",
    color: "from-violet-500 to-purple-600"
  },
  {
    id: 2,
    title: "Gamificação em Sala de Aula",
    category: "Metodologia",
    description: "Estratégias práticas para transformar suas aulas em experiências engajantes usando elementos de jogos.",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: 3,
    title: "Educação Socioemocional",
    category: "Bem-estar",
    description: "Técnicas para desenvolver habilidades socioemocionais dos alunos enquanto ensina o conteúdo curricular.",
    color: "from-orange-500 to-amber-600"
  },
  {
    id: 4,
    title: "Aprendizagem Baseada em Projetos",
    category: "Metodologia",
    description: "Como implementar projetos interdisciplinares que conectam teoria à prática do dia a dia dos estudantes.",
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: 5,
    title: "Inclusão Digital",
    category: "Tecnologia",
    description: "Ferramentas gratuitas para tornar suas aulas mais acessíveis e inclusivas para todos os alunos.",
    color: "from-pink-500 to-rose-600"
  },
  {
    id: 6,
    title: "Avaliação Formativa",
    category: "Avaliação",
    description: "Métodos modernos de avaliação contínua que substituem provas tradicionais e engajam mais os alunos.",
    color: "from-indigo-500 to-blue-600"
  }
];

export const mockSlides = [
  {
    id: 1,
    title: "Equações do 2º Grau",
    subtitle: "Introdução e Conceitos",
    content: [
      "O que é uma equação do 2º grau?",
      "Forma geral: ax² + bx + c = 0",
      "Identificando coeficientes a, b e c"
    ]
  },
  {
    id: 2,
    title: "Fórmula de Bhaskara",
    subtitle: "Resolvendo Equações",
    content: [
      "Δ = b² - 4ac",
      "x = (-b ± √Δ) / 2a",
      "Passo a passo da resolução"
    ]
  },
  {
    id: 3,
    title: "Tipos de Raízes",
    subtitle: "Análise do Discriminante",
    content: [
      "Δ > 0 → Duas raízes reais distintas",
      "Δ = 0 → Duas raízes reais iguais",
      "Δ < 0 → Sem raízes reais"
    ]
  },
  {
    id: 4,
    title: "Atividade Prática",
    subtitle: "Exercícios",
    content: [
      "Resolva: x² - 5x + 6 = 0",
      "Resolva: 2x² + 3x - 2 = 0",
      "Identifique os coeficientes: 3x² - x = 0"
    ]
  },
  {
    id: 5,
    title: "Conclusão",
    subtitle: "Resumo da Aula",
    content: [
      "Relembrando os conceitos principais",
      "Importância das equações no cotidiano",
      "Próxima aula: Problemas com equações"
    ]
  }
];

export const mockAgenda = [
  { id: 1, school: "Escola Municipal Centro", class: "9º A", time: "07:30", day: "seg", subject: "Matemática" },
  { id: 2, school: "Escola Municipal Centro", class: "9º B", time: "08:20", day: "seg", subject: "Matemática" },
  { id: 3, school: "Colégio São Paulo", class: "7º A", time: "13:30", day: "ter", subject: "Português" },
  { id: 4, school: "Colégio São Paulo", class: "7º B", time: "14:20", day: "ter", subject: "Português" },
  { id: 5, school: "Escola Municipal Centro", class: "6º A", time: "07:30", day: "qua", subject: "Ciências" },
  { id: 6, school: "Aula Particular", class: "Individual", time: "18:00", day: "qua", subject: "Matemática" },
  { id: 7, school: "Colégio São Paulo", class: "8º A", time: "13:30", day: "qui", subject: "Português" },
  { id: 8, school: "Escola Municipal Centro", class: "9º A", time: "07:30", day: "sex", subject: "Matemática" },
  { id: 9, school: "Reforço Escolar", class: "Grupo", time: "16:00", day: "sex", subject: "Matemática" },
];

export const mockChatMessages = [
  {
    role: "assistant",
    content: "Olá, Professor! 👋 Sou sua assistente pedagógica. Como posso ajudar você hoje? Posso sugerir dinâmicas, ajudar com planos de aula ou tirar dúvidas sobre metodologias."
  }
];

export const mockAIResponses = [
  "Aqui está uma sugestão de dinâmica para sua aula: **\"Quiz Interativo\"** — Divida a turma em grupos de 4 alunos. Cada grupo cria 3 perguntas sobre o tema. Os grupos trocam perguntas entre si e têm 2 minutos para responder. Isso estimula a colaboração e revisão do conteúdo! 🎯",
  "Para engajar mais seus alunos, experimente a técnica **\"Think-Pair-Share\"**: 1) Faça uma pergunta desafiadora. 2) Dê 2 min para pensarem sozinhos. 3) Discutam em duplas por 3 min. 4) Compartilhem com a turma. Funciona muito bem para temas complexos! 💡",
  "Ótima pergunta! Para avaliação formativa, sugiro usar **rubricas de autoavaliação**. Crie critérios claros (1-4 estrelas) para cada habilidade. Os alunos se avaliam e depois comparam com sua avaliação. Isso desenvolve metacognição! ⭐",
  "Sobre gestão de sala de aula, a estratégia **\"2-2-2\"** funciona bem: 2 regras claras, 2 consequências positivas e 2 consequências para comportamento inadequado. Mantenha simples e consistente! 📋",
  "Para aulas mais criativas, que tal o método **\"Sala de Aula Invertida\"**? Envie um vídeo curto (5min) sobre o tema como tarefa. Na aula, use o tempo para atividades práticas e discussões. Os alunos chegam preparados e você otimiza o tempo! 🚀"
];

export const mockOrganization = {
  folders: [
    {
      id: 1,
      name: "Matemática",
      icon: "📐",
      items: [
        { id: 1, title: "Equações do 2º Grau", status: "concluído", priority: "alta" },
        { id: 2, title: "Geometria Plana", status: "em progresso", priority: "média" },
        { id: 3, title: "Probabilidade", status: "pendente", priority: "baixa" },
      ]
    },
    {
      id: 2,
      name: "Português",
      icon: "📚",
      items: [
        { id: 4, title: "Interpretação de Texto", status: "concluído", priority: "alta" },
        { id: 5, title: "Gramática - Verbos", status: "em progresso", priority: "alta" },
        { id: 6, title: "Redação Dissertativa", status: "pendente", priority: "média" },
      ]
    },
    {
      id: 3,
      name: "Ciências",
      icon: "🔬",
      items: [
        { id: 7, title: "Sistema Solar", status: "concluído", priority: "média" },
        { id: 8, title: "Corpo Humano", status: "pendente", priority: "alta" },
      ]
    },
    {
      id: 4,
      name: "Projetos Especiais",
      icon: "🌟",
      items: [
        { id: 9, title: "Feira de Ciências", status: "em progresso", priority: "alta" },
        { id: 10, title: "Olimpíada de Matemática", status: "pendente", priority: "média" },
      ]
    }
  ]
};

export const generatedLessonPlan = {
  introduction: {
    title: "Introdução",
    duration: "10 min",
    content: "Iniciar a aula com uma pergunta motivadora: \"Vocês sabiam que equações do 2º grau são usadas para calcular trajetórias de foguetes?\" Apresentar exemplos do cotidiano onde equações aparecem. Revisar brevemente equações do 1º grau como base para o novo conteúdo."
  },
  development: {
    title: "Desenvolvimento",
    duration: "20 min",
    content: "Apresentar a forma geral ax² + bx + c = 0. Explicar cada coeficiente com exemplos visuais. Introduzir a Fórmula de Bhaskara passo a passo. Resolver 2 exemplos no quadro com participação dos alunos. Usar representação gráfica (parábola) para visualização."
  },
  activity: {
    title: "Atividade",
    duration: "15 min",
    content: "Dividir a turma em duplas. Cada dupla recebe 3 equações para resolver. Nível progressivo de dificuldade. Ao terminar, duplas comparam resultados com dupla vizinha. Professor circula tirando dúvidas individuais."
  },
  conclusion: {
    title: "Conclusão",
    duration: "5 min",
    content: "Revisão rápida dos conceitos-chave usando perguntas dirigidas. Antecipar o próximo tópico: \"Na próxima aula, veremos como usar equações para resolver problemas do dia a dia.\" Tarefa de casa: 5 exercícios do livro (pág. 142)."
  }
};