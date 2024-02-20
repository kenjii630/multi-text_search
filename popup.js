// popup.js

// Function to send a message to the content script to perform the search
const search = () => {
  const searchText = document.getElementById("searchInput").value.trim();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "search", text: searchText },
      (response) => {
        if (response && response.success) {
          // Update UI to display search text and number of matches found
          document.getElementById(
            "searchText"
          ).innerText = `Current Searching for: ${searchText}`;
          document.getElementById(
            "matchCount"
          ).innerText = `Current Matching: ${response.matchCount}`;
          document.getElementById("matches").innerText = ` \n${
            response.allMatches || ""
          }`;
          updateUIWithMatches();
          document.getElementById("searchInput").value = "";
        } else {
          var element = document.getElementById("searchInput");
          element.classList.add("error");
          document.getElementById("errorMsg").innerText = `${response.error}`;
          // Set a timeout to remove the 'error' class after 2000 milliseconds (2 seconds)
          setTimeout(function () {
            element.classList.remove("error");
            document.getElementById("errorMsg").innerText = ``;
          }, 1000);
        }
      }
    );
  });
};

// Function to requesting to remove all matching and local storage
const onDeleteAll = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "DeleteFromLocalStorage" },
      (response) => {
        if (response && response.success) {
          updateUIWithMatches();
          document.getElementById("matches").innerText = ``;
          document.getElementById("searchText").innerText = ``;
          document.getElementById("matchCount").innerText = ``;
          document.getElementById("matches").innerText = ``;
          document.getElementById("searchInput").value = "";
        }
      }
    );
  });
};

// Function to retrieve data from localStorage and update the UI
const updateUIWithMatches = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "load", text: searchText },
      (response) => {
        if (response && response.success) {
          // Assuming response.allMatchs contains the array of objects
          const allMatches = response.keyMatch;
          let perWord = 0;
          let previousClass = [];
          let trackWordScroll = 0;

          // Construct a string representation of all elements in the array
          let matchesString = "";
          // Check if allMatches has props
          if (allMatches.length !== 0) {
            allMatches.forEach((match) => {
              if (match.word && match.matched) {
                matchesString += `\n${match.word}: ${match.matched}\n`;

              } else {
              }
            });
          }

          document.getElementById("matches").innerText = `\n${
            response.allMatches || ""
          }`;

          // Generate buttons dynamically for each element in the allMatches array
          allMatches.forEach((match) => {
            // Check if the current match has a 'matched' property
            if (match.hasOwnProperty("matched")) {
              // Create a button element
              const button = document.createElement("button");
              button.classList.add("button-11");

              button.textContent = `word: ${match.word}(${match.matched})`;

              const className = match.word.toLowerCase();
              // Attach event listener to the button
              button.addEventListener("click", () => {
                // Call a function passing the matched value as an argument
                performAction(className, match.matched);
              });

              // Append the button to the "matches" element
              document.getElementById("matches").appendChild(button);
            }
          });

          // Function to perform action with the passed argument
          function performAction(className, indexs) {
            perWord += 1;

            if (perWord <= indexs) {
              trackWordScroll += 1;

              const matchedElement = className + perWord;

              previousClass.push(`toScrollMultiTextFinding${matchedElement}`);
              if (previousClass.length == 3) {
                previousClass.shift();
              }

              scrollToWord(matchedElement, previousClass);
            } else {
              perWord = 0;
              trackWordScroll = 0;
            }
          }
        }
      }
    );
  });
};

// Function to scroll to position of matching word
const scrollToWord = (matchedElement, previousClass) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "ScrollToWord", matchedElement, previousClass },
      (response) => {
        if (response && response.success) {
          console.log("this is matchedElement", matchedElement);
        }
      }
    );
  });
};

// Event listener for the popup being opened
chrome.extension.getViews({ type: "popup" }).forEach((popup) => {
  popup.addEventListener("DOMContentLoaded", () => {
    // Call the function to retrieve data from localStorage and update the UI
    updateUIWithMatches();
  });
});

// animation of delete
document.querySelectorAll(".button").forEach((button) =>
  button.addEventListener("click", (e) => {
    if (!button.classList.contains("delete")) {
      button.classList.add("delete");
      setTimeout(() => button.classList.remove("delete"), 3200);
    }
    e.preventDefault();
  })
);

document.getElementById("searchButton").addEventListener("click", search);
document.getElementById("removeSearch").addEventListener("click", onDeleteAll);
document.getElementById("scrollToWord").addEventListener("click", scrollToWord);
