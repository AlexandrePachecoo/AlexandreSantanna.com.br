// Templates pré-prontos para a landing — pegam o usuário pela emoção
// e levam direto para /create já com texto inicial.

export const TEMPLATES = [
  {
    id: 'romantic',
    label: 'Carta romântica',
    description: 'Para quem mora no seu coração.',
    emoji: '💌',
    theme: 'romantic',
    sample: {
      title: 'Para o amor da minha vida',
      content:
        'Tem dias em que eu fecho os olhos e percebo: você virou a parte mais bonita da minha rotina. Queria poder embrulhar todos os pequenos momentos que vivemos juntos e te devolver de uma só vez...',
    },
  },
  {
    id: 'proposal',
    label: 'Pedido de namoro',
    description: 'O passo que muda tudo.',
    emoji: '💍',
    theme: 'romantic',
    sample: {
      title: 'Quer namorar comigo?',
      content:
        'Eu pensei em mil formas de te perguntar isso. No final, percebi que o jeito mais honesto era esse: do meu jeito, com minhas palavras...',
    },
  },
  {
    id: 'birthday',
    label: 'Aniversário',
    description: 'Um parabéns que ninguém esquece.',
    emoji: '🎂',
    theme: 'birthday',
    sample: {
      title: 'Hoje é o seu dia',
      content:
        'Parabéns! Hoje eu queria que você soubesse o quanto a sua existência ilumina a vida de quem te ama. Que esse novo ciclo venha cheio de tudo que você merece...',
    },
  },
  {
    id: 'future',
    label: 'Carta para o futuro',
    description: 'Um recado para o seu eu de amanhã.',
    emoji: '🕰️',
    theme: 'vintage',
    sample: {
      title: 'Para quem eu vou ser daqui um ano',
      content:
        'Quando você abrir isso, espero que esteja sorrindo. Hoje, escrevendo, eu te desejo coragem para continuar...',
    },
  },
  {
    id: 'apology',
    label: 'Pedido de desculpas',
    description: 'Quando palavras precisam ser ditas.',
    emoji: '🤍',
    theme: 'minimal',
    sample: {
      title: 'Me desculpa',
      content:
        'Não escrevo isso para me justificar. Escrevo porque eu te devo um olhar honesto sobre o que aconteceu...',
    },
  },
  {
    id: 'friendship',
    label: 'Amizade',
    description: 'Para quem caminha lado a lado.',
    emoji: '🌟',
    theme: 'anime',
    sample: {
      title: 'Obrigado por existir na minha vida',
      content:
        'Tem amigo que vira família. Você é desses. Queria registrar, com calma, tudo que a sua presença significa pra mim...',
    },
  },
]
