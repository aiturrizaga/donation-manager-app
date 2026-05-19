export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface PageContent<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export type ApiPagedResponse<T> = ApiResponse<PageContent<T>>;
