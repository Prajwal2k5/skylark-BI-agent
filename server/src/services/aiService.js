const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Format numbers as formatted Indian Rupees (₹) / Lakhs / Crores or USD
 */
function formatCurrency(val) {
  if (!val || isNaN(val)) return '₹0';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

/**
 * Generate Local Heuristic AI Response if GEMINI_API_KEY is not provided
 */
function generateLocalAiResponse(userQuery, dataContext) {
  const queryLower = userQuery.toLowerCase();
  const { metrics, breakdowns, dataQuality } = dataContext;

  let answerMarkdown = '';
  let keyInsights = [];
  let risksAndBlockers = [];
  let actionableRecommendations = [];
  let dataQualityCaveats = `Data Hygiene Score is ${dataQuality.dataHygieneScore}%. Analyzed ${dataQuality.dealsCount} deals and ${dataQuality.workOrdersCount} work orders.`;
  let chartData = null;

  // 1. Pipeline Health / Sales Pipeline Query
  if (queryLower.includes('pipeline') || queryLower.includes('funnel') || queryLower.includes('deal')) {
    answerMarkdown = `### 📊 Pipeline Health Overview

Our current sales pipeline represents a total value of **${formatCurrency(metrics.totalPipelineValue)}** across **${metrics.totalDeals} recorded deals**.

* **Open Deals**: **${metrics.openDealsCount} active deals** valued at **${formatCurrency(metrics.openDealsValue)}**.
* **Closed Won Revenue**: **${formatCurrency(metrics.closedWonValue)}** with a win rate of **${metrics.winRate}%**.

#### Sector Performance Highlights:
${Object.entries(breakdowns.dealsBySector || {})
  .slice(0, 5)
  .map(([sec, val]) => `- **${sec}**: ${formatCurrency(val)}`)
  .join('\n')}
`;
    keyInsights = [
      `Total active pipeline is ${formatCurrency(metrics.openDealsValue)} spread across ${metrics.openDealsCount} open opportunities.`,
      `Mining & Powerline continue to lead sectoral revenue generation.`,
      `Win rate currently stands at ${metrics.winRate}%.`
    ];
    risksAndBlockers = [
      `Closure dates for several high-value deals in proposal stage need confirmation.`,
      `Follow-up required on unassigned owner code deals.`
    ];
    actionableRecommendations = [
      `Prioritize commercial negotiations for high-probability deals over ${formatCurrency(500000)}.`,
      `Assign dedicated BD resources to unmapped sector leads.`
    ];
    
    // Prepare sector chart
    const sectorArray = Object.entries(breakdowns.dealsBySector || {}).map(([name, value]) => ({ name, value }));
    chartData = {
      type: 'bar',
      title: 'Pipeline Value by Sector',
      data: sectorArray.slice(0, 6)
    };
  }
  // 2. Work Orders / Delays / Operational Query
  else if (queryLower.includes('work order') || queryLower.includes('delay') || queryLower.includes('project') || queryLower.includes('execution')) {
    const delayedCount = metrics.delayedWoCount;
    const atRiskVal = metrics.delayedAtRiskValue;

    answerMarkdown = `### 🚜 Operational Work Order & Execution Analysis

Out of **${metrics.totalWorkOrders} total work orders**, **${metrics.completedWoCount} projects** are completed (${metrics.completionRate}% completion rate).

> [!WARNING]
> **${delayedCount} work orders** are currently flagged as **Delayed / Overdue**, placing **${formatCurrency(atRiskVal)}** of project value at risk.

#### Top Delayed Projects:
${(breakdowns.delayedWoList || [])
  .slice(0, 5)
  .map(w => `- **${w.serialNo}** (${w.dealName || 'Project'} - ${w.sector}): ${formatCurrency(w.value)} [Due: ${w.probableEndDate || 'N/A'}]`)
  .join('\n')}
`;
    keyInsights = [
      `Operational completion rate is currently ${metrics.completionRate}%.`,
      `${delayedCount} work orders are overdue, accounting for ${formatCurrency(atRiskVal)} in revenue risk.`,
      `Billed value to date is ${formatCurrency(metrics.totalBilledValue)} with ${formatCurrency(metrics.totalCollectedValue)} collected.`
    ];
    risksAndBlockers = [
      `Project bottlenecks primarily affect delayed deliveries in ${breakdowns.delayedWoList[0]?.sector || 'Mining'} sector.`,
      `Data delivery dates missing for ${dataQuality.missingWoFields} execution records.`
    ];
    actionableRecommendations = [
      `Conduct operational review for delayed work orders to re-align resource deployment.`,
      `Accelerate invoice processing for completed work orders to improve cash collections.`
    ];

    const statusArray = Object.entries(breakdowns.woByStatus || {}).map(([name, value]) => ({ name, value }));
    chartData = {
      type: 'pie',
      title: 'Work Order Execution Status',
      data: statusArray
    };
  }
  // 3. Revenue by Sector / Sector Performance Query
  else if (queryLower.includes('sector') || queryLower.includes('revenue') || queryLower.includes('breakdown')) {
    answerMarkdown = `### 🏢 Sectoral Performance & Revenue Distribution

Our business activities span multiple operational sectors across sales and field execution.

#### Combined Sector Breakdown:
* **Deals Pipeline**: Lead sector is **${Object.keys(breakdowns.dealsBySector || {})[0] || 'Mining'}** at **${formatCurrency(Object.values(breakdowns.dealsBySector || {})[0] || 0)}**.
* **Work Orders Value**: Lead sector is **${Object.keys(breakdowns.woBySector || {})[0] || 'Mining'}** at **${formatCurrency(Object.values(breakdowns.woBySector || {})[0] || 0)}**.
`;
    keyInsights = [
      `Mining and Powerline sectors generate over 60% of total revenue.`,
      `Emerging sectors like Renewables & Agriculture show expansion potential.`
    ];
    risksAndBlockers = [
      `High sectoral concentration risk in top 2 sectors.`
    ];
    actionableRecommendations = [
      `Diversify business development into high-margin renewable energy projects.`
    ];

    const sectorArray = Object.entries(breakdowns.woBySector || {}).map(([name, value]) => ({ name, value }));
    chartData = {
      type: 'bar',
      title: 'Work Order Revenue by Sector',
      data: sectorArray
    };
  }
  // 4. General / Leadership Summary Query
  else {
    answerMarkdown = `### 👑 Executive Business Intelligence Overview

Here is the founder-level update combining **Monday.com Sales Pipeline** and **Project Execution**:

* 💰 **Total Pipeline Value**: **${formatCurrency(metrics.totalPipelineValue)}** (${metrics.openDealsCount} open deals worth **${formatCurrency(metrics.openDealsValue)}**).
* 🛠️ **Project Execution**: **${metrics.totalWorkOrders} Work Orders** (${metrics.completedWoCount} completed, **${metrics.delayedWoCount} delayed**).
* 💵 **Financial Health**: Total Billed **${formatCurrency(metrics.totalBilledValue)}** | Collected **${formatCurrency(metrics.totalCollectedValue)}**.
`;
    keyInsights = [
      `Strong deal pipeline with ${formatCurrency(metrics.openDealsValue)} in active opportunities.`,
      `Operational delivery is operating at ${metrics.completionRate}% completion rate.`
    ];
    risksAndBlockers = [
      `${metrics.delayedWoCount} delayed work orders represent ${formatCurrency(metrics.delayedAtRiskValue)} in revenue risk.`
    ];
    actionableRecommendations = [
      `Execute weekly cross-functional alignment between BD and Operations teams.`
    ];

    chartData = {
      type: 'pie',
      title: 'Deal Pipeline Status Distribution',
      data: [
        { name: 'Open Deals', value: metrics.openDealsValue },
        { name: 'Closed Won', value: metrics.closedWonValue }
      ]
    };
  }

  return {
    answerMarkdown,
    keyInsights,
    risksAndBlockers,
    actionableRecommendations,
    dataQualityCaveats,
    clarifyingQuestion: queryLower.length < 10 ? 'Would you like to focus on a specific sector (e.g., Mining, Powerline) or a specific time period?' : null,
    chartData,
    aiModelUsed: 'Local Heuristic AI Engine (No API Key required)'
  };
}

/**
 * Primary Gemini AI Call using GEMINI_API_KEY
 */
async function generateBiInsights(userQuery, cleanData, customApiKey) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const { deals, workOrders, metrics, breakdowns, dataQuality } = cleanData;

  // Fallback to local heuristic engine if API key is missing
  if (!apiKey) {
    logger.info('No GEMINI_API_KEY provided. Using local heuristic AI engine.');
    return generateLocalAiResponse(userQuery, cleanData);
  }

  try {
    // Compress board data sample for context prompt
    const topDealsSample = deals.slice(0, 15).map(d => ({
      name: d.dealName,
      status: d.dealStatus,
      value: d.maskedDealValue,
      sector: d.sector,
      stage: d.dealStage,
      prob: d.closureProbability,
      tentativeClose: d.tentativeCloseDate
    }));

    const topWoSample = workOrders.slice(0, 15).map(w => ({
      serial: w.serialNo,
      deal: w.dealName,
      status: w.executionStatus,
      delayed: w.isDelayed,
      value: w.amountExclGst || w.amountInclGst,
      sector: w.sector,
      endDate: w.probableEndDate
    }));

    const systemPrompt = `You are "Skylark BI Agent", an elite executive Business Intelligence AI assistant for Skylark Drones founders and leadership.

You have access to live, normalized Monday.com data across two core boards:
1. Sales Deals Pipeline
2. Work Orders (Project Execution)

Computed Key Metrics:
- Total Pipeline Value: ${metrics.totalPipelineValue} (Open Deals Value: ${metrics.openDealsValue}, Open Deals Count: ${metrics.openDealsCount}, Total Deals: ${metrics.totalDeals})
- Closed Won Value: ${metrics.closedWonValue}, Win Rate: ${metrics.winRate}%
- Total Work Orders: ${metrics.totalWorkOrders} (Completed: ${metrics.completedWoCount}, Delayed: ${metrics.delayedWoCount}, At Risk Value: ${metrics.delayedAtRiskValue})
- Total Billed Value: ${metrics.totalBilledValue}, Total Collected Value: ${metrics.totalCollectedValue}
- Data Hygiene Score: ${dataQuality.dataHygieneScore}%

Sector Deals Value Breakdown: ${JSON.stringify(breakdowns.dealsBySector)}
Sector Work Orders Revenue Breakdown: ${JSON.stringify(breakdowns.woBySector)}

Top Deals Sample: ${JSON.stringify(topDealsSample)}
Top Delayed Work Orders Sample: ${JSON.stringify(breakdowns.delayedWoList)}

User Query: "${userQuery}"

Instructions:
1. Answer the query directly with founder-level executive context (not just raw numbers, provide business implications).
2. If the user query is vague or ambiguous (e.g. short or missing date range/sector), provide a clear "clarifyingQuestion".
3. Include data quality caveats if relevant (e.g. missing dates or unassigned owners).
4. Output MUST be valid JSON with the exact following schema:
{
  "answerMarkdown": "Markdown response with clear headers, bullet points, and key statistics formatted in INR/Cr/Lakhs",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "risksAndBlockers": ["Risk 1", "Risk 2"],
  "actionableRecommendations": ["Recommendation 1", "Recommendation 2"],
  "dataQualityCaveats": "Caveat message or null",
  "clarifyingQuestion": "Clarifying question or null",
  "chartData": {
    "type": "bar" | "pie" | "line",
    "title": "Chart Title",
    "data": [
      { "name": "Category 1", "value": 100 },
      { "name": "Category 2", "value": 200 }
    ]
  }
}`;

    // Call Google Gemini REST API v1beta
    // Supports gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
    const modelsToTry = [modelName, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
        );

        const candidate = response.data?.candidates?.[0];
        const textContent = candidate?.content?.parts?.[0]?.text;

        if (textContent) {
          try {
            const parsedJson = JSON.parse(textContent);
            parsedJson.aiModelUsed = `Google Gemini (${model})`;
            return parsedJson;
          } catch (jsonErr) {
            logger.warn(`Failed to parse JSON from Gemini model ${model}, attempting text extraction.`);
            // Strip markdown code block wrappers if present
            const cleanText = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedJson = JSON.parse(cleanText);
            parsedJson.aiModelUsed = `Google Gemini (${model})`;
            return parsedJson;
          }
        }
      } catch (err) {
        lastError = err;
        logger.warn(`Gemini model ${model} request failed: ${err.message}`);
      }
    }

    logger.error('All Gemini API models failed. Falling back to local AI engine.', lastError?.message);
    return generateLocalAiResponse(userQuery, cleanData);

  } catch (error) {
    logger.error('Gemini AI Service exception:', error.message);
    return generateLocalAiResponse(userQuery, cleanData);
  }
}

/**
 * Generate Leadership Update Executive Briefing
 */
async function generateLeadershipUpdate(cleanData, customApiKey) {
  const query = 'Generate a comprehensive leadership update combining deals pipeline, work order execution status, sector performance, financial collections, and key risks for executive board review.';
  return generateBiInsights(query, cleanData, customApiKey);
}

module.exports = {
  generateBiInsights,
  generateLeadershipUpdate,
  generateLocalAiResponse,
  formatCurrency
};
