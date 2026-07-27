const API_BASE = '/api';

export function getStoredConfig() {
  return {
    mondayApiKey: localStorage.getItem('skylark_monday_key') || '',
    geminiApiKey: localStorage.getItem('skylark_gemini_key') || '',
    dealsBoardId: localStorage.getItem('skylark_deals_board_id') || '',
    woBoardId: localStorage.getItem('skylark_wo_board_id') || ''
  };
}

export function saveStoredConfig(config) {
  if (config.mondayApiKey !== undefined) localStorage.setItem('skylark_monday_key', config.mondayApiKey);
  if (config.geminiApiKey !== undefined) localStorage.setItem('skylark_gemini_key', config.geminiApiKey);
  if (config.dealsBoardId !== undefined) localStorage.setItem('skylark_deals_board_id', config.dealsBoardId);
  if (config.woBoardId !== undefined) localStorage.setItem('skylark_wo_board_id', config.woBoardId);
}

export async function fetchStatus() {
  const config = getStoredConfig();
  const queryParams = new URLSearchParams();
  if (config.mondayApiKey) queryParams.append('mondayApiKey', config.mondayApiKey);
  if (config.geminiApiKey) queryParams.append('geminiApiKey', config.geminiApiKey);

  const res = await fetch(`${API_BASE}/status?${queryParams.toString()}`);
  if (!res.ok) throw new Error(`Status check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchBiData() {
  const config = getStoredConfig();
  const queryParams = new URLSearchParams();
  if (config.mondayApiKey) queryParams.append('mondayApiKey', config.mondayApiKey);
  if (config.dealsBoardId) queryParams.append('dealsBoardId', config.dealsBoardId);
  if (config.woBoardId) queryParams.append('woBoardId', config.woBoardId);

  const res = await fetch(`${API_BASE}/data?${queryParams.toString()}`);
  if (!res.ok) throw new Error(`Data fetch failed: ${res.statusText}`);
  return res.json();
}

export async function sendChatQuery(query) {
  const config = getStoredConfig();
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      geminiApiKey: config.geminiApiKey,
      mondayApiKey: config.mondayApiKey,
      dealsBoardId: config.dealsBoardId,
      woBoardId: config.woBoardId
    })
  });
  if (!res.ok) throw new Error(`Chat query failed: ${res.statusText}`);
  return res.json();
}

export async function generateLeadershipReport() {
  const config = getStoredConfig();
  const res = await fetch(`${API_BASE}/leadership-update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      geminiApiKey: config.geminiApiKey,
      mondayApiKey: config.mondayApiKey,
      dealsBoardId: config.dealsBoardId,
      woBoardId: config.woBoardId
    })
  });
  if (!res.ok) throw new Error(`Leadership update failed: ${res.statusText}`);
  return res.json();
}
