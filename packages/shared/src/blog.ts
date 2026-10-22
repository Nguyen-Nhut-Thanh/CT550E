export interface BlogHeroProps {
  title: string;
  summary: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  heroImage: string;
}

export type RelatedPost = {
  id: number;
  title: string;
  date: string;
  image: string;
  slug: string;
};
