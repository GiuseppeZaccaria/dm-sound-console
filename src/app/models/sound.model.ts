export interface Sound {
  id: number;
  title: string;
  imageUrl: string;
  audioUrl: string;
  playCount?: number;
  isLooping?: boolean;
}
