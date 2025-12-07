
import { Movie } from '@/types/Movie';

export const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Afroman Exclusive: The Ultimate Collection',
    description: 'Get exclusive access to Afroman&apos;s ultimate collection featuring never-before-seen performances, behind-the-scenes footage, and special content. This premium video is available for a one-time purchase of $19.99.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574267432644-f610f5b7e4d1?w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 1800,
    uploadDate: '2024-01-15',
    isNew: true,
    category: 'movie',
    price: 19.99,
    isPurchased: false,
  },
];
