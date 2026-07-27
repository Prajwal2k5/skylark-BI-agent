const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const logger = require('../utils/logger');

function getFilePath(filename) {
  // Check parent directory (project root) first, then current working directory
  const rootPath = path.resolve(__dirname, '../../../', filename);
  if (fs.existsSync(rootPath)) return rootPath;
  const cwdPath = path.resolve(process.cwd(), filename);
  if (fs.existsSync(cwdPath)) return cwdPath;
  const serverPath = path.resolve(__dirname, '../../', filename);
  if (fs.existsSync(serverPath)) return serverPath;
  return rootPath;
}

function loadLocalDeals() {
  try {
    const dealsPath = getFilePath('Deal funnel Data.xlsx');
    if (!fs.existsSync(dealsPath)) {
      logger.warn(`Deals Excel file not found at ${dealsPath}`);
      return [];
    }
    const workbook = XLSX.readFile(dealsPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);
    logger.info(`Loaded ${rawData.length} raw deals from local Excel dataset.`);
    return rawData;
  } catch (error) {
    logger.error('Failed to load local deals Excel file:', error.message);
    return [];
  }
}

function loadLocalWorkOrders() {
  try {
    const woPath = getFilePath('Work_Order_Tracker Data.xlsx');
    if (!fs.existsSync(woPath)) {
      logger.warn(`Work Orders Excel file not found at ${woPath}`);
      return [];
    }
    const workbook = XLSX.readFile(woPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    if (!rows || rows.length <= 1) return [];

    const headers = rows[0].map(h => (h ? String(h).trim() : ''));
    const records = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const obj = {};
      headers.forEach((h, idx) => {
        if (h) {
          obj[h] = row[idx] !== undefined && row[idx] !== null ? row[idx] : '';
        }
      });
      records.push(obj);
    }

    logger.info(`Loaded ${records.length} raw work orders from local Excel dataset.`);
    return records;
  } catch (error) {
    logger.error('Failed to load local work orders Excel file:', error.message);
    return [];
  }
}

module.exports = {
  loadLocalDeals,
  loadLocalWorkOrders
};
