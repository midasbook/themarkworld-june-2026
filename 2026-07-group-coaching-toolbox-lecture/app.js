const PROJECT_STORAGE_KEY = "tmw_group_coaching_toolbox_2026_applications";
const accountText = "하나은행 391-910088-27305 송성원";
const config = window.ToolboxLectureConfig || {};

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

function getApplicationPayload() {
  const data = Object.fromEntries(new FormData(form).entries());

  return {
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    bookQuantity: data.bookQuantity || "1",
    amount: 18000,
    address: data.address || "",
    depositor: data.depositor || "",
    message: data.message || "",
    sourceUrl: location.href,
    submittedAt: new Date().toISOString(),
  };
}

function saveLocalFallback(payload) {
  const previous = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]");
  previous.push(payload);
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(previous));
}

async function submitToGoogleSheet(payload) {
  if (!config.googleAppsScriptUrl) {
    saveLocalFallback(payload);
    return {
      ok: true,
      localOnly: true,
    };
  }

  const response = await fetch(config.googleAppsScriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "create",
      application: payload,
    }),
  });

  if (!response.ok) {
    throw new Error("신청서 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error || "신청서 제출에 실패했습니다.");
  }

  return result;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector(".submit-button");
  const payload = getApplicationPayload();

  submitButton.disabled = true;
  submitButton.textContent = "제출 중...";
  formStatus.textContent = "";

  try {
    const result = await submitToGoogleSheet(payload);
    form.reset();

    if (result.localOnly) {
      formStatus.textContent =
        "현재 Google Sheets 웹앱 URL 설정 전이라 이 브라우저에 임시 저장되었습니다. 운영 전 config.js에 웹앱 URL을 넣어 주세요.";
    } else {
      formStatus.textContent = "신청서가 접수되었습니다. 입금 확인 후 배송과 Zoom 안내를 드립니다.";
    }
  } catch (error) {
    formStatus.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "신청서 제출하기";
  }
});
