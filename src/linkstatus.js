if (self == top) {
  let iframe = document.createElement("iframe");
  iframe.frameBorder = 0;
  iframe.scrolling = 0;
  iframe.style.setProperty("background", "transparent", "important");
  iframe.style.fontSize = "initial";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.position = "fixed";
  iframe.style.pointerEvents = "none";
  iframe.style.left = 0;
  iframe.style.bottom = 0;
  iframe.style.margin = 0;
  iframe.style.padding = 0;
  iframe.style.zIndex = 2147483647;
  document.documentElement.appendChild(iframe);
  iframe.contentWindow.location = chrome.extension.getURL("status.html");
}
let url = "";
document.addEventListener("mouseover", function(e) {
  let a;
  for (a = e.target; a != null; a = a.parentElement) {
    if (a.tagName == "A") {
      break;
    }
  }
  if (a == null) {
    if (url == "") {
      return;
    }
    url = "";
  } else {
    if (a.href == url) {
      return;
    }
    url = a.href;
  }
  chrome.runtime.sendMessage({url: url});
}, true);
chrome.runtime.onMessage.addListener(function(request) {
  url = request.url;
});
