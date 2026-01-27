
export enum ScenarioType {
  CONSERVATIVE = 'Conservative',
  BASE_CASE = 'Base Case',
  AGGRESSIVE = 'Aggressive',
  CUSTOM = 'Custom'
}

export enum Language {
  EN = 'en',
  GE = 'ge',
  DE = 'de'
}

export enum ViewID {
  DASHBOARD = 'dashboard',
  MODEL_SETTINGS = 'model-settings',
  CAPACITY_PLANNER = 'capacity-planner',
  MARKET_ANALYSIS = 'market-analysis',
  SALES_GROWTH = 'sales-growth', 
  INVESTMENTS = 'investments',
  FOUNDERS = 'founders',
  CLIENT_DATABASE = 'client-database',
  CAPEX = 'capex',
  OPEX = 'opex',
  PL_STATEMENT = 'pl-statement',
  BALANCE_SHEET = 'balance-sheet',
  CASH_FLOW = 'cash-flow',
  FINANCIAL_RATIOS = 'financial-ratios',
  SWOT_STRATEGY = 'swot-strategy',
  ACTION_PLAN = 'action-plan',
  GLOSSARY = 'glossary',
  WEB_INSTRUCTION = 'web-instruction',
  MAKE_WITH_PROMPT = 'make-with-prompt'
}

export interface NavItem {
  id: ViewID;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export interface LinenItem {
  id: string;
  nameKa: string;
  nameEn: string;
  weightG: number;
  qtyPerRoom: number;
  active: boolean;
}

export interface FinancialInputs {
  hotelRooms: number;
  utilizationRate: number;
  shiftsCount: number;
  ownedWashers: number;
  ownedDryers: number;
  ownedCalendars: number;
  hasAutoFolder: boolean;
  linenItems: LinenItem[];
}
