
import { useMemo } from 'react';
import { ScenarioType } from '../types';

export interface MonthlyData {
  month: number;
  kgVolume: number;
  revenue: number;
  vatOnRevenue: number;
  
  // P&L Structure
  cogsTotal: number;
  cogsLines: Record<string, number>; 
  grossProfit: number;
  grossMargin: number;
  
  expensesTotal: number;
  expensesLines: Record<string, number>; 
  
  operatingResult: number; // EBIT
  operatingMargin: number;
  
  ebitda: number;
  depreciation: number;
  netProfit: number;
  
  // Cash Flow
  cfOperating: number;
  cfInvesting: number;
  cfFinancing: number;
  cfNet: number;
  cashBalance: number;
  
  // Balance Sheet (Liquidity Order Ready)
  cash: number;
  ar: number;
  inventory: number;
  ppeNet: number;
  vatReceivable: number; // New: Tracks VAT Asset
  assets: number;
  
  // Liabilities & Equity
  ap: number;
  vatLiability: number;
  liabilitiesTotal: number;
  
  equityContributed: number;
  retainedEarnings: number;
  equityTotal: number;
  
  liabilitiesEquity: number;
  isBalanced: boolean;
  
  // Investment Tracking
  repaymentAmount: number;
  investmentBalance: number;
}

