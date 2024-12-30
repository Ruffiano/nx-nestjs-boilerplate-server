export interface QueryResult<T> {
    results: any[] | T[] | any; // The array of results (documents)
    page: number; // Current page
    limit: number; // Maximum number of results per page
    totalPages: number; // Total number of pages
    totalResults: number; // Total number of documents
  }
  
  export interface QueryOptions {
    sortBy?: string; // Sorting criteria (e.g., 'name:asc,createdAt:desc')
    projectBy?: string; // Fields to include or exclude (e.g., 'name,email')
    populate?: string; // Relations to populate (e.g., 'user,posts')
    limit?: number; // Maximum number of results per page (default = 10)
    page?: number; // Current page (default = 1)
  }
  