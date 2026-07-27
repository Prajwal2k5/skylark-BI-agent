const express = require('express');
const router = express.Router();
const { fetchMondayData } = require('../services/mondayService');
const { loadLocalDeals, loadLocalWorkOrders } = require('../services/localDataLoader');
const { cleanAndNormalizeData } = require('../services/dataCleaningService');
const { generateBiInsights, generateLeadershipUpdate } = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * Helper function to retrieve cleaned data from Monday.com or local fallback
 */
async function getProcessedData(mondayApiKey, customDealsBoardId, customWOBoardId) {
  const apiKey = mondayApiKey || process.env.MONDAY_API_KEY;
  let rawDeals = [];
  let rawWorkOrders = [];
  let isMondayLive = false;
  let dataSourceName = 'Local Excel Dataset (Fallback Mode)';

  if (apiKey) {
    try {
      const mondayResult = await fetchMondayData(apiKey, customDealsBoardId, customWOBoardId);
      if (mondayResult.success && (mondayResult.deals.length > 0 || mondayResult.workOrders.length > 0)) {
        rawDeals = mondayResult.deals;
        rawWorkOrders = mondayResult.workOrders;
        isMondayLive = true;
        dataSourceName = 'Monday.com GraphQL API v2 (Live)';
        logger.info(`Successfully fetched ${rawDeals.length} deals and ${rawWorkOrders.length} work orders from Monday.com API.`);
      } else {
        logger.warn(`Monday.com fetch unsuccessful or returned empty items (${mondayResult.reason}). Falling back to local dataset.`);
      }
    } catch (e) {
      logger.error('Error fetching Monday.com data:', e.message);
    }
  }

  // Fallback to local dataset if Monday data not fetched
  if (!isMondayLive) {
    rawDeals = loadLocalDeals();
    rawWorkOrders = loadLocalWorkOrders();
  }

  const cleanedData = cleanAndNormalizeData(rawDeals, rawWorkOrders);
  return {
    ...cleanedData,
    isMondayLive,
    dataSourceName
  };
}

/**
 * GET /api/status - System Connection & Health Check
 */
router.get('/status', async (req, res) => {
  try {
    const mondayApiKey = req.query.mondayApiKey || process.env.MONDAY_API_KEY;
    const geminiApiKey = req.query.geminiApiKey || process.env.GEMINI_API_KEY;

    const data = await getProcessedData(mondayApiKey);

    res.json({
      status: 'online',
      mondayConnected: data.isMondayLive,
      geminiConnected: Boolean(geminiApiKey),
      dataSource: data.dataSourceName,
      dealsCount: data.deals.length,
      workOrdersCount: data.workOrders.length,
      dataHygieneScore: data.dataQuality.dataHygieneScore,
      kpis: data.metrics
    });
  } catch (error) {
    logger.error('GET /api/status error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/data - Raw & Cleaned Board Datasets & Aggregates
 */
router.get('/data', async (req, res) => {
  try {
    const mondayApiKey = req.query.mondayApiKey || process.env.MONDAY_API_KEY;
    const dealsBoardId = req.query.dealsBoardId;
    const woBoardId = req.query.woBoardId;

    const processed = await getProcessedData(mondayApiKey, dealsBoardId, woBoardId);
    res.json(processed);
  } catch (error) {
    logger.error('GET /api/data error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat - Query Business Intelligence AI Agent
 */
router.post('/chat', async (req, res) => {
  try {
    const { query, geminiApiKey, mondayApiKey, dealsBoardId, woBoardId } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query text is required' });
    }

    const processed = await getProcessedData(mondayApiKey, dealsBoardId, woBoardId);
    const aiResponse = await generateBiInsights(query.trim(), processed, geminiApiKey);

    res.json({
      success: true,
      query: query.trim(),
      dataSource: processed.dataSourceName,
      isMondayLive: processed.isMondayLive,
      dataQuality: processed.dataQuality,
      response: aiResponse
    });
  } catch (error) {
    logger.error('POST /api/chat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/leadership-update - Generate Executive Board Update Briefing
 */
router.post('/leadership-update', async (req, res) => {
  try {
    const { geminiApiKey, mondayApiKey, dealsBoardId, woBoardId } = req.body;
    const processed = await getProcessedData(mondayApiKey, dealsBoardId, woBoardId);
    const updateReport = await generateLeadershipUpdate(processed, geminiApiKey);

    res.json({
      success: true,
      dataSource: processed.dataSourceName,
      isMondayLive: processed.isMondayLive,
      report: updateReport,
      metrics: processed.metrics,
      breakdowns: processed.breakdowns
    });
  } catch (error) {
    logger.error('POST /api/leadership-update error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
