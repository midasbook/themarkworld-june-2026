# Google Sheets 신청 접수 연결

신청 접수용 Google Sheet:

https://docs.google.com/spreadsheets/d/1GfCOgmYPN7DLaDMyCG4rv_X_yvrNzYysNSLelLU1oPQ/edit

아래 순서로 Apps Script 웹앱 URL을 만든 뒤 `config.js`에 넣으면 랜딩페이지 신청 데이터가 이 Google Sheet의 `신청접수` 탭에 쌓입니다.

1. 위 Google Sheet를 엽니다.
2. 메뉴에서 `확장 프로그램 > Apps Script`를 엽니다.
3. `google-apps-script/Code.gs` 파일 내용을 Apps Script 편집기에 붙여 넣고 저장합니다.
4. `배포 > 새 배포`를 누릅니다.
5. 유형은 `웹 앱`으로 선택합니다.
6. 실행 권한은 `나`, 액세스 권한은 `모든 사용자`로 설정합니다.
7. 배포 후 발급되는 웹앱 URL을 복사합니다.
8. `config.js`의 `googleAppsScriptUrl` 값에 붙여 넣습니다.

```js
window.ToolboxLectureConfig = {
  googleAppsScriptUrl: "https://script.google.com/macros/s/....../exec",
  spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1GfCOgmYPN7DLaDMyCG4rv_X_yvrNzYysNSLelLU1oPQ/edit",
};
```

`config.js` 수정 후 다시 배포하면 신청폼 제출이 Google Sheet에 저장됩니다.
