export interface FetchTransactionFilters {
  type?: 'income' | 'expense'
  category?: string
  userId?: string
  startDate?: Date
  endDate: Date
  page: number
  limit: number
}
