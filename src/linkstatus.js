if (self == top) {
  let iframe = document.createElement("iframe");
  iframe.frameBorder = 0;
  iframe.scrolling = 0;
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
  document.body.appendChild(iframe);
  iframe.contentWindow.location = chrome.extension.getURL("status.html");
}
let anchor = null;
document.addEventListener("mouseover", function(e) {
  let a;
  for (a = e.target; a != null; a = a.parentElement) {
    if (a.tagName == "A") {
      break;
    }
  }
  if (a == anchor) {
    return;
  }
  anchor = a;
  if (a == null) {
    chrome.runtime.sendMessage({});
    return;
  }
  a.addEventListener("mouseout", function onmouseout(e) {
    a.removeEventListener("mouseout", onmouseout);
  });
  chrome.runtime.sendMessage({url: a.href});
}, true);
