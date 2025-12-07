
export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  uploadDate: string;
  isNew?: boolean;
  category: 'movie' | 'project' | 'music-video';
  downloadedPath?: string;
  price?: number;
  isPurchased?: boolean;
  isFree?: boolean;
  youtubeId?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium';
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface Purchase {
  movieId: string;
  purchaseDate: string;
  price: number;
  paymentIntentId?: string;
}
