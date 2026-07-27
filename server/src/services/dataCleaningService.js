const logger = require('../utils/logger');

/**
 * Parse numeric values safely from strings, stripping currency symbols, commas, spaces.
 */
function parseNumber(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleanStr = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalize date strings to standard YYYY-MM-DD format
 */
function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (!str || str === '-' || str.toLowerCase() === 'n/a' || str.toLowerCase() === 'null') return '';

  // Try parsing ISO or standard date
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toISOString().split('T')[0];
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      // DD/MM/YYYY
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }

  return str; // Return raw string if unparseable
}

/**
 * Normalize Sector/Industry names to unified categories
 */
function normalizeSector(val) {
  if (!val) return 'Unspecified';
  const str = String(val).trim().toLowerCase();
  
  if (str.includes('min')) return 'Mining';
  if (str.includes('power') || str.includes('grid')) return 'Powerline';
  if (str.includes('solar') || str.includes('renew')) return 'Renewables / Solar';
  if (str.includes('infra') || str.includes('road') || str.includes('civil')) return 'Infrastructure';
  if (str.includes('agri') || str.includes('farm')) return 'Agriculture';
  if (str.includes('oil') || str.includes('gas') || str.includes('hydro')) return 'Energy & Resources';
  if (str.includes('telecom') || str.includes('tower')) return 'Telecom';
  if (str.includes('defence') || str.includes('gov')) return 'Government & Defence';
  
  return String(val).trim();
}

/**
 * Normalize Deal Status
 */
function normalizeDealStatus(statusVal, stageVal) {
  const statusStr = String(statusVal || '').trim().toLowerCase();
  const stageStr = String(stageVal || '').trim().toLowerCase();

  if (statusStr.includes('won') || stageStr.includes('won') || stageStr.includes('closed won')) return 'Closed Won';
  if (statusStr.includes('lost') || stageStr.includes('lost') || stageStr.includes('closed lost')) return 'Closed Lost';
  if (statusStr.includes('open') || stageStr.includes('lead') || stageStr.includes('proposal') || stageStr.includes('qualified') || stageStr.includes('negotiation')) return 'Open';
  
  return statusVal ? String(statusVal).trim() : 'Open';
}

/**
 * Clean & Normalize Deals Data
 */
function cleanDealsData(rawDeals) {
  if (!Array.isArray(rawDeals)) return { cleanedDeals: [], missingFieldsCount: 0 };

  let missingFieldsCount = 0;
  const cleanedDeals = rawDeals.map((item, idx) => {
    const dealName = item['Deal Name'] || item['Item Name'] || item['name'] || `Deal-${idx + 1}`;
    const ownerCode = item['Owner code'] || item['BD/KAM Personnel code'] || item['Owner'] || 'Unassigned';
    const clientCode = item['Client Code'] || item['Customer Name Code'] || 'Unknown Client';
    const dealStage = item['Deal Stage'] || item['Stage'] || 'Unspecified Stage';
    const dealStatus = normalizeDealStatus(item['Deal Status'], dealStage);
    const closureProbability = item['Closure Probability'] || item['Probability'] || 'Medium';
    
    const maskedDealValue = parseNumber(
      item['Masked Deal value'] || item['Deal Value'] || item['Amount'] || item['Value']
    );

    const closeDateActual = formatDate(item['Close Date (A)'] || item['Close Date']);
    const tentativeCloseDate = formatDate(item['Tentative Close Date'] || item['Expected Close Date']);
    const createdDate = formatDate(item['Created Date'] || item['created_at']);
    const productDeal = item['Product deal'] || item['Product/Service'] || 'General Services';
    const sector = normalizeSector(item['Sector/service'] || item['Sector'] || item['Industry']);

    // Track missing fields quality metrics
    if (!item['Tentative Close Date'] && !item['Close Date (A)']) missingFieldsCount++;
    if (!item['Masked Deal value']) missingFieldsCount++;
    if (!item['Closure Probability']) missingFieldsCount++;

    return {
      id: item.id || `deal-${idx + 1}`,
      dealName,
      ownerCode,
      clientCode,
      dealStatus,
      closureProbability,
      maskedDealValue,
      closeDateActual,
      tentativeCloseDate,
      dealStage,
      productDeal,
      sector,
      createdDate
    };
  });

  return { cleanedDeals, missingFieldsCount };
}

/**
 * Clean & Normalize Work Orders Data
 */
