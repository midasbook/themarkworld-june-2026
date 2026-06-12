(function () {
  const passwordHash = "49d8fd23f6b6966525e469e0a3e90f3ec979c489448f0da421d8059505a5a293";
  const authKey = "theMarkWorldShareholderPollAdminAuth";
  const form = document.querySelector("#adminAuthForm");
  const passwordInput = document.querySelector("#adminPassword");
  const authMessage = document.querySelector("#authMessage");
  const logoutButton = document.querySelector("#adminLogout");

  function unlock() {
    document.body.classList.remove("auth-locked");
    document.body.classList.add("auth-unlocked");
  }

  function lock() {
    sessionStorage.removeItem(authKey);
    document.body.classList.add("auth-locked");
    document.body.classList.remove("auth-unlocked");
    passwordInput.value = "";
    passwordInput.focus();
  }

  async function hash(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!crypto.subtle) {
      authMessage.textContent = "배포된 HTTPS 주소에서 접속해 주세요.";
      return;
    }

    const inputHash = await hash(passwordInput.value);

    if (inputHash !== passwordHash) {
      authMessage.textContent = "비밀번호가 맞지 않습니다.";
      passwordInput.select();
      return;
    }

    sessionStorage.setItem(authKey, "1");
    authMessage.textContent = "";
    unlock();
  }

  if (sessionStorage.getItem(authKey) === "1") {
    unlock();
  } else {
    passwordInput.focus();
  }

  form.addEventListener("submit", handleSubmit);
  logoutButton.addEventListener("click", lock);
})();
