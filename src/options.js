document.addEventListener("DOMContentLoaded", function() {
  chrome.storage.local.get(null, function(options) {
    for (let key of Object.keys(defaults)) {
      let value = defaults[key];
      if (options.hasOwnProperty(key)) {
        value = options[key];
      }
      let input = document.getElementById(key);
      if (input == null || input.tagName != "INPUT") {
        continue;
      }
      switch (input.type) {
      case "text":
        input.value = value;
        break;
      case "number":
        input.valueAsNumber = value;
        break;
      case "checkbox":
        input.checked = value;
        break;
      default:
        continue;
      }
      if (value != defaults[key]) {
        delete options[key];
      }
    }
    let removedKeys = Object.keys(options);
    if (removedKeys.length > 0) {
      chrome.storage.local.remove(removedKeys);
    }
  });
});
function insertAccessKeyNode(parent, ref, before, accessKey, after) {
  parent.insertBefore(document.createTextNode(before), ref);
  let u = document.createElement("u");
  u.textContent = accessKey;
  parent.insertBefore(u, ref);
  parent.insertBefore(document.createTextNode(after), ref);
}
for (let elem of document.querySelectorAll("*[id]")) {
  if (elem.tagName == "INPUT") {
    if (elem.type == "text" || elem.type == "number") {
      let textNode = elem.previousSibling;
      if (textNode != null) {
        textNode.nodeValue = chrome.i18n.getMessage(elem.id + ".label");
        let accessKey = chrome.i18n.getMessage(elem.id + ".accesskey");
        insertAccessKeyNode(elem.parentNode, elem, "(", accessKey, "): ");
      }
      continue;
    }
    if (elem.type == "checkbox") {
      let textNode = elem.nextSibling;
      if (textNode != null) {
        textNode.nodeValue = chrome.i18n.getMessage(elem.id + ".label");
        let accessKey = chrome.i18n.getMessage(elem.id + ".accesskey");
        insertAccessKeyNode(elem.parentNode, null, "(", accessKey, ")");
      }
      continue;
    }
    continue;
  }
  let text = chrome.i18n.getMessage(elem.id + ".label");
  elem.textContent = text;
}
for (let input of document.querySelectorAll("input[id]")) {
  if (input.parentNode.tagName == "LABEL") {
    input.accessKey = chrome.i18n.getMessage(input.id + ".accesskey");
  }
  input.addEventListener(
    "change",
    function(e) {
      if (!e.target.validity.valid) {
        return;
      }
      let value;
      switch (e.target.type) {
      case "text":
        value = e.target.value;
        break;
      case "number":
        value = e.target.valueAsNumber;
        break;
      case "checkbox":
        value = e.target.checked;
        break;
      default:
        return;
      }
      let key = e.target.id;
      if (value == defaults[key]) {
        chrome.storage.local.remove(key);
        return;
      }
      let option = {};
      option[key] = value;
      chrome.storage.local.set(option);
    }
  );
}
