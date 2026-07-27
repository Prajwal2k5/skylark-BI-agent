const axios = require('axios');
const logger = require('../utils/logger');

const MONDAY_API_URL = 'https://api.monday.com/v2';

function getHeaders(apiKey) {
  return {
    'Authorization': apiKey,
    'Content-Type': 'application/json',
    'API-Version': '2024-01'
  };
}

/**
 * Execute GraphQL query against Monday.com API v2
 */
async function queryMonday(query, variables = {}, apiKey) {
  if (!apiKey) {
    throw new Error('MONDAY_API_KEY is missing');
  }

  const response = await axios.post(
    MONDAY_API_URL,
    { query, variables },
    { headers: getHeaders(apiKey), timeout: 15000 }
  );

  if (response.data && response.data.errors) {
    const errMessage = response.data.errors.map(e => e.message).join(', ');
    throw new Error(`Monday API GraphQL Error: ${errMessage}`);
  }

  return response.data.data;
}

/**
 * Auto-discover board IDs for Deals and Work Orders if not provided in env
 */
async function discoverBoardIds(apiKey) {
  try {
    const query = `
      query {
        boards (limit: 50) {
          id
          name
        }
      }
    `;
    const data = await queryMonday(query, {}, apiKey);
    const boards = data.boards || [];
    
    let dealsBoardId = null;
    let workOrdersBoardId = null;

    boards.forEach(b => {
      const lower = b.name.toLowerCase();
      if (lower.includes('deal') || lower.includes('pipeline') || lower.includes('sales')) {
        dealsBoardId = b.id;
      }
      if (lower.includes('work order') || lower.includes('tracker') || lower.includes('execution')) {
        workOrdersBoardId = b.id;
      }
    });

    return { dealsBoardId, workOrdersBoardId, allBoards: boards };
  } catch (error) {
    logger.warn('Failed to auto-discover Monday.com board IDs:', error.message);
    return { dealsBoardId: null, workOrdersBoardId: null, allBoards: [] };
  }
}

/**
 * Fetch items from a specific Monday.com board ID
 */
async function fetchBoardItems(boardId, apiKey) {
  if (!boardId) return [];

  const query = `
    query ($boardId: [ID!]) {
      boards (ids: $boardId) {
        id
        name
        columns {
          id
          title
          type
        }
        items_page (limit: 500) {
          items {
            id
            name
            created_at
            column_values {
              id
              text
              value
              type
            }
          }
        }
      }
    }
  `;

  const data = await queryMonday(query, { boardId: [String(boardId)] }, apiKey);
  const board = data.boards && data.boards[0];
  if (!board) return [];

  const colMap = {};
  if (board.columns) {
    board.columns.forEach(col => {
      colMap[col.id] = col.title;
    });
  }

  const rawItems = (board.items_page && board.items_page.items) || [];
  
  // Transform items into key-value objects matching expected standard schema
  const formattedItems = rawItems.map(item => {
    const record = {
      'Item Name': item.name,
      'Created Date': item.created_at
    };

    if (item.column_values) {
      item.column_values.forEach(cv => {
        const colTitle = colMap[cv.id] || cv.id;
        let valText = cv.text;
        
        // Parse JSON value if text is empty
        if (!valText && cv.value) {
          try {
            const parsed = JSON.parse(cv.value);
            if (typeof parsed === 'object') {
              valText = parsed.text || parsed.label || JSON.stringify(parsed);
            } else {
              valText = String(parsed);
            }
          } catch (e) {
            valText = cv.value;
          }
        }
        
        record[colTitle] = valText || '';
      });
    }

    return record;
  });

  return formattedItems;
}

/**
 * Primary function to fetch both boards from Monday.com API dynamically
 */
async function fetchMondayData(apiKey, customDealsBoardId, customWOBoardId) {
  if (!apiKey) {
    return { success: false, reason: 'No MONDAY_API_KEY provided' };
  }

  try {
    let dealsBoardId = customDealsBoardId || process.env.MONDAY_DEALS_BOARD_ID;
    let woBoardId = customWOBoardId || process.env.MONDAY_WORK_ORDERS_BOARD_ID;

    if (!dealsBoardId || !woBoardId) {
      const discovered = await discoverBoardIds(apiKey);
      if (!dealsBoardId) dealsBoardId = discovered.dealsBoardId;
      if (!woBoardId) woBoardId = discovered.workOrdersBoardId;
    }

    if (!dealsBoardId && !woBoardId) {
      return { success: false, reason: 'Could not discover Deals or Work Orders boards on Monday.com account' };
    }

    const deals = dealsBoardId ? await fetchBoardItems(dealsBoardId, apiKey) : [];
    const workOrders = woBoardId ? await fetchBoardItems(woBoardId, apiKey) : [];

    return {
      success: true,
      deals,
      workOrders,
      dealsBoardId,
      woBoardId
    };
  } catch (error) {
    logger.error('Monday.com API fetch failed:', error.message);
    return { success: false, reason: error.message };
  }
}

module.exports = {
  fetchMondayData,
  discoverBoardIds,
  fetchBoardItems
};