export const useFinancialEngine = (scenario: ScenarioType) => {
  return useMemo(() => {
    const settings = JSON.parse(localStorage.getItem(`laundrometric_settings_${scenario}`) || '{}');
    const opexRows = JSON.parse(localStorage.getItem('laundrometric_opex_table_rows_v3') || '[]');
    const capexItems = JSON.parse(localStorage.getItem('laundrometric_capex_data') || '[]');
    const salesGrowthData = JSON.parse(localStorage.getItem(`laundrometric_sales_growth_${scenario}`) || '[]');
    const globalInputs = JSON.parse(localStorage.getItem('laundrometric_global_inputs') || '{}');
    
    const inventoryDays = settings.inventoryDays || 15;
    const preOpsCosts = settings.preOpsCosts || 5000;
    const vatRate = (settings.vatRate || 18) / 100;
    const minCash = settings.minCashReserve || 50000;

    const totalCapexGross = capexItems.reduce((s: number, i: any) => s + (i.totalGross || 0), 0);
    const totalCapexNet = capexItems.reduce((s: number, i: any) => s + (i.totalNet || 0), 0);
    
    // Initial VAT Asset (Recoverable VAT from CAPEX)
    const initialVatCredit = totalCapexGross - totalCapexNet;

    // Total Investment Requirement (Equity Funded)
    const totalInvestmentNeeded = totalCapexGross + preOpsCosts + minCash;
    
    let currentCash = minCash; 
    let currentPPENet = totalCapexNet;
    let currentRetainedEarnings = -preOpsCosts; 
    let currentEquityContributed = totalInvestmentNeeded;
    let remainingPaybackBalance = totalInvestmentNeeded;

    // Cumulative VAT Balance (Starts negative as we have an asset)
    let accumulatedVatBalance = -initialVatCredit; 
    let prevVatBalance = accumulatedVatBalance;

    const projection: MonthlyData[] = [];
    let firstProfitMonth: number | null = null;
    let prevAR = 0, prevAP = 0, prevInv = 0;

    // Weight per room constant if needed for fallback
    const weightPerRoomKg = globalInputs.linenItems?.filter((i: any) => i.active).reduce((acc: number, item: any) => acc + (item.weightG * item.qtyPerRoom / 1000), 0) || 4.5;
    const baseKgStart = (globalInputs.hotelRooms || 100) * weightPerRoomKg * (globalInputs.utilizationRate || 0.8) * 30;

    for (let m = 1; m <= 60; m++) {
      // Use granular monthly data from Sales Growth module if available, otherwise fallback to global inputs + growth settings
      const monthOverride = salesGrowthData.find((sd: any) => sd.month === m);
      const kgVolume = monthOverride ? monthOverride.kg : (baseKgStart * Math.pow(1 + ((settings.monthlyGrowth || 5) / 100), m - 1));
      
      const grossRevenue = kgVolume * (settings.basePrice || 2.5);
      const netRevenue = grossRevenue / (1 + vatRate);
      const vatOnRev = grossRevenue - netRevenue;

      const cogsLines: Record<string, number> = {};
      const expensesLines: Record<string, number> = {};
      let monthlyVatInput = 0;
      let matCostsGross = 0;
      let totalOpexGross = 0;

      opexRows.forEach((row: any) => {
        const vol = row.type === 'Variable' ? kgVolume : 1; 
        const gCost = vol * (row.quantity || 0) * (row.unitCost || 0);
        totalOpexGross += gCost;
        
        let plVal = gCost;
        if (row.taxType === 'Income Tax') {
           plVal = (gCost / 0.784) * 1.02;
        } else if (row.taxType === 'VAT') {
           plVal = gCost / (1 + vatRate);
           monthlyVatInput += (gCost - plVal);
        }

        const cat = row.plCategory || 'სხვა ხარჯი';
        if (cat.startsWith('COGS')) {
          cogsLines[cat] = (cogsLines[cat] || 0) + plVal;
          if (cat.includes('ნედლეული')) matCostsGross += gCost;
        } else {
          expensesLines[cat] = (expensesLines[cat] || 0) + plVal;
        }
      });

      const cogsTotal = Object.values(cogsLines).reduce((a, b) => a + b, 0);
      const grossProfit = netRevenue - cogsTotal;
      const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

      const expensesTotal = Object.values(expensesLines).reduce((a, b) => a + b, 0);
      const monthlyDepr = capexItems.reduce((s: number, i: any) => s + (i.monthlyDepreciation || 0), 0);
      
      const operatingResult = grossProfit - expensesTotal; // EBIT
      const ebitda = operatingResult + monthlyDepr;
      const opMargin = netRevenue > 0 ? (operatingResult / netRevenue) * 100 : 0;
      const netProfit = operatingResult; 

      if (netProfit > 0 && firstProfitMonth === null) firstProfitMonth = m;

      let repayment = 0;
      if (firstProfitMonth !== null && m >= firstProfitMonth + 3 && remainingPaybackBalance > 0) {
        const potential = Math.max(0, netProfit * 0.5);
        repayment = Math.min(remainingPaybackBalance, potential, currentCash - (minCash * 0.8));
        repayment = Math.max(0, repayment);
      }

      const curAR = grossRevenue / 30 * (settings.daysReceivable || 30);
      const curAP = totalOpexGross / 30 * (settings.daysPayable || 15);
      const curInv = matCostsGross / 30 * inventoryDays;

      // VAT Logic Update: Net Monthly Generation
      const netMonthlyVat = vatOnRev - monthlyVatInput;
      accumulatedVatBalance += netMonthlyVat;
      
      // Separate Asset vs Liability based on cumulative balance
      const vatAsset = accumulatedVatBalance < 0 ? -accumulatedVatBalance : 0;
      const vatLiability = accumulatedVatBalance > 0 ? accumulatedVatBalance : 0;

      // Cash Flow Calculation (Using Net VAT Balance Delta)
      // If Balance increases (more liability), cash increases (held cash).
      // If Balance decreases (less liability or more asset), cash decreases (paid tax).
      const cfOp = netProfit + monthlyDepr - (curAR - prevAR) - (curInv - prevInv) + (curAP - prevAP) + (accumulatedVatBalance - prevVatBalance);
      const cfFin = -repayment;
      
      currentCash += (cfOp + cfFin);
      currentPPENet = Math.max(0, currentPPENet - monthlyDepr);
      currentRetainedEarnings += netProfit;
      currentEquityContributed -= repayment;
      remainingPaybackBalance -= repayment;

      const totalAssets = currentCash + curAR + curInv + currentPPENet + vatAsset;
      const totalLiab = curAP + vatLiability;
      const totalEquity = currentEquityContributed + currentRetainedEarnings;

      projection.push({
        month: m,
        kgVolume,
        revenue: netRevenue,
        vatOnRevenue: vatOnRev,
        cogsTotal,
        cogsLines,
        grossProfit,
        grossMargin,
        expensesTotal,
        expensesLines,
        operatingResult,
        operatingMargin: opMargin,
        ebitda,
        depreciation: monthlyDepr,
        netProfit,
        cfOperating: cfOp,
        cfInvesting: 0,
        cfFinancing: cfFin,
        cfNet: cfOp + cfFin,
        cashBalance: currentCash,
        cash: currentCash,
        ar: curAR,
        inventory: curInv,
        ppeNet: currentPPENet,
        vatReceivable: vatAsset,
        assets: totalAssets,
        ap: curAP,
        vatLiability: vatLiability,
        liabilitiesTotal: totalLiab,
        equityContributed: currentEquityContributed,
        retainedEarnings: currentRetainedEarnings,
        equityTotal: totalEquity,
        liabilitiesEquity: totalLiab + totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiab + totalEquity)) < 1, // Tight tolerance
        repaymentAmount: repayment,
        investmentBalance: remainingPaybackBalance
      });

      prevAR = curAR; prevAP = curAP; prevInv = curInv; prevVatBalance = accumulatedVatBalance;
    }
    return projection;
  }, [scenario]);
};