function cleanWorkOrdersData(rawWO) {
  if (!Array.isArray(rawWO)) return { cleanedWorkOrders: [], missingFieldsCount: 0 };

  let missingFieldsCount = 0;
  const cleanedWorkOrders = rawWO.map((item, idx) => {
    const dealName = item['Deal name masked'] || item['Deal Name'] || item['Item Name'] || `WO-Deal-${idx + 1}`;
    const customerCode = item['Customer Name Code'] || item['Client Code'] || 'Unknown Customer';
    const serialNo = item['Serial #'] || item['WO Serial'] || `WO-${idx + 1}`;
    const natureOfWork = item['Nature of Work'] || 'Standard Execution';
    const executionStatusRaw = item['Execution Status'] || item['Status'] || 'In Progress';
    
    const probableStartDate = formatDate(item['Probable Start Date'] || item['Start Date']);
    const probableEndDate = formatDate(item['Probable End Date'] || item['End Date']);
    const dataDeliveryDate = formatDate(item['Data Delivery Date'] || item['Delivery Date']);
    const poDate = formatDate(item['Date of PO/LOI'] || item['PO Date']);
    
    const ownerCode = item['BD/KAM Personnel code'] || item['Owner code'] || 'Unassigned';
    const sector = normalizeSector(item['Sector'] || item['Industry']);
    const typeOfWork = item['Type of Work'] || natureOfWork;
    const softwarePlatform = item['Is any Skylark software platform part of the client deliverables in this deal?'] || 'None';
    
    const amountExclGst = parseNumber(item['Amount in Rupees (Excl of GST) (Masked)'] || item['Amount Excl GST']);
    const amountInclGst = parseNumber(item['Amount in Rupees (Incl of GST) (Masked)'] || item['Amount Incl GST']);
    const billedValueExclGst = parseNumber(item['Billed Value in Rupees (Excl of GST.) (Masked)'] || item['Billed Value']);
    const collectedAmount = parseNumber(item['Collected Amount in Rupees (Incl of GST.) (Masked)'] || item['Collected Amount']);
    const amountToBeBilled = parseNumber(item['Amount to be billed in Rs. (Exl. of GST) (Masked)'] || item['Amount To Bill']);
    const amountReceivable = parseNumber(item['Amount Receivable (Masked)'] || item['Amount Receivable']);

    const billingStatus = item['Billing Status'] || item['WO Status (billed)'] || 'Pending';

    // Normalize execution status & check delay logic
    const statusLower = String(executionStatusRaw).toLowerCase();
    let executionStatus = 'In Progress';
    if (statusLower.includes('complete')) executionStatus = 'Completed';
    else if (statusLower.includes('not start')) executionStatus = 'Not Started';
    else if (statusLower.includes('cancel')) executionStatus = 'Cancelled';
    else if (statusLower.includes('delay')) executionStatus = 'Delayed';
    else if (statusLower.includes('executed until')) executionStatus = 'Executed Active';
    else executionStatus = String(executionStatusRaw).trim();

    // Determine if project is Delayed (if probable end date passed and not completed)
    const currentDateStr = new Date().toISOString().split('T')[0];
    const isOverdue = probableEndDate && probableEndDate < currentDateStr && executionStatus !== 'Completed';
    const isDelayed = executionStatus === 'Delayed' || isOverdue;

    // Track missing fields
    if (!probableEndDate) missingFieldsCount++;
    if (!amountExclGst && !amountInclGst) missingFieldsCount++;
    if (!executionStatusRaw) missingFieldsCount++;

    return {
      id: item.id || `wo-${idx + 1}`,
      dealName,
      customerCode,
      serialNo,
      natureOfWork,
      executionStatus,
      isDelayed,
      probableStartDate,
      probableEndDate,
      dataDeliveryDate,
      poDate,
      ownerCode,
      sector,
      typeOfWork,
      softwarePlatform,
      amountExclGst,
      amountInclGst,
      billedValueExclGst,
      collectedAmount,
      amountToBeBilled,
      amountReceivable,
      billingStatus
    };
  });

  return { cleanedWorkOrders, missingFieldsCount };
}

/**
 * Calculate Global BI Metrics & Aggregates across both clean datasets
 */
