export const SITE = {
  name: 'specialDay',
  tagline: 'Transforme sentimentos em algo inesquecível.',
  description:
    'Crie cartas digitais emocionais e compartilhe por link. Sem cadastro. Em minutos.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  twitter: '@specialday',
  themeColor: '#e11d74',
}

export const FAQ_ITEMS = [
  {
    q: 'Preciso criar uma conta?',
    a: 'Não. O specialDay foi feito sem login. Você cria a carta, ganha um link e pronto.',
  },
  {
    q: 'Como eu edito a carta depois?',
    a: 'No momento da criação você recebe um link secreto de edição. Guarde-o: ele é a única forma de editar a carta depois.',
  },
  {
    q: 'Posso proteger a carta com senha?',
    a: 'Sim. Você pode marcar como privada e definir uma senha. Só quem souber consegue abrir.',
  },
  {
    q: 'É possível agendar uma carta?',
    a: 'Sim. Defina uma data de desbloqueio e a carta só será aberta a partir dela.',
  },
  {
    q: 'A carta fica disponível para sempre?',
    a: 'Sim, enquanto o link existir. Você pode editar ou despublicar a qualquer momento via link de edição.',
  },
  {
    q: 'Quanto custa?',
    a: 'O MVP é gratuito enquanto estamos validando. Aproveite.',
  },
]
