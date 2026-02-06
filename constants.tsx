
import { Character } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'pari',
    name: 'Pari',
    description: 'Female, Indian origin.',
    color: '#ff9933',
    image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka&backgroundColor=b6e3f4&accessoriesProbability=0'
  },
  {
    id: 'vania',
    name: 'Vania',
    description: 'Female, South American, medium long hair.',
    color: '#33cc33',
    image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Vania&backgroundColor=ffdfbf&accessoriesProbability=0'
  },
  {
    id: 'claudie',
    name: 'Claudie',
    description: 'Female, short light brown hair.',
    color: '#3399ff',
    image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Celia&backgroundColor=c0aede&accessoriesProbability=0'
  },
  {
    id: 'ramon',
    name: 'Ramon',
    description: 'Male, short dark brown hair with some gray. Has glasses.',
    color: '#9966cc',
    // Switched to a seed that naturally includes glasses and removed complex parameters that might break the URL
    image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Beto&backgroundColor=d1d4f9'
  },
  {
    id: 'philip',
    name: 'Philip',
    description: 'Male, huge muscles.',
    color: '#e11d48',
    image: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Philip&backgroundColor=ffd5dc&accessoriesProbability=0'
  }
];

export const OTHER_PEOPLE = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Anita&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Beto&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Carla&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Doris&backgroundColor=ffd5dc',
];