function computeBiMetrics(deals, workOrders) {
  // Deals metrics
  const totalDeals = deals.length;
  let totalPipelineValue = 0;
  let openDealsValue = 0;
  let openDealsCount = 0;
  let closedWonValue = 0;
  let closedWonCount = 0;
  let closedLostCount = 0;

  const dealsBySector = {};
  const dealsByStage = {};
  const dealsByOwner = {};

  deals.forEach(d => {
    totalPipelineValue += d.maskedDealValue;

    if (d.dealStatus === 'Open') {
      openDealsCount++;
      openDealsValue += d.maskedDealValue;
    } else if (d.dealStatus === 'Closed Won') {
      closedWonCount++;
      closedWonValue += d.maskedDealValue;
    } else if (d.dealStatus === 'Closed Lost') {
      closedLostCount++;
    }

    // Sector breakdown
    const sec = d.sector || 'Unspecified';
    dealsBySector[sec] = (dealsBySector[sec] || 0) + d.maskedDealValue;

    // Stage breakdown
    const stg = d.dealStage || 'Unspecified';
    dealsByStage[stg] = (dealsByStage[stg] || 0) + 1;

    // Owner breakdown
    const own = d.ownerCode || 'Unassigned';
    dealsByOwner[own] = (dealsByOwner[own] || 0) + d.maskedDealValue;
  });

  const winRate = totalDeals > 0 ? ((closedWonCount / (closedWonCount + closedLostCount || 1)) * 100).toFixed(1) : 0;

  // Work Orders metrics
  const totalWorkOrders = workOrders.length;
  let completedWoCount = 0;
  let delayedWoCount = 0;
  let inProgressWoCount = 0;
  let totalWoValue = 0;
  let totalBilledValue = 0;
  let totalCollectedValue = 0;
  let delayedAtRiskValue = 0;

  const woBySector = {};
  const woByStatus = {};
  const delayedWoList = [];

  workOrders.forEach(w => {
    const val = w.amountExclGst || w.amountInclGst || 0;
    totalWoValue += val;
    totalBilledValue += w.billedValueExclGst || 0;
    totalCollectedValue += w.collectedAmount || 0;

    if (w.executionStatus === 'Completed') {
      completedWoCount++;
    } else if (w.isDelayed) {
      delayedWoCount++;
      delayedAtRiskValue += val;
      delayedWoList.push({
        serialNo: w.serialNo,
        dealName: w.dealName,
        sector: w.sector,
        probableEndDate: w.probableEndDate,
        value: val,
        ownerCode: w.ownerCode,
        status: w.executionStatus
      });
    } else {
      inProgressWoCount++;
    }

    // Status breakdown
    const st = w.executionStatus || 'In Progress';
    woByStatus[st] = (woByStatus[st] || 0) + 1;

    // Sector breakdown
    const sec = w.sector || 'Unspecified';
    woBySector[sec] = (woBySector[sec] || 0) + val;
  });

  const completionRate = totalWorkOrders > 0 ? ((completedWoCount / totalWorkOrders) * 100).toFixed(1) : 0;

  return {
    kpis: {
      totalPipelineValue,
      openDealsValue,
      openDealsCount,
      totalDeals,
      closedWonValue,
      winRate: parseFloat(winRate),
      totalWorkOrders,
      completedWoCount,
      delayedWoCount,
      delayedAtRiskValue,
      totalWoValue,
      totalBilledValue,
      totalCollectedValue,
      completionRate: parseFloat(completionRate)
    },
    breakdowns: {
      dealsBySector,
      dealsByStage,
      dealsByOwner,
      woBySector,
      woByStatus,
      delayedWoList: delayedWoList.slice(0, 10) // Top 10 delayed projects
    }
  };
}

/**
 * Main cleaning function
 */
function cleanAndNormalizeData(rawDeals = [], rawWorkOrders = []) {
  const { cleanedDeals, missingFieldsCount: missingDeals } = cleanDealsData(rawDeals);
  const { cleanedWorkOrders, missingFieldsCount: missingWO } = cleanWorkOrdersData(rawWorkOrders);

  const metrics = computeBiMetrics(cleanedDeals, cleanedWorkOrders);

  // Calculate Data Hygiene Score (0-100%)
  const totalFieldsChecked = (cleanedDeals.length * 3) + (cleanedWorkOrders.length * 3);
  const totalMissing = missingDeals + missingWO;
  const dataHygieneScore = totalFieldsChecked > 0 
    ? Math.max(0, Math.min(100, Math.round(((totalFieldsChecked - totalMissing) / totalFieldsChecked) * 100))) 
    : 100;

  return {
    deals: cleanedDeals,
    workOrders: cleanedWorkOrders,
    metrics: metrics.kpis,
    breakdowns: metrics.breakdowns,
    dataQuality: {
      dataHygieneScore,
      missingDealsFields: missingDeals,
      missingWoFields: missingWO,
      totalRecords: cleanedDeals.length + cleanedWorkOrders.length,
      dealsCount: cleanedDeals.length,
      workOrdersCount: cleanedWorkOrders.length
    }
  };
}

module.exports = {
  cleanAndNormalizeData,
  parseNumber,
  formatDate,
  normalizeSector
};
