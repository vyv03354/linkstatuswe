let options = {};
chrome.storage.local.get(null, function(result) {
  options = result;
  for (let key of Object.keys(defaults)) {
    if (!options.hasOwnProperty(key)) {
      options[key] = defaults[key];
    }
  }
});
chrome.storage.onChanged.addListener(function(changes, area) {
  for (let key of Object.keys(changes)) {
    if ("newValue" in changes[key]) {
      options[key] = changes[key].newValue;
    } else if ("oldValue" in changes[key]) {
      options[key] = defaults[key];
    }
  }
});

function zeropad(width, value) {
  value = String(value);
  if (width > value.length) {
    return "0".repeat(width - value.length) + value;
  }
  return value;
}

function calcDateDiff(now, visit) {
  let today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  today = Math.floor(today / (1000 * 3600 * 24));
  let visitDay = Date.UTC(visit.getUTCFullYear(), visit.getUTCMonth(), visit.getUTCDate());
  visitDay = Math.floor(visitDay / (1000 * 3600 * 24));
  return today - visitDay;
}

function formatCustomTime(visitTime) {
  let visit = new Date(visitTime);
  let now = new Date();
  let customDate = options.customDateDefault;
  for (let i = 0; i < 7; ++i) {
    let limit = options["customLimit" + i] * 1000;
    let format = options["customDate" + i];
    if (now - visitTime < limit && format != "") {
      customDate = format;
      break;
    }
  }
  return customDate.replace(
    /%(\d*)([A-Za-z%])/g,
    function(literal, width, type) {
      if (width != "") {
        if (type == "y") {
          // # years ago with N decimals
          return zeropad(width, now.getUTCFullYear() - visit.getUTCFullYear());
        }
        if (type == "M") {
          // # months ago with N decimals
          return zeropad(width, (now.getUTCFullYear() - visit.getUTCFullYear()) * 12 +
            (now.getUTCMonth() - visit.getUTCMonth()));
        }
        if (type == "d" || type == "w") {
          let dateDiff = calcDateDiff(now, visit);
          if (type == "w") {
            // # weeks ago with N decimals
            return zeropad(width, Math.floor(dateDiff / 7));
          }
          // # days ago with N decimals
          return zeropad(width, dateDiff);
        }
        if (type == "h") {
          // # hours ago with N decimals
          return zeropad(width, Math.floor((now - visit) / (1000 * 3600)));
        }
        if (type == "m") {
          // # minutes ago with N decimals
          return zeropad(width, Math.floor((now - visit) / (1000 * 60)));
        }
        if (type == "s") {
          // # seconds ago with N decimals
          return zeropad(width, Math.floor((now - visit) / 1000));
        }
        return literal;
      }
      switch (type) {
        case "c":
          // date and time in locale's preferred format
          return visit.toLocaleString();
        case "x":
          // date in locale's preferred format
          return visit.toLocaleDateString();
        case "X":
          // time in locale's preferred format
          return visit.toLocaleTimeString();
        case "Y":
          // 4-digit year
          return visit.getFullYear();
        case "y":
          // 2-digit year 00..99
          return zeropad(2, visit.getFullYear() % 100);
        case "m":
          // zero-padded month 01..12
          return zeropad(2, visit.getMonth() + 1);
        case "b":
          // month name from user-defined list
          return options.customMonthNames.split(",")[visit.getMonth()];
        case "a":
          // weekday name from user-defined list
          return options.customWeekdayNames.split(",")[visit.getDay()];
        case "d":
          // zero-padded day of month 01..31
          return zeropad(2, visit.getDate());
        case "e":
          // day of month 1..31
          return visit.getDate();
        case "H":
          // zero-padded hour 00..23
          return zeropad(2, visit.getHours());
        case "k":
          // hour 0..23
          return visit.getHours();
        case "I":
          // zero-padded hour 01..12
          return zeropad(2, (visit.getHours() + 11) % 12 + 1);
        case "l":
          // hour 1..12
          return (visit.getHours() + 11) % 12 + 1;
        case "p":
          // AM/PM
          return visit.getHours() < 12 ? "AM" : "PM";
        case "P":
          // am/pm
          return visit.getHours() < 12 ? "am" : "pm";
        case "z": {
          // timezone offset in the form -HHMM or +HHMM
          let tzOffset = visit.getTimezoneOffset();
          let sign = tzOffset < 0 ? "-" : "+";
          tzOffset = Math.abs(tzOffset);
          return sign + zeropad(2, Math.floor(tzOffset / 60)) + zeropad(2, tzOffset % 60);
        }
        case "M":
          // zero-padded minute 00..59
          return zeropad(2, visit.getMinutes());
        case "S":
          // zero-padded second 00..60
          return zeropad(2, visit.getSeconds());
        case "%":
          return "%";
      }
      return literal;
    }
  );
}

