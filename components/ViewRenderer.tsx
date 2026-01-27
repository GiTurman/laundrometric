
import React from 'react';
import { ViewID, ScenarioType, FinancialInputs, Language } from '../types';
import { FoundersView } from './FoundersView';
import { CapacityPlanner } from './CapacityPlanner';
import { ClientDatabaseView } from './ClientDatabaseView';
import { CapexView } from './CapexView';
import { MarketAnalysisView } from './MarketAnalysisView';
import { OpexView } from './OpexView';
import { ModelSettingsView } from './ModelSettingsView';
import { FinancialStatementsView } from './FinancialStatementsView';
import { InvestmentsView } from './InvestmentsView';
import { SalesGrowthView } from './SalesGrowthView';
import { FinancialRatiosView } from './FinancialRatiosView';
import { DashboardView } from './DashboardView';
import { StrategicAnalysisView } from './StrategicAnalysisView';
import { ActionPlanView } from './ActionPlanView';
import { GlossaryView } from './GlossaryView';
import { WebInstructionView } from './WebInstructionView';
import { MakeWithPromptView } from './MakeWithPromptView';

interface ViewRendererProps {
  activeView: ViewID;
  scenario: ScenarioType;
  lang: Language;
  onScenarioChange: (s: ScenarioType) => void;
  onDataUpdate: (data: string) => void;
  inputs: FinancialInputs;
  onInputChange: (key: keyof FinancialInputs, value: any) => void;
  aiExpanded: boolean;
}

export const ViewRenderer: React.FC<ViewRendererProps> = ({ 
  activeView, 
  scenario, 
  lang,
  onScenarioChange,
  onDataUpdate,
  inputs,
  onInputChange,
  aiExpanded
}) => {
  if (activeView === ViewID.DASHBOARD) {
    return <DashboardView scenario={scenario} inputs={inputs} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.MODEL_SETTINGS) {
    return <ModelSettingsView key={scenario} scenario={scenario} onScenarioChange={onScenarioChange} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.FOUNDERS) {
    return <FoundersView scenario={scenario} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.CLIENT_DATABASE) {
    return <ClientDatabaseView scenario={scenario} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.CAPACITY_PLANNER) {
    return <CapacityPlanner inputs={inputs} onChange={onInputChange} onDataUpdate={onDataUpdate} aiExpanded={aiExpanded} />;
  }

  if (activeView === ViewID.CAPEX) {
    return <CapexView scenario={scenario} inputs={inputs} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.MARKET_ANALYSIS) {
    return <MarketAnalysisView scenario={scenario} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.OPEX) {
    return <OpexView scenario={scenario} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.INVESTMENTS) {
    return <InvestmentsView scenario={scenario} />;
  }

  if (activeView === ViewID.SALES_GROWTH) {
    return <SalesGrowthView scenario={scenario} inputs={inputs} onDataUpdate={onDataUpdate} onInputChange={onInputChange} />;
  }

  if (activeView === ViewID.FINANCIAL_RATIOS) {
    return <FinancialRatiosView scenario={scenario} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.SWOT_STRATEGY) {
    return <StrategicAnalysisView scenario={scenario} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.ACTION_PLAN) {
    return <ActionPlanView scenario={scenario} onDataUpdate={onDataUpdate} />;
  }

  if (activeView === ViewID.GLOSSARY) {
    return <GlossaryView lang={lang} />;
  }

  if (activeView === ViewID.WEB_INSTRUCTION) {
    return <WebInstructionView lang={lang} />;
  }

  if (activeView === ViewID.MAKE_WITH_PROMPT) {
    return <MakeWithPromptView lang={lang} scenario={scenario} />;
  }

  if ([ViewID.PL_STATEMENT, ViewID.BALANCE_SHEET, ViewID.CASH_FLOW].includes(activeView)) {
    return <FinancialStatementsView viewId={activeView} scenario={scenario} />;
  }

  return (
    <div className="p-20 text-center border-4 border-dashed rounded-[3rem] text-slate-300 font-black uppercase text-2xl">
      {activeView.replace('-', ' ')} Initializing...
    </div>
  );
};
