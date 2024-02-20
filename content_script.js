// Listen for messages from the popup or other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "search") {
    // get the data store in local storage
    const matched = JSON.parse(localStorage.getItem("multi_text")) ?? "None";

    const searchText = request.text;
    let smallWord = searchText.toLowerCase();

    const regex = new RegExp(searchText, "gi");
    const elements = document.querySelectorAll(
      "*:not(script):not(style):not(iframe):not(object):not(embed):not(audio):not(video):not(nav):not(form):not(svg):not(canvas):not(area):not(map):not(math):not(meta):not(link):not(base):not(hr):not(br):not(ins):not(del):not(wbr):not(col):not(colgroup):not(optgroup):not(option):not(datalist):not(fieldset):not(label):not(legend):not(details):not(summary):not(dialog):not(menu):not(menuitem):not(script):not(noscript):not(template):not(textarea):not(style)"
    );
    const uniqueColors = {};
    let matchCount = 0;
    const matchesArray = [];
    const uniqueMatches = new Set();
    const allMatchs = [];

    // check if search input empty
    if (searchText !== "") {
      if (Array.isArray(matched)) {
        const isDuplicate = matched
          .map((element) => element.word.toLowerCase())
          .includes(searchText.toLowerCase());
        if (!isDuplicate) {      
          elements.forEach((element) => {
            if (element.childNodes && element.childNodes.length > 0) {
              element.childNodes.forEach((childNode) => {
                if (childNode.nodeType === Node.TEXT_NODE) {
                  const matches = childNode.textContent.match(regex);
                  if (matches) {
                    // Generate a unique color based on the search word
                    const color = uniqueColors[searchText] || getRandomColor();
                    uniqueColors[searchText] = color;
                    matchCount += matches.length;

                    // Highlight matched text with unique color
                    const replacedText = childNode.textContent.replace(
                      regex,
                      (match) =>
                        `<span id="multiTextFinding" class="toScrollMultiTextFinding${
                          smallWord + matchCount
                        }" style="text-decoration: underline; border: 2px solid ${color}; padding: 2px; border-radius: 9px">${match}</span>`
                    );
                    const wrapper = document.createElement("span");
                    wrapper.innerHTML = replacedText;
                    element.replaceChild(wrapper, childNode);

                    // Store matched words
                    matches.forEach((match) => {
                      if (!uniqueMatches.has(match)) {
                        uniqueMatches.add(match);
                        matchesArray.push({ word: match });
                      }
                    });
                  }
                }
              });
            }
          });

          // Push data from local storage into allMatches
          allMatchs.push(matched);

          // Then push the search text that manipulate to object which key is { word and matched } into allMatches
          allMatchs.push({ word: matchesArray[0]?.word, matched: matchCount });

          // Add data into local storage
          localStorage.setItem(
            "multi_text",
            JSON.stringify(allMatchs.flat(Infinity))
          );
        } else {
          const error = "Duplicate Word";
          sendResponse({ success: false, error });
        }
      } else {
        elements.forEach((element) => {
          if (element.childNodes && element.childNodes.length > 0) {
            element.childNodes.forEach((childNode) => {
              if (childNode.nodeType === Node.TEXT_NODE) {
                const matches = childNode.textContent.match(regex);
                if (matches) {
                  // Generate a unique color based on the search word
                  const color = uniqueColors[searchText] || getRandomColor();
                  uniqueColors[searchText] = color;
                  matchCount += matches.length;

                  // Highlight matched text with unique color
                  const replacedText = childNode.textContent.replace(
                    regex,
                    (match) =>
                      `<span id="multiTextFinding" class="toScrollMultiTextFinding${
                        smallWord + matchCount
                      }" style="text-decoration: underline; border: 2px solid ${color}; padding: 2px; border-radius: 9px">${match}</span>`
                  );
                  const wrapper = document.createElement("span");
                  wrapper.innerHTML = replacedText;
                  element.replaceChild(wrapper, childNode);

                  // Store matched words
                  matches.forEach((match) => {
                    if (!uniqueMatches.has(match)) {
                      uniqueMatches.add(match);
                      matchesArray.push({ word: match, color: color });
                    }
                  });
                }
              }
            });
          }
        });

        // get the data from localstorage (if have)
        const keyMatch = JSON.parse(localStorage.getItem("multi_text"));
        

        // check if matchesArray has more than 1 index select only the first one (prevent duplication word)
        if (keyMatch) {
          allMatchs.push(keyMatch.flat(Infinity));
        }
        if (matchesArray.length !== 0) {
          allMatchs.push(matchesArray[0]?.word);
        }
        const combinedArray = allMatchs.map((word) => ({
          word: word,
          matched: matchCount,
        }));
        localStorage.setItem(
          "multi_text",
          JSON.stringify(combinedArray.flat(Infinity))
        );
      }
    } else {
      const error = 'Please input word'
      sendResponse({ success: false, error });
    }
    // check if there no matching word raise the error
    if (matchCount == 0) {
      const error = 'Word not found'
      sendResponse({ success: false, error })
    } else {
      // Send response back to the popup
      sendResponse({ success: true, matchCount, allMatchs });
    }

    // Send matched words to the background script for storage
    chrome.runtime.sendMessage({
      action: "storeMatches",
      searchText,
      matches: matchesArray,
    });

  } else if (request.action === "load") {
    const keyMatch = JSON.parse(localStorage.getItem("multi_text")) ?? "None";
    chrome.runtime.sendMessage({
      keyMatch,
    });
    sendResponse({ success: true, keyMatch });
  } else if (request.action === "DeleteFromLocalStorage") {
    // Select all span elements with the id "multiTextFinding"
    const highlightedElements = document.querySelectorAll(
      "span#multiTextFinding"
    );

    // Iterate through the selected elements and remove them
    highlightedElements.forEach((element) => {
      element.outerHTML = element.innerText; // Replace the span element with its inner text
    });

    localStorage.removeItem("multi_text");
    sendResponse({ success: true });
  } else if (request.action === "ScrollToWord") {
    const toClass = request.matchedElement;
    const preClass = request.previousClass;

    const path = `toScrollMultiTextFinding${toClass}`;

    const elements = document.getElementsByClassName(path);
    if (preClass.length == 2) {
      const ContainClass = document.getElementsByClassName(preClass[0]);
      for (const element of ContainClass) {
        element.style.backgroundColor = "";
      }
    }
    if (elements.length > 0) {
      // Scroll to the position of the first matched element
      elements[0].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      elements[0].style.backgroundColor = "yellow";
    } else {
    }

    sendResponse({ success: true });
  }
});

// Function to generate a random color
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
