export interface RateDistribution {
  unit: string;
  minRate: number;
  maxRate: number;
  avgRate: number;
  count: number;
}

export interface CityCoverageStat {
  city: string;
  state: string;
  hubCount: number;
  transporterCount: number;
}

export interface StateCoverageStat {
  state: string;
  hubCount: number;
  cityCount: number;
  transporterCount: number;
}

export interface FacilityCompositionStat {
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface CorridorRateComparison {
  name: string;
  perKgRate: number;
  mediumBoxRate: number;
  verified: boolean;
}

export interface CorridorBenchmark {
  corridor: string;
  origin: string;
  destination: string;
  carriersCount: number;
  minPerKg: number;
  avgPerKg: number;
  minBoxRate: number;
}

export interface AnalyticsSummary {
  totalTransporters: number;
  totalHubs: number;
  citiesCount: number;
  statesCount: number;
  rateDistributions: RateDistribution[];
  topCities: CityCoverageStat[];
  stateCoverage: StateCoverageStat[];
  facilityBreakdown: FacilityCompositionStat[];
  corridorComparisons: CorridorRateComparison[];
  corridorBenchmarks: CorridorBenchmark[];
}

export interface AnalyticsFilterState {
  selectedState: string;
  selectedUnit: string;
  selectedFacilityType: string;
}

export interface AnalyticsKpiCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  badge?: string;
  trend?: string;
  accentColor?: "orange" | "emerald" | "blue" | "purple" | "cyan" | "amber";
  className?: string;
}
