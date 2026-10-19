import { SearchFilters, LocationSuggestion } from "./search";
import { TransportWithDetails, CreateTransportInput } from "./transport";
import { AnalyticsSummary } from "./analytics";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
}

export interface CustomDropdownProps<T extends string = string> {
  label?: string;
  icon?: React.ReactNode;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  isActive?: boolean;
  size?: "sm" | "default";
  align?: "left" | "right";
}

export interface HeaderProps {
  analytics: AnalyticsSummary | null;
  onOpenAddModal: () => void;
  onExportExcel: () => void;
  onOpenSearchModal?: () => void;
  isExporting: boolean;
}

export interface SearchBarProps {
  source: string;
  destination: string;
  onSourceChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSwap: () => void;
  onClear: () => void;
  availableCities: string[];
  availableLocations?: LocationSuggestion[];
  onOpenFilterModal?: () => void;
  activeFilterCount?: number;
}

export interface CitySearchInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  availableCities: string[];
  availableLocations?: LocationSuggestion[];
  theme: "orange" | "emerald";
}

export interface TransportCardProps {
  transport: TransportWithDetails;
}

export interface TransportListProps {
  transports: TransportWithDetails[];
  totalCount: number;
  isLoading: boolean;
  filters: SearchFilters;
  onFilterChange: (newFilters: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  onOpenFilterModal: () => void;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFilterChange: (newFilters: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  totalCount: number;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  transport: TransportWithDetails | null;
  isDeleting: boolean;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

export interface TransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransportInput, isEdit: boolean) => Promise<void>;
  editTransport: TransportWithDetails | null;
}

export type FacilityTabFilter =
  "all" | "office" | "godown" | "pickup_and_dropoff";

export type TransportCardLocationTab = "all" | "offices" | "godowns";

export interface FreightEstimatorState {
  unit: string;
  quantity: number;
}

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transports: TransportWithDetails[];
  onFilterDirectory?: (query: string) => void;
}
