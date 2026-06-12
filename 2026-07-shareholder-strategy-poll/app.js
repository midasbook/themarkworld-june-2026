(function () {
  const form = document.querySelector("#voteForm");
  const slotGrid = document.querySelector("#slotGrid");
  const responseCount = document.querySelector("#responseCount");
  const topSlot = document.querySelector("#topSlot");
  const formMessage = document.querySelector("#formMessage");
  const nameInput = document.querySelector("#name");
  const phoneInput = document.querySelector("#phone");
  const topicsInput = document.querySelector("#topics");
  const memoInput = document.querySelector("#memo");

  function renderSlots() {
    slotGrid.innerHTML = window.PollData.slots
      .map(
        (slot) => `
          <label class="slot-option">
            <input type="checkbox" name="slots" value="${slot.id}" data-group="${slot.group}" />
            <span>
              <strong>${slot.date}</strong>
              <em>${slot.meal}</em>
            </span>
          </label>
        `,
      )
      .join("");
  }

  function renderSummary() {
    const responses = window.PollData.readResponses();
    const best = window.PollData.getTopSlot(responses);

    responseCount.textContent = `${responses.length}명`;
    topSlot.textContent = best ? `${best.label} (${best.count}표)` : "아직 없음";
  }

  function setGroupChecked(group, checked) {
    document
      .querySelectorAll(`input[name="slots"][data-group="${group}"]`)
      .forEach((input) => {
        input.checked = checked;
      });
  }

  function clearCheckedDates() {
    document.querySelectorAll('input[name="slots"]').forEach((input) => {
      input.checked = false;
    });
  }

  function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
      (input) => input.value,
    );
  }

  function saveVote(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const slots = getCheckedValues("slots");

    if (!name) {
      formMessage.textContent = "성함을 입력해 주세요.";
      nameInput.focus();
      return;
    }

    if (slots.length === 0) {
      formMessage.textContent = "참석 가능한 일정을 1개 이상 선택해 주세요.";
      return;
    }

    const responses = window.PollData.readResponses();
    const existingIndex = responses.findIndex((response) => response.name === name);
    const nextResponse = {
      id: existingIndex >= 0 ? responses[existingIndex].id : createId(),
      name,
      phone: phoneInput.value.trim(),
      slots,
      activities: getCheckedValues("activities"),
      topics: topicsInput.value.trim(),
      memo: memoInput.value.trim(),
      submittedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      responses[existingIndex] = nextResponse;
      formMessage.textContent = `${name}님의 응답을 최신 내용으로 갱신했습니다.`;
    } else {
      responses.push(nextResponse);
      formMessage.textContent = `${name}님의 투표가 제출되었습니다.`;
    }

    window.PollData.writeResponses(responses);
    form.reset();
    renderSummary();
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `vote-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  renderSlots();
  renderSummary();

  document.querySelector("#selectAllLunch").addEventListener("click", () => setGroupChecked("lunch", true));
  document.querySelector("#selectAllDinner").addEventListener("click", () => setGroupChecked("dinner", true));
  document.querySelector("#clearDates").addEventListener("click", clearCheckedDates);
  form.addEventListener("submit", saveVote);
})();
