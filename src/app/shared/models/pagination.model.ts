export interface PageQuery {
  page: number;
  size: number;
}

export const DEFAULT_PAGE_QUERY: PageQuery = {
  page: 1,
  size: 50,
};