function formatTime(visitTime) {
  if (options.useCustomFormat) {
    return formatCustomTime(visitTime);
  }
  let now = new Date();
  let visit = new Date(visitTime);
  if (now - visitTime < 1000 * 3600) {
    let minutesAgo = Math.floor((now - visitTime) / (1000 * 60));
    let minutesAgoText = chrome.i18n.getMessage("minutesAgo", minutesAgo).split(";");
    return minutesAgo == 1 ? minutesAgoText[0] : minutesAgoText[1];
  }
  let dateDiff = calcDateDiff(now, visit);
  if (dateDiff < 1) {
    let hoursAgo = Math.floor((now - visitTime) / (1000 * 3600));
    let hoursAgoText = chrome.i18n.getMessage("hoursAgo", hoursAgo).split(";");
    return hoursAgo == 1 ? hoursAgoText[0] : hoursAgoText[1];
  }
  if (dateDiff < 7) {
    let daysAgo = Math.floor(dateDiff);
    let daysAgoText = chrome.i18n.getMessage("daysAgo", daysAgo).split(";");
    return daysAgo == 1 ? daysAgoText[0] : daysAgoText[1];
  }
  if (options.useISODate) {
    return visit.getFullYear() +
      "-" + zeropad(2, visit.getMonth() + 1) +
      "-" + zeropad(2, visit.getDate()) +
      " " + zeropad(2, visit.getHours()) +
      ":" + zeropad(2, visit.getMinutes()) +
      ":" + zeropad(2, visit.getSeconds());
  }
  return visit.toLocaleString();
}

function formatVisitTime(latest, older) {
  let text = formatTime(latest);
  if (older !== undefined) {
    text += "; " + formatTime(older);
  }
  return "(" + text + ")";
}

function findVisitTimePair(visitTimes) {
  let now = Date.now();
  for (let i = 0; i < visitTimes.length; ++i) {
    if (i >= options.lastVisitedQueryLimit) {
      return [visitTimes[0]];
    }
    if (now - visitTimes[i] > options.lastVisitedOlderThan * 1000) {
      return options.lastVisitedTwoDates && i > 0 ? [visitTimes[0], visitTimes[i]] : [visitTimes[i]];
    }
  }
  return visitTimes.length > 0 ? [visitTimes[0]] : [];
}

function formatURL(url) {
  try {
    url = decodeURIComponent(url);
  } catch (e) {
    // url must have included an invalid UTF-8 sequence.
    return url;
  }
  // Encode bidirectional formatting characters.
  // (RFC 3987 sections 3.2 and 4.1 paragraph 6)
  return url.replace(/[\u200e\u200f\u202a-\u202e]+/g, encodeURIComponent);
}

function formatCustomOverLink(msg) {
  let [latest, older] = findVisitTimePair(msg.visitTimes);
  function formatCustomText(customFormat) {
    return customFormat.replace(
      /%([A-Za-z%])|%\+\((.*?)%\+\)|%-\((.*?)%-\)|%\+\[(.*?)%\+\]|%-\[(.*?)%-\]|%\+{(.*?)%\+}|%-{(.*?)%-}/g,
      function(literal, type, visited, notVisited, bookmarked, notBookmarked, twoDays, notTwoDays) {
        if (type !== undefined) {
          switch (type) {
            case "u":
              // link URL
              return formatURL(msg.url);
            case "T":
              // link latest visit time; empty string if not visited
              return latest !== undefined ? formatTime(latest) : "";
            case "t":
              // older visit time if it exists; empty string if it does not exist
              return older !== undefined ? formatTime(older) : "";
            case "V":
              // the user-defined visited indicator
              return options.visitedPrefix;
            case "B":
              // the user-defined bookmarked indicator
              return options.bookmarkedPrefix;
            case "%":
              return "%";
          }
          return literal;
        }
        if (visited !== undefined) {
          return msg.visitTimes.length ? formatCustomText(visited) : "";
        }
        if (notVisited !== undefined) {
          return msg.visitTimes.length ? "" : formatCustomText(notVisited);
        }
        if (bookmarked !== undefined) {
          return msg.bookmarked ? formatCustomText(bookmarked) : "";
        }
        if (notBookmarked !== undefined) {
          return msg.bookmarked ? "" : formatCustomText(notBookmarked);
        }
        if (twoDays !== undefined) {
          return older !== undefined ? formatCustomText(twoDays) : "";
        }
        if (notTwoDays !== undefined) {
          return older !== undefined ? "" : formatCustomText(notTwoDays);
        }
        return literal;
      }
    );
  }
  return formatCustomText(options.customOverLink);
}

function formatStatusText(msg) {
  if (options.useCustomFormat) {
    return formatCustomOverLink(msg);
  }
  if (!msg.visitTimes.length && !msg.bookmarked) {
    return formatURL(msg.url);
  }
  let text = "";
  if (msg.bookmarked) {
    text += options.bookmarkedPrefix || "🔖";
  } else {
    text += options.visitedPrefix || "🕒";
  }
  if (options.showLastVisited && msg.visitTimes.length) {
    let [latest, older] = findVisitTimePair(msg.visitTimes);
    text += formatVisitTime(latest, older);
  }
  if (options.lastVisitedInFront) {
    return text + " " + formatURL(msg.url);
  }
  return formatURL(msg.url) + " " + text;
}

chrome.runtime.onMessage.addListener(
  function(request, sender) {
    if (!request.url) {
      chrome.tabs.sendMessage(sender.tab.id, "");
      return;
    }
    chrome.bookmarks.search(request, function(results) {
      let bookmarked = results.length > 0;
      chrome.history.getVisits(request, function callback(results) {
        let statusText = formatStatusText({
          url: request.url,
          bookmarked: bookmarked,
          visitTimes: results.map(result => result.visitTime)
        });
        chrome.tabs.sendMessage(sender.tab.id, statusText);
      });
    });
  }
);
