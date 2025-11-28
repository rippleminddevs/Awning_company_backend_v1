export type ContentType = 'about' | 'privacy' | 'terms' | 'faq';

export interface IContent {
  _id?: string;
  type: ContentType;
  title?: string; // For about/privacy/terms
  content?: string; // HTML content for about/privacy/terms
  question?: string; // Question for FAQ
  answer?: string; // Plain text answer for FAQ
  order?: number; // Order for FAQ items
  createdAt?: Date;
  updatedAt?: Date;
}
