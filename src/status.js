let status = document.querySelector("#status");
chrome.runtime.onMessage.addListener(function(request) {
  let statusText = request.statusText;
  status.style.display = statusText != "" ? "" : "none";
  status.textContent = statusText;
});
