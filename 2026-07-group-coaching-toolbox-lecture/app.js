const PROJECT_STORAGE_KEY = "tmw_group_coaching_toolbox_2026_applications";
const accountText = "하나은행 391-910088-27305 송성원";

const copyButton = document.querySelector("#copyAccount");
const accountNode = document.querySelector("#accountText");
const form = document.querySelector(".application-form");
const formStatus = document.querySelector("#formStatus");

if (accountNode) {
  accountNode.textContent = accountText;
}

copyButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(accountText);
    copyButton.textContent = "복사 완료";
    setTimeout(() => {
      copyButton.textContent = "계좌 복사";
    }, 1800);
  } catch {
    formStatus.textContent = "계좌번호를 직접 선택해서 복사해 주세요.";
  }
});

form?.addEventListener("submit", (event) => {
  const isLocalPreview =
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

  if (!isLocalPreview) {
    return;
  }

  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.createdAt = new Date().toISOString();

  const previous = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]");
  previous.push(payload);
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(previous));

  form.reset();
  formStatus.textContent =
    "로컬 미리보기라 신청 내용이 이 브라우저에 임시 저장되었습니다. 배포 후에는 폼 제출로 접수됩니다.";
});

if (new URLSearchParams(location.search).get("success") === "1" && formStatus) {
  formStatus.textContent = "신청서가 제출되었습니다. 입금 확인 후 배송과 Zoom 안내를 드립니다.";
}
