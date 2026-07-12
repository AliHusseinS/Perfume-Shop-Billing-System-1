const SPREADSHEET_ID = "1fHCg3gEW8zqVBmIPUFC1NKA85LW04kIWYPRHnIBwUT8";

function doGet(e) {
  // If request contains API parameters, serve JSON API response
  if (e && e.parameter && e.parameter.action) {
    const action = e.parameter.action;
    let result = {};
    if (action === "getCatalog") {
      result = getCatalogFromSheet();
    } else if (action === "getHistory") {
      result = getInvoicesFromSheet();
    } else if (action === "getAll") {
      result = {
        catalog: getCatalogFromSheet(),
        history: getInvoicesFromSheet()
      };
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Otherwise, serve the HTML page
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('نظام المبيعات')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    let result = { success: false };
    
    if (action === "saveCatalog") {
      saveCatalogToSheet(postData.data);
      result.success = true;
    } else if (action === "addInvoice") {
      addInvoiceToSheet(postData.data);
      result.success = true;
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
