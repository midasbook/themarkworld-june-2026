(function () {
  const totalResponses = document.querySelector("#totalResponses");
  const totalSelections = document.querySelector("#totalSelections");
  const bestSlot = document.querySelector("#bestSlot");
  const slotResults = document.querySelector("#slotResults");
  const activityResults = document.querySelector("#activityResults");
  const responseRows = document.querySelector("#responseRows");
  const opinionList = document.querySelector("#opinionList");

  const activityOptions = [
    "상반기 성과 공유",
    "재도약 전략 토론",
    "식사와 네트워킹",
    "사업 아이디어 브레인스토밍",
  ];

  function formatDateTime(value) {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function renderBarList(container, items, labelGetter, emptyText) {
    const max = Math.max(...items.map((item) => item.count), 1);
    const visibleItems = items.filter((item) => item.count > 0);

    if (visibleItems.length === 0) {
      container.innerHTML = `<p class="empty-state">${emptyText}</p>`;
      return;
    }

    container.innerHTML = visibleItems
      .map((item, index) => {
        const percent = Math.max(5, Math.round((item.count / max) * 100));

        return `
          <div class="bar-row">
            <div class="bar-label">
              <span>${index + 1}. ${labelGetter(item.id)}</span>
              <strong>${item.count}표</strong>
            </div>
            <div class="bar-track" aria-hidden="true">
              <span style="width: ${percent}%"></span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderAdmin() {
    const responses = window.PollData.readResponses();
    const selections = responses.flatMap((response) => response.slots || []);
    const best = window.PollData.getTopSlot(responses);

    totalResponses.textContent = `${responses.length}명`;
    totalSelections.textContent = `${selections.length}개`;
    bestSlot.textContent = best ? `${best.label} (${best.count}표)` : "아직 없음";

    const slotCounts = window.PollData
      .countBy(
        selections,
        window.PollData.slots.map((slot) => slot.id),
      )
      .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

    renderBarList(slotResults, slotCounts, window.PollData.getSlotLabel, "아직 선택된 일정이 없습니다.");

    const activityCounts = window.PollData
      .countBy(
        responses.flatMap((response) => response.activities || []),
        activityOptions,
      )
      .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

    renderBarList(activityResults, activityCounts, (id) => id, "아직 선택된 활동이 없습니다.");

    responseRows.innerHTML =
      responses.length > 0
        ? responses
            .map(
              (response) => `
                <tr>
                  <td>${escapeHtml(response.name)}</td>
                  <td>${escapeHtml(response.phone || "-")}</td>
                  <td>${(response.slots || []).map(window.PollData.getSlotLabel).join("<br>")}</td>
                  <td>${(response.activities || []).map(escapeHtml).join("<br>") || "-"}</td>
                  <td>${formatDateTime(response.submittedAt)}</td>
                </tr>
              `,
            )
            .join("")
        : `<tr><td colspan="5">아직 제출된 응답이 없습니다.</td></tr>`;

    const opinions = responses.filter((response) => response.topics || response.memo);
    opinionList.innerHTML =
      opinions.length > 0
        ? opinions
            .map(
              (response) => `
                <article class="opinion">
                  <h3>${escapeHtml(response.name)}</h3>
                  ${
                    response.topics
                      ? `<p><strong>회의 주제</strong>${escapeHtml(response.topics)}</p>`
                      : ""
                  }
                  ${response.memo ? `<p><strong>기타 의견</strong>${escapeHtml(response.memo)}</p>` : ""}
                </article>
              `,
            )
            .join("")
        : `<p class="empty-state">아직 남겨진 의견이 없습니다.</p>`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function exportCsv() {
    const responses = window.PollData.readResponses();
    const headers = ["성함", "연락처", "가능 일정", "선호 활동", "회의 주제", "기타 의견", "제출 시각"];
    const rows = responses.map((response) => [
      response.name,
      response.phone || "",
      (response.slots || []).map(window.PollData.getSlotLabel).join(" / "),
      (response.activities || []).join(" / "),
      response.topics || "",
      response.memo || "",
      formatDateTime(response.submittedAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "themarkworld-shareholder-poll.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetData() {
    const confirmed = confirm("저장된 모든 응답을 삭제할까요?");

    if (!confirmed) {
      return;
    }

    window.PollData.writeResponses([]);
    renderAdmin();
  }

  document.querySelector("#refreshData").addEventListener("click", renderAdmin);
  document.querySelector("#resetData").addEventListener("click", resetData);
  document.querySelector("#exportCsv").addEventListener("click", exportCsv);
  renderAdmin();
})();
