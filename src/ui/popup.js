const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

chrome.storage.sync.get(["enabled"], (res) => {
  toggle.checked = res.enabled !== false;
  updateStatus(toggle.checked);
});

toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
  updateStatus(toggle.checked);
});

function updateStatus(enabled) {
  status.textContent = enabled
    ? "Cleaning enabled"
    : "Cleaning disabled";
}
