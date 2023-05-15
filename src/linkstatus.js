if (self == top) {
  let iframe = document.createElement("iframe");
  iframe.frameBorder = 0;
  iframe.scrolling = 0;
  iframe.style.setProperty("background", "transparent", "important");
  // Set `color-scheme` to the initial value so that the color matches with
  // the iframe content. Othewise the iframe will lose transparency
  // (See https://bugzilla.mozilla.org/show_bug.cgi?id=1738380 for details).
  // We have to use `light` explicitly because `initial` does not seem to
  // initialize the `color-scheme` correctly if the page sets multiple
  // `color-scheme` values (such as `light dark`).
  iframe.style.setProperty("color-scheme", "light", "important");
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
