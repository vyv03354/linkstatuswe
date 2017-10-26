let status = document.querySelector("#status");
chrome.runtime.onMessage.addListener(function(statusText) {
  status.style.display = statusText != "" ? "" : "none";
  status.textContent = statusText;
});
