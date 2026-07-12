const SPREADSHEET_ID = "1fHCg3gEW8zqVBmIPUFC1NKA85LW04kIWYPRHnIBwUT8";

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('نظام المبيعات')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Helper to get sheet, creating it if it doesn't exist
 */
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Get catalog products from Sheet
 */
function getCatalogFromSheet() {
  const sheet = getOrCreateSheet("Catalog");
  const data = sheet.getDataRange().getValues();
  const catalog = [];
  
  if (data.length <= 1) {
    // If empty or only header, return empty list
    return [];
  }
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== "" && row[1] !== "") {
      catalog.push({
        id: Number(row[0]),
        name: String(row[1]),
        price: Number(row[2])
      });
    }
  }
  return catalog;
}

/**
 * Save catalog products to Sheet (overwrite)
 */
function saveCatalogToSheet(catalogData) {
  const sheet = getOrCreateSheet("Catalog");
  sheet.clearContents();
  
  if (catalogData && catalogData.length > 0) {
    const values = [["ID", "Name", "Price"]];
    catalogData.forEach(prod => {
      values.push([prod.id, prod.name, prod.price]);
    });
    sheet.getRange(1, 1, values.length, 3).setValues(values);
  } else {
    sheet.getRange(1, 1, 1, 3).setValues([["ID", "Name", "Price"]]);
  }
  
  SpreadsheetApp.flush();
  return true;
}

/**
 * Get billing invoices history from Sheet
 */
function getInvoicesFromSheet() {
  const sheet = getOrCreateSheet("Invoices");
  const data = sheet.getDataRange().getValues();
  const history = [];
  
  if (data.length <= 1) {
    return [];
  }
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== "") {
      try {
        history.push({
          id: String(row[0]),
          date: String(row[1]),
          customer: String(row[2]),
          phone: String(row[3]),
          total: Number(row[4]),
          items: JSON.parse(row[5])
        });
      } catch (e) {
        console.error("Failed to parse items JSON for row " + i, e);
      }
    }
  }
  return history;
}

/**
 * Add a new invoice to the Invoices sheet
 */
function addInvoiceToSheet(invoiceData) {
  const sheet = getOrCreateSheet("Invoices");
  
  // Check if headers exist, if not create them
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Invoice ID", "Date", "Customer Name", "Customer Phone", "Total Amount", "Items JSON"]);
  }
  
  sheet.appendRow([
    invoiceData.id,
    invoiceData.date,
    invoiceData.customer,
    invoiceData.phone,
    invoiceData.total,
    JSON.stringify(invoiceData.items)
  ]);
  
  return true;
}
