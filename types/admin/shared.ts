export interface SidebarItem {
  key: string;
  label: string;
  href: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
} 