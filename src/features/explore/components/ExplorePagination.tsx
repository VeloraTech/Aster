import type { PaginationState } from '../types'

type ExplorePaginationProps = {
  pagination: PaginationState
  onPageChange: (page: number) => void
}

export default function ExplorePagination({
  pagination,
  onPageChange,
}: ExplorePaginationProps) {
  const { currentPage, totalPages } = pagination

  if (totalPages <= 1) return null

  return (
    <nav className="explore-pagination" aria-label="Technology result pages">
      <button
        className="pagination-button"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span className="pagination-status" aria-live="polite" aria-atomic="true">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="pagination-button"
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  )
}
