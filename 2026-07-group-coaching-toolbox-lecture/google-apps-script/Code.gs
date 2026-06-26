const SPREADSHEET_ID = "1GfCOgmYPN7DLaDMyCG4rv_X_yvrNzYysNSLelLU1oPQ";
const SHEET_NAME = "신청접수";
const HEADERS = [
  "접수일시",
  "성함",
  "휴대폰 번호",
  "이메일",
  "도서 수량",
  "입금 금액",
  "배송 주소",
  "입금자명",
  "남길 말씀",
  "접수 경로",
  "처리 상태",
];

function doGet() {
  return jsonOutput({
    ok: true,
    message: "더마크월드 그룹코칭 툴박스 저자특강 신청 접수 API",
  });
}

function doPost(event) {
  try {
    const payload = JSON.parse((event.postData && event.postData.contents) || "{}");

    if (payload.action !== "create") {
      return jsonOutput({ ok: false, error: "Unsupported action" });
    }

    const application = payload.application || {};
    appendApplication(application);

    return jsonOutput({ ok: true });
  } catch (error) {
    return jsonOutput({ ok: false, error: error.message });
  }
}

function appendApplication(application) {
  const sheet = getApplicationSheet();
  const name = String(application.name || "").trim();
  const phone = String(application.phone || "").trim();
  const address = String(application.address || "").trim();
  const depositor = String(application.depositor || "").trim();

  if (!name || !phone || !address || !depositor) {
    throw new Error("필수 신청 정보가 누락되었습니다.");
  }

  sheet.appendRow([
    application.submittedAt || new Date().toISOString(),
    name,
    phone,
    application.email || "",
    application.bookQuantity || "1",
    application.amount || 18000,
    address,
    depositor,
    application.message || "",
    application.sourceUrl || "",
    "신규",
  ]);
}

function getApplicationSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => firstRow[index] === header);

  if (!hasHeaders) {
    sheet.clear();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
