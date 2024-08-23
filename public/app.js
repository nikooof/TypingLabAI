const words =
  "a ability able about above accept according account across act action activity actually add address administration admit adult affect after again against age agency agent ago agree agreement ahead air all allow almost alone along already also although always American among amount analysis and animal another answer any anyone anything appear apply approach area argue arm around arrive art article artist as ask assume at attack attention attorney audience author authority available avoid away baby back bad bag ball bank bar base be beat beautiful because become bed before begin behavior behind believe benefit best better between beyond big bill billion bit black blood blue board body book born both box boy break bring brother budget build building business but buy by call camera campaign can cancer candidate capital car card care career carry case catch cause cell center central century certain certainly chair challenge chance change character charge check child choice choose church citizen city civil claim class clear clearly close coach cold collection college color come commercial common community company compare computer concern condition conference Congress consider consumer contain continue control cost could country couple course court cover create crime cultural culture cup current customer cut dark data daughter day dead deal death debate decade decide decision deep defense degree Democrat democratic describe design despite detail determine develop development die difference different difficult dinner direction director discover discuss discussion disease do doctor dog door down draw dream drive drop drug during each early east easy eat economic economy edge education effect effort eight either election else employee end energy enjoy enough enter entire environment environmental especially establish even evening event ever every everybody everyone everything evidence exactly example executive exist expect experience expert explain eye face fact factor fail fall family far fast father fear federal feel feeling few field fight figure fill film final finally financial find fine finger finish fire firm first fish five floor fly focus follow food foot for force foreign forget form former forward four free friend from front full fund future game garden gas general generation get girl give glass go goal good government great green ground group grow growth guess gun guy hair half hand hang happen happy hard have he head health hear heart heat heavy help her here herself high him himself his history hit hold home hope hospital hot hotel hour house how however huge human hundred husband I idea identify if image imagine impact important improve in include including increase indeed indicate individual industry information inside instead institution interest interesting international interview into investment involve issue it item its itself job join just keep key kid kill kind kitchen know knowledge land language large last late later laugh law lawyer lay lead leader learn least leave left leg legal less let letter level lie life light like likely line list listen little live local long look lose loss lot love low machine magazine main maintain major majority make man manage management manager many market marriage material matter may maybe me mean measure media medical meet meeting member memory mention message method middle might military million mind minute miss mission model modern moment money month more morning most mother mouth move movement movie Mr Mrs much music must my myself name nation national natural nature near nearly necessary need network never new news newspaper next nice night no none nor north not note nothing notice now n't number occur of off offer office officer official often oh oil ok old on once one only onto open operation opportunity option or order organization other others our out outside over own owner page pain painting paper parent part participant particular particularly partner party pass past patient pattern pay peace people per perform performance perhaps period person personal phone physical pick picture piece place plan plant play player PM point police policy political politics poor popular population position positive possible power practice prepare present president pressure pretty prevent price private probably problem process produce product production professional professor program project property protect prove provide public pull purpose push put quality question quickly quite race radio raise range rate rather reach read ready real reality realize really reason receive recent recently recognize record red reduce reflect region relate relationship religious remain remember remove report represent Republican require research resource respond response responsibility rest result return reveal rich right rise risk road rock role room rule run safe same save say scene school science scientist score sea season seat second section security see seek seem sell send senior sense series serious serve service set seven several sex sexual shake share she shoot short shot should shoulder show side sign significant similar simple simply since sing single sister sit site situation six size skill skin small smile so social society soldier some somebody someone something sometimes son song soon sort sound source south southern space speak special specific speech spend sport spring staff stage stand standard star start state statement station stay step still stock stop store story strategy street strong structure student study stuff style subject success successful such suddenly suffer suggest summer support sure surface system table take talk task tax teach teacher team technology television tell ten tend term test than thank that the their them themselves then theory there these they thing think third this those though thought thousand threat three through throughout throw thus time to today together tonight too top total tough toward town trade traditional training travel treat treatment tree trial trip trouble true truth try turn TV two type under understand unit until up upon us use usually value various very victim view violence visit voice vote wait walk wall want war watch water way we weapon wear week weight well west western what whatever when where whether which while white who whole whom whose why wide wife will win wind window wish with within without woman wonder word work worker world worry would write writer wrong yard yeah year yes yet you young your yourself"
    .toLowerCase()
    .split(" ");

const DEFAULT_GAME_TIME = 30 * 1000;
const DEFAULT_WORDS_LENGTH = 40;
let zoomLevel = 100;

globalThis.gameTime = localStorage.getItem("customTime")
  ? localStorage.getItem("customTime")
  : DEFAULT_GAME_TIME;
globalThis.wordsLength = localStorage.getItem("customWordCount")
  ? localStorage.getItem("customWordCount")
  : DEFAULT_WORDS_LENGTH;
globalThis.gameStartTime = null;
globalThis.performanceGraph = null;
globalThis.aiGeneratedText = null;

let isMultiplayer = false;
let isMultiplayerGameStarted = false;

function newGame() {
  document.getElementById("multiPlayerResults").style.display = "none";
  initCartLocalStorage();
  const localBgColor = localStorage.getItem("bgColor");
  const localTextColor = localStorage.getItem("textColor");

  if (localBgColor) {
    setBgColor(localBgColor);
  }

  if (localTextColor) {
    setTextColor(localTextColor);
  }

  const wordsElement = document.getElementById("words");

  wordsElement.innerHTML = "";

  if (!globalThis.aiGeneratedText) {
    const uniqueWords = new Set();
    while (uniqueWords.size < globalThis.wordsLength) {
      uniqueWords.add(getRandomWord());
    }
    uniqueWords.forEach((word) => {
      wordsElement.innerHTML += word;
    });
  } else {
    const words = globalThis.aiGeneratedText.trim().split(/\s+/);
    wordsElement.innerHTML = words.map(formatWord).join("");
  }

  if (wordsElement.firstChild) {
    addClass(wordsElement.firstChild, "current");
    if (wordsElement.firstChild.firstChild) {
      addClass(wordsElement.firstChild.firstChild, "current");
    }
  }

  document.getElementById("time").innerHTML = globalThis.gameTime / 1000;

  globalThis.timer = null;
  globalThis.wpmData = [];

  document.getElementById("graph").innerHTML = "";
  document.getElementById("postPromptOptions").style.display = "none";

  resetCaretPosition();
  setThemes();

  globalThis.wordCount = 0;
  document.getElementById("wordCount").innerHTML =
    globalThis.wordCount + "/" + globalThis.wordsLength;

  toggleDisplayOfTimeWordCount();
}

function initCartLocalStorage() {
  if (typeof window !== "undefined") {
    const initCart = {
      items: [],
    };

    const initCartJSON = JSON.stringify(initCart);

    localStorage.setItem("cart", initCartJSON);
  }
}

function setBgColor(newBgColor) {
  document.documentElement.style.setProperty("--bgColor", newBgColor);
}

function setTextColor(newTextColor) {
  document.documentElement.style.setProperty("--textColorOne", newTextColor);
}

function resetCaretPosition() {
  const currentLetter = document.querySelector(".letter.current");
  const caret = document.getElementById("caret");
  if (currentLetter && caret) {
    const rect = currentLetter.getBoundingClientRect();
    caret.style.top = `${rect.top}px`;
    caret.style.left = `${rect.left - 1}px`;
    caret.style.display = "block";
  }
}

function setThemes() {
  const localBgColorTheme1 = localStorage.getItem("bgColorTheme1");
  const localTextColorTheme1 = localStorage.getItem("textColorTheme1");
  const localBgColorTheme2 = localStorage.getItem("bgColorTheme2");
  const localTextColorTheme2 = localStorage.getItem("textColorTheme2");

  if (localBgColorTheme1) {
    document.getElementById("colorTheme1Box1").style.backgroundColor =
      localBgColorTheme1;
  }

  if (localTextColorTheme1) {
    document.getElementById("colorTheme1Box2").style.backgroundColor =
      localTextColorTheme1;
  }

  if (localBgColorTheme2) {
    document.getElementById("colorTheme2Box1").style.backgroundColor =
      localBgColorTheme2;
  }

  if (localTextColorTheme2) {
    document.getElementById("colorTheme2Box2").style.backgroundColor =
      localTextColorTheme2;
  }
}

function toggleDisplayOfTimeWordCount() {
  if (globalThis.wordsLength === DEFAULT_WORDS_LENGTH) {
    document.getElementById("time").style.display = "block";
    document.getElementById("wordCount").style.display = "none";
  } else {
    document.getElementById("time").style.display = "none";
    document.getElementById("wordCount").style.display = "block";
  }
}

function getWPM() {
  const avgWordLength = 5;
  const words = [...document.querySelectorAll(".word")];
  const lastTypedWord = document.querySelector(".word.current");
  const typedWords = words.slice(0, words.indexOf(lastTypedWord));
  let correctLettersNum = 0;
  typedWords.forEach((word) => {
    if (word.classList.contains("correct")) {
      const letters = [...word.children];
      letters.forEach((letter) => {
        if (letter.classList.contains("correct")) {
          correctLettersNum += 1;
        }
      });
    }
  });
  correctLettersNum += typedWords.length;
  const timeElapsed = (new Date().getTime() - globalThis.gameStartTime) / 60000;
  const avgWordsTyped = correctLettersNum / avgWordLength;
  return Math.round(avgWordsTyped / timeElapsed || 0);
}

function getAccuracy() {
  const words = [...document.querySelectorAll(".word")];
  const lastTypedWord = document.querySelectorAll(".word.current");
  const typedWords = words.slice(0, words.indexOf(lastTypedWord));
  const correctLetters = [];
  const incorrectLetters = [];
  for (let i = 0; i < typedWords.length; i++) {
    const letters = [...typedWords[i].children];
    for (let j = 0; j < letters.length; j++) {
      if (letters[j].classList.contains("correct")) {
        correctLetters.push(letters[j]);
      } else if (letters[j].classList.contains("incorrect")) {
        incorrectLetters.push(letters[j]);
      }
    }
  }
  const totalLetterCount = correctLetters.length + incorrectLetters.length;
  const accuracy =
    totalLetterCount > 0
      ? ((correctLetters.length / totalLetterCount) * 100).toFixed(1)
      : 0;
  return accuracy;
}

function gameOver() {
  removeAllPlayerCarets();

  const initialWidth = document.getElementById("typingArea").offsetWidth;
  clearInterval(globalThis.timer);
  globalThis.wordCount = 0;

  addClass(document.getElementById("typingArea"), "over");
  addClass(document.getElementById("newPromptButton"), "over");
  addClass(document.getElementById("retryButton"), "over");
  addClass(document.getElementById("shareButton"), "over");

  document.getElementById("wpmText").innerHTML = `${getWPM()}`;
  document.getElementById("accText").innerHTML =
    getAccuracy() === 0 ? 0 : `${getAccuracy()}%`;

  addClass(document.getElementById("duringMidPromptOptions"), "over");
  addClass(document.getElementById("newPromptButtonMid"), "over");

  document.getElementById("results").style.width = initialWidth + "px";

  wpmData.shift();
  wpmData.shift();
  createWPMChart();

  document.getElementById("time").innerHTML = "";
  document.getElementById("wordCount").innerHTML = "";
  document.getElementById("time").style.display = "none";
  document.getElementById("wordCount").style.display = "none";
  document.getElementById("caret").style.display = "none";
  document.getElementById("postPromptOptions").style.display = "flex";

  const WPM = getWPM();
  const playerID = socket.id;
  socket.emit("game-over", { playerID, WPM });
  document.getElementById("multiPlayerSettings").style.display = "none";
  document.getElementById("multiPlayerResults").style.display = "block";
}

function addClass(element, name) {
  if (element && !element.classList.contains(name)) {
    element.className += " " + name;
  }
}

function removeClass(element, name) {
  element.classList.remove(name);
}

function formatWord(word) {
  return `<div class="word"><span class='letter'>${word
    .split("")
    .join("</span><span class='letter'>")}</div>`;
}

function getRandomWord() {
  return formatWord(words[getRandomNumber()]);
}

function getRandomNumber() {
  return Math.ceil(Math.random() * words.length) - 1;
}

function updateTimer() {
  if (!globalThis.gameStartTime) {
    globalThis.gameStartTime = new Date().getTime();
    document.getElementById("time").style.color = getComputedStyle(
      document.body
    ).getPropertyValue("--textColorOne");
  }

  const currentTime = new Date().getTime();
  const msPassed = currentTime - globalThis.gameStartTime;
  const sPassed = Math.round(msPassed / 1000);
  const sLeft = Math.round(globalThis.gameTime / 1000) - sPassed;

  const currentWPM = getWPM();
  globalThis.wpmData.push({ seconds: sPassed, wpm: currentWPM });

  if (sLeft <= 0) {
    document.getElementById("time").innerHTML = 0;
    gameOver();
    return;
  }
  document.getElementById("time").innerHTML = sLeft;
}

function createWPMChart() {
  const localBgColor = localStorage.getItem("bgColor");
  const localTextColor = localStorage.getItem("textColor");

  const bgColorToUse = localBgColor
    ? localBgColor
    : getComputedStyle(document.body).getPropertyValue("--bgColor");

  const textColorToUse = localTextColor
    ? localTextColor
    : getComputedStyle(document.body).getPropertyValue("--textColorOne");

  if (globalThis.performanceGraph) {
    globalThis.performanceGraph.destroy();
  }

  const ctx = document.getElementById("graph").getContext("2d");
  globalThis.performanceGraph = new Chart(ctx, {
    type: "line",

    data: {
      labels: globalThis.wpmData.map((data) => data.seconds),
      datasets: [
        {
          label: "WPM",
          data: globalThis.wpmData.map((data) => data.wpm),
          borderColor: textColorToUse,
          backgroundColor: bgColorToUse,
          pointBorderColor: textColorToUse,
          pointBackgroundColor: textColorToUse,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Time / s",
            color: textColorToUse,
            font: {
              size: 13,
            },
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue(
              "--textColorTwo"
            ),
            font: {
              size: 11,
            },
          },
          beginAtZero: true,
        },
        y: {
          title: {
            display: true,
            text: "WPM",
            color: textColorToUse,
            font: {
              size: 13,
            },
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue(
              "--textColorTwo"
            ),
            font: {
              size: 11,
            },
          },
          beginAtZero: true,
        },
      },
    },
  });
}

document.getElementById("typingArea").addEventListener("keydown", (ev) => {
  if (isMultiplayer && !isMultiplayerGameStarted) {
    return;
  }

  const key = ev.key;
  const isLetter = key.length === 1 && key !== " ";
  const isSpace = key === " ";
  const isBackspace = key === "Backspace";

  const currentWord = document.querySelector(".word.current");
  const currentLetter = document.querySelector(".letter.current");
  const expectedLetter = currentLetter?.innerHTML || " ";
  const isFirstLetter = currentLetter === currentWord.firstChild;
  const caret = document.getElementById("caret");

  // console.log({ key, expectedLetter });
  ev.preventDefault();

  if (
    document.getElementById("typingArea").classList.contains("over") ||
    key === "=" ||
    key === "-" ||
    key === "0"
  ) {
    return;
  }

  if (!globalThis.timer && isLetter) {
    updateTimer();
    globalThis.timer = setInterval(updateTimer, 1000);
  }

  if (isLetter) {
    if (currentLetter) {
      addClass(currentLetter, key === expectedLetter ? "correct" : "incorrect");
      removeClass(currentLetter, "current");
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, "current");
      }
    } else {
      let extraIncorrectLettersCount = 0;
      allLetters = [...currentWord.children];
      allLetters.forEach((letter) => {
        if (letter.classList.contains("extra")) {
          extraIncorrectLettersCount += 1;
        }
      });

      if (extraIncorrectLettersCount < 3) {
        const incorrectLetter = document.createElement("span");
        incorrectLetter.innerHTML = key;
        incorrectLetter.className = "letter incorrect extra";
        currentWord.appendChild(incorrectLetter);
      } else {
        return;
      }
    }
  }

  if (isSpace) {
    if (currentWord === document.getElementById("words").lastChild) {
      gameOver();
    }

    if (isFirstLetter) {
      return;
    }

    globalThis.wordCount += 1;

    document.getElementById("wordCount").innerHTML =
      globalThis.wordCount + "/" + globalThis.wordsLength;

    const letterToInvalidate = [
      ...document.querySelectorAll(".word.current .letter:not(.correct)"),
    ];

    letterToInvalidate.forEach((letter) => {
      addClass(letter, "incorrect");
    });

    const lettersInPreviousWord = Array.from(currentWord.children);
    let isPreviousWordCorrect = true;

    for (let i = 0; i < lettersInPreviousWord.length; i++) {
      if (lettersInPreviousWord[i].classList.contains("incorrect")) {
        isPreviousWordCorrect = false;
        break;
      }
    }

    if (isPreviousWordCorrect) {
      addClass(currentWord, "correct");
      removeClass(currentWord, "incorrect");
    } else {
      addClass(currentWord, "incorrect");
    }

    removeClass(currentWord, "current");

    if (currentWord.nextSibling) {
      addClass(currentWord.nextSibling, "current");
      addClass(currentWord.nextSibling.firstChild, "current");
    }

    if (currentLetter) {
      removeClass(currentLetter, "current");
    }
  }

  if (isBackspace) {
    if (currentLetter && !isFirstLetter) {
      removeClass(currentLetter, "current");
      removeClass(currentLetter.previousSibling, "correct");
      removeClass(currentLetter.previousSibling, "incorrect");
      addClass(currentLetter.previousSibling, "current");
    }
    if (!currentLetter && expectedLetter === " ") {
      removeClass(currentWord.lastChild, "correct");
      removeClass(currentWord.lastChild, "incorrect");
      addClass(currentWord.lastChild, "current");
    }
    if (
      currentLetter &&
      isFirstLetter &&
      currentWord.previousSibling.classList.contains("incorrect")
    ) {
      globalThis.wordCount -= 1;
      document.getElementById("wordCount").innerHTML =
        globalThis.wordCount + "/" + globalThis.wordsLength;

      removeClass(currentWord, "current");
      removeClass(currentLetter, "current");
      addClass(currentWord.previousSibling, "current");
      addClass(currentWord.previousSibling.lastChild, "current");

      const lastLetterOfPreviousWord = currentWord.previousSibling.lastChild;

      caret.style.top =
        lastLetterOfPreviousWord.getBoundingClientRect().top + "px";
      caret.style.left =
        lastLetterOfPreviousWord.getBoundingClientRect().right + "px";

      removeClass(currentWord.previousSibling.lastChild, "current");
      addClass(currentWord.previousSibling.lastChild.nextSibling, "current");
    }
    if (currentWord.lastChild.classList.contains("extra")) {
      currentWord.removeChild(currentWord.lastChild);
    }
  }

  if (key === "Backspace" && (ev.metaKey || ev.ctrlKey)) {
    let currentWordList = [];

    if (
      currentLetter &&
      isFirstLetter &&
      currentWord.previousSibling &&
      currentWord.previousSibling.classList.contains("incorrect")
    ) {
      removeClass(currentWord, "current");
      removeClass(currentLetter, "current");
      addClass(currentWord.previousSibling, "current");
      currentWordList = [...currentWord.previousSibling.children];
      currentWordList.forEach((letter) => {
        if (letter) {
          removeClass(letter, "current");
          removeClass(letter, "correct");
          removeClass(letter, "incorrect");
          if (letter.classList.contains("extra")) {
            currentWord.previousSibling.removeChild(letter);
          }
        }
      });
      addClass(currentWord.previousSibling.firstChild, "current");
      resetCaretPosition();
    } else {
      currentWordList = [...currentWord.children];
      currentWordList.forEach((letter) => {
        if (letter) {
          removeClass(letter, "current");
          removeClass(letter, "correct");
          removeClass(letter, "incorrect");
          if (letter.classList.contains("extra")) {
            currentWord.removeChild(letter);
          }
        }
      });
      addClass(currentWord.firstChild, "current");
      resetCaretPosition();
    }
  }

  if (currentWord === document.getElementById("words").lastChild) {
    const currentLetters = [...currentWord.children];
    let shouldGameEnd = true;
    for (let i = 0; i < currentLetters.length; i++) {
      if (currentLetters[i].classList.contains("incorrect")) {
        shouldGameEnd = false;
        break;
      }
    }
    if (shouldGameEnd && currentWord.lastChild.classList.contains("correct")) {
      gameOver();
    }
  }
  const nextLetter = document.querySelector(".letter.current");
  const nextWord = document.querySelector(".word.current");
  caret.style.top =
    (nextLetter || nextWord).getBoundingClientRect().top + 0 + "px";
  caret.style.left =
    (nextLetter || nextWord).getBoundingClientRect()[
      nextLetter ? "left" : "right"
    ] +
    -1 +
    "px";

  const listOfWords = Array.from(document.querySelectorAll("#words .word"));
  const currentWordIndex = listOfWords.indexOf(nextWord);

  const listOfCurrentLetters = Array.from(nextWord.children);
  const nextLetterIndex = listOfCurrentLetters.indexOf(nextLetter);

  playerID = socket.id;

  const caretColor = localStorage.getItem("textColor")
    ? localStorage.getItem("textColor")
    : getComputedStyle(document.body).getPropertyValue("--textColorOne");

  socket.emit("update-caret", {
    playerID,
    caretColor,
    currentWordIndex,
    nextLetterIndex,
  });
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("typingArea").focus();

  document.getElementById("typingArea").addEventListener("focus", () => {
    document.getElementById("focus-msg").style.transition = "opacity 0s";
    document.getElementById("focus-msg").style.opacity = "0";
    document.getElementById("words").style.filter = "blur(0)";
    if (document.getElementById("typingArea").classList.contains("over")) {
      document.getElementById("caret").style.display = "none";
    } else {
      document.getElementById("caret").style.display = "block";
    }
  });

  document.getElementById("typingArea").addEventListener("blur", () => {
    document.getElementById("focus-msg").style.transition = "opacity 0.6s";
    document.getElementById("focus-msg").style.opacity = "1";
    document.getElementById("focus-msg").style.display = "block";
    document.getElementById("words").style.filter = "blur(.3em)";
    document.getElementById("caret").style.display = "none";
  });

  const colorButton = document.getElementById("colorButton");
  const picker = document.getElementById("picker");

  const localBgColor = localStorage.getItem("bgColor");

  var colorPicker = new iro.ColorPicker("#colorPickerContainer", {
    width: 150,
    color: localBgColor
      ? localBgColor
      : getComputedStyle(document.body).getPropertyValue("--bgColor"),
  });

  colorPicker.on(["color:init", "color:change"], function (color) {
    if (
      document.getElementById("colorAreaChoiceButton").innerHTML ===
      "Background"
    ) {
      document.documentElement.style.setProperty("--bgColor", color.hexString);
      localStorage.setItem("bgColor", color.hexString);
    } else {
      document.documentElement.style.setProperty(
        "--textColorOne",
        color.hexString
      );
      localStorage.setItem("textColor", color.hexString);
      document.getElementById("time").style.color = color.hexString;
      document.getElementById("wordCount").style.color = color.hexString;
    }
    if (document.getElementById("typingArea").classList.contains("over")) {
      createWPMChart();
    }
  });

  colorButton.addEventListener("click", function () {
    picker.style.display = "block";
  });

  document.addEventListener("click", function (event) {
    if (!colorButton.contains(event.target) && !picker.contains(event.target)) {
      picker.style.display = "none";
    }
  });

  document.querySelectorAll(".colorThemeBox").forEach((box) => {
    box.style.height = box.style.width + 20 + "px";
  });
});

function newPrompt() {
  clearInterval(globalThis.timer);
  globalThis.gameStartTime = null;
  document.getElementById("typingArea").focus();
  newGame();
  if (document.getElementById("typingArea").classList.contains("over")) {
    removeClass(document.getElementById("typingArea"), "over");
    removeClass(document.getElementById("newPromptButton"), "over");
    removeClass(document.getElementById("retryButton"), "over");
    removeClass(document.getElementById("shareButton"), "over");
    removeClass(document.getElementById("duringMidPromptOptions"), "over");
    removeClass(document.getElementById("newPromptButtonMid"), "over");
  }
  document.getElementById("time").innerHTML =
    Math.round(globalThis.gameTime / 1000) + "";
  setTimeout(() => {
    document.getElementById("typingArea").focus();
    resetCaretPosition();
  }, 0);
}

document.getElementById("newPromptButton").addEventListener("click", () => {
  if (document.getElementById("themeText").value !== "") {
    document.getElementById("sendToGPT").click();
  }
  newPrompt();
});

document.getElementById("newPromptButtonMid").addEventListener("click", () => {
  if (document.getElementById("themeText").value !== "") {
    document.getElementById("sendToGPT").click();
  }
  newPrompt();
});

document.getElementById("retryButton").addEventListener("click", () => {
  retryGame();
});

document.getElementById("shareButton").addEventListener("click", () => {
  sharePerformance();
});

function retryGame() {
  clearInterval(globalThis.timer);
  globalThis.wordCount = 0;
  globalThis.gameStartTime = null;
  document.getElementById("typingArea").focus();

  const words = document.querySelectorAll(".word");
  words.forEach((word) => {
    removeClass(word, "current");
    removeClass(word, "correct");
    removeClass(word, "incorrect");
    const letters = word.querySelectorAll(".letter");
    letters.forEach((letter) => {
      if (letter.classList.contains("extra")) {
        word.removeChild(letter);
      }
      removeClass(letter, "current");
      removeClass(letter, "correct");
      removeClass(letter, "incorrect");
    });
  });

  addClass(document.querySelector(".word"), "current");
  addClass(document.querySelector(".word .letter"), "current");

  document.getElementById("time").innerHTML = globalThis.gameTime / 1000 + "";
  document.getElementById("wordCount").innerHTML =
    globalThis.wordCount + "/" + globalThis.wordsLength;
  globalThis.timer = null;
  globalThis.wpmData = [];
  document.getElementById("graph").innerHTML = "";
  document.getElementById("words").style.marginTop = "0px";

  if (document.getElementById("typingArea").classList.contains("over")) {
    removeClass(document.getElementById("typingArea"), "over");
    removeClass(document.getElementById("newPromptButton"), "over");
    removeClass(document.getElementById("retryButton"), "over");
    removeClass(document.getElementById("shareButton"), "over");
    removeClass(document.getElementById("duringMidPromptOptions"), "over");
    removeClass(document.getElementById("newPromptButtonMid"), "over");
  }

  resetCaretPosition();

  if (
    globalThis.gameTime === DEFAULT_GAME_TIME &&
    globalThis.wordsLength === DEFAULT_WORDS_LENGTH
  ) {
    document.getElementById("time").style.display = "block";
    document.getElementById("wordCount").style.display = "none";
  } else if (
    globalThis.gameTime !== DEFAULT_GAME_TIME &&
    globalThis.wordsLength === DEFAULT_WORDS_LENGTH
  ) {
    document.getElementById("time").style.display = "block";
    document.getElementById("wordCount").style.display = "none";
  } else if (
    globalThis.gameTime === 1000 * 1000 &&
    globalThis.wordsLength !== DEFAULT_WORDS_LENGTH
  ) {
    document.getElementById("time").style.display = "none";
    document.getElementById("wordCount").style.display = "block";
  }

  setTimeout(() => {
    document.getElementById("typingArea").focus();
    resetCaretPosition();
  }, 0);
}

function sharePerformance() {
  var performance = document.getElementById("results");
  html2canvas(performance).then(function (canvas) {
    const dataURL = canvas.toDataURL("image/png");

    const tmpLink = document.createElement("a");
    tmpLink.download = "typingTestPerformance.png";
    tmpLink.href = dataURL;

    document.body.appendChild(tmpLink);
    tmpLink.click();
    document.body.removeChild(tmpLink);
  });
}

document.getElementById("randomTextButton").addEventListener("click", () => {
  const timeSetting = document.getElementById("timeSetting");
  const wordSetting = document.getElementById("wordSetting");
  const theme = document.getElementById("theme");
  const multiPlayerSettings = document.getElementById("multiPlayerSettings");

  const timeButton = document.getElementById("timeButton");
  const wordsButton = document.getElementById("WordsButton");
  const aiButton = document.getElementById("AIOrNoAInButtton");
  const randomTextButton = document.getElementById("randomTextButton");
  const multiPlayerButton = document.getElementById("multiPlayerButton");

  removeClass(timeSetting, "active");
  removeClass(wordSetting, "active");
  removeClass(theme, "active");
  removeClass(multiPlayerSettings, "active");
  setTimeout(() => {
    if (!timeSetting.classList.contains("active")) {
      timeSetting.style.display = "none";
    }
    if (!theme.classList.contains("active")) {
      theme.style.display = "none";
    }
    if (!wordSetting.classList.contains("active")) {
      wordSetting.style.display = "none";
    }
    if (!multiPlayerSettings.classList.contains("active")) {
      multiPlayerSettings.style.display = "none";
    }
  }, 5);

  addClass(randomTextButton, "active");
  removeClass(wordsButton, "active");
  removeClass(timeButton, "active");
  removeClass(aiButton, "active");
  removeClass(multiPlayerButton, "active");
  globalThis.aiGeneratedText = null;
  document.getElementById("themeText").value = "";
  newPrompt();
});

document.getElementById("timeButton").addEventListener("click", () => {
  const timeSetting = document.getElementById("timeSetting");
  const wordSetting = document.getElementById("wordSetting");
  const theme = document.getElementById("theme");
  const multiPlayerSettings = document.getElementById("multiPlayerSettings");

  const timeButton = document.getElementById("timeButton");
  const wordsButton = document.getElementById("WordsButton");
  const aiButton = document.getElementById("AIOrNoAInButtton");
  const randomTextButton = document.getElementById("randomTextButton");
  const multiPlayerButton = document.getElementById("multiPlayerButton");

  timeSetting.style.display = "flex";
  setTimeout(() => addClass(timeSetting, "active"), 5);

  removeClass(wordSetting, "active");
  removeClass(theme, "active");
  removeClass(multiPlayerSettings, "active");
  setTimeout(() => {
    if (!wordSetting.classList.contains("active")) {
      wordSetting.style.display = "none";
    }
    if (!theme.classList.contains("active")) {
      theme.style.display = "none";
    }
    if (!multiPlayerSettings.classList.contains("active")) {
      multiPlayerSettings.style.display = "none";
    }
  }, 5);

  addClass(timeButton, "active");
  removeClass(randomTextButton, "active");
  removeClass(wordsButton, "active");
  removeClass(aiButton, "active");
  removeClass(multiPlayerButton, "active");
});

document.getElementById("WordsButton").addEventListener("click", () => {
  const timeSetting = document.getElementById("timeSetting");
  const wordSetting = document.getElementById("wordSetting");
  const theme = document.getElementById("theme");
  const multiPlayerSettings = document.getElementById("multiPlayerSettings");

  const timeButton = document.getElementById("timeButton");
  const wordsButton = document.getElementById("WordsButton");
  const aiButton = document.getElementById("AIOrNoAInButtton");
  const randomTextButton = document.getElementById("randomTextButton");
  const multiPlayerButton = document.getElementById("multiPlayerButton");

  wordSetting.style.display = "flex";
  setTimeout(() => addClass(wordSetting, "active"), 5);

  removeClass(timeSetting, "active");
  removeClass(theme, "active");
  removeClass(multiPlayerSettings, "active");
  setTimeout(() => {
    if (!timeSetting.classList.contains("active")) {
      timeSetting.style.display = "none";
    }
    if (!theme.classList.contains("active")) {
      theme.style.display = "none";
    }
    if (!multiPlayerSettings.classList.contains("active")) {
      multiPlayerSettings.style.display = "none";
    }
  }, 5);

  addClass(wordsButton, "active");
  removeClass(randomTextButton, "active");
  removeClass(timeButton, "active");
  removeClass(aiButton, "active");
  removeClass(multiPlayerButton, "active");
});

document.getElementById("AIOrNoAInButtton").addEventListener("click", () => {
  const timeSetting = document.getElementById("timeSetting");
  const wordSetting = document.getElementById("wordSetting");
  const theme = document.getElementById("theme");
  const multiPlayerSettings = document.getElementById("multiPlayerSettings");

  const timeButton = document.getElementById("timeButton");
  const wordsButton = document.getElementById("WordsButton");
  const aiButton = document.getElementById("AIOrNoAInButtton");
  const randomTextButton = document.getElementById("randomTextButton");
  const multiPlayerButton = document.getElementById("multiPlayerButton");

  theme.style.display = "flex";
  setTimeout(() => addClass(theme, "active"), 5);

  removeClass(timeSetting, "active");
  removeClass(wordSetting, "active");
  removeClass(multiPlayerSettings, "active");
  setTimeout(() => {
    if (!timeSetting.classList.contains("active")) {
      timeSetting.style.display = "none";
    }
    if (!wordSetting.classList.contains("active")) {
      wordSetting.style.display = "none";
    }
    if (!multiPlayerSettings.classList.contains("active")) {
      multiPlayerSettings.style.display = "none";
    }
  }, 5);

  addClass(aiButton, "active");
  removeClass(timeButton, "active");
  removeClass(wordsButton, "active");
  removeClass(randomTextButton, "active");
  removeClass(multiPlayerButton, "active");
});

document.getElementById("multiPlayerButton").addEventListener("click", () => {
  const timeSetting = document.getElementById("timeSetting");
  const wordSetting = document.getElementById("wordSetting");
  const theme = document.getElementById("theme");
  const multiPlayerSettings = document.getElementById("multiPlayerSettings");

  const timeButton = document.getElementById("timeButton");
  const wordsButton = document.getElementById("WordsButton");
  const aiButton = document.getElementById("AIOrNoAInButtton");
  const randomTextButton = document.getElementById("randomTextButton");
  const multiPlayerButton = document.getElementById("multiPlayerButton");

  setTimeout(() => addClass(multiPlayerSettings, "active"), 5);

  removeClass(timeSetting, "active");
  removeClass(wordSetting, "active");
  removeClass(theme, "active");
  setTimeout(() => {
    if (!timeSetting.classList.contains("active")) {
      timeSetting.style.display = "none";
    }
    if (!wordSetting.classList.contains("active")) {
      wordSetting.style.display = "none";
    }
    if (!theme.classList.contains("active")) {
      theme.style.display = "none";
    }
  }, 5);
  multiPlayerSettings.style.display = "block";

  removeClass(aiButton, "active");
  removeClass(timeButton, "active");
  removeClass(wordsButton, "active");
  removeClass(randomTextButton, "active");
  addClass(multiPlayerButton, "active");
});

document
  .getElementById("fifteenSecondsButton")
  .addEventListener("click", () => {
    globalThis.gameTime = 15 * 1000;
    globalThis.wordsLength = DEFAULT_WORDS_LENGTH;
    if (document.getElementById("themeText").value !== "") {
      document.getElementById("sendToGPT").click();
    }
    newPrompt();
    addClass(document.getElementById("fifteenSecondsButton"), "active");
    removeClass(document.getElementById("thirtySecondsButton"), "active");
    removeClass(document.getElementById("customTime"), "active");
    saveTimeOrWords();
  });

document.getElementById("thirtySecondsButton").addEventListener("click", () => {
  globalThis.gameTime = 30 * 1000;
  globalThis.wordsLength = DEFAULT_WORDS_LENGTH;
  if (document.getElementById("themeText").value !== "") {
    document.getElementById("sendToGPT").click();
  }
  newPrompt();
  addClass(document.getElementById("thirtySecondsButton"), "active");
  removeClass(document.getElementById("fifteenSecondsButton"), "active");
  removeClass(document.getElementById("customTime"), "active");
  saveTimeOrWords();
});

document
  .getElementById("twentyFiveWordsButton")
  .addEventListener("click", () => {
    globalThis.wordsLength = 25;
    globalThis.gameTime = 1000 * 1000;
    if (document.getElementById("themeText").value !== "") {
      document.getElementById("sendToGPT").click();
    }
    newPrompt();

    addClass(document.getElementById("twentyFiveWordsButton"), "active");
    removeClass(document.getElementById("FiftyWordsButton"), "active");
    removeClass(document.getElementById("customWord"), "active");
    saveTimeOrWords();
  });

document.getElementById("FiftyWordsButton").addEventListener("click", () => {
  globalThis.wordsLength = 50;
  globalThis.gameTime = 1000 * 1000;
  if (document.getElementById("themeText").value !== "") {
    document.getElementById("sendToGPT").click();
  }
  newPrompt();

  removeClass(document.getElementById("twentyFiveWordsButton"), "active");
  addClass(document.getElementById("FiftyWordsButton"), "active");
  removeClass(document.getElementById("customWord"), "active");
  saveTimeOrWords();
});

globalThis.addEventListener("resize", resetCaretPosition);

document.getElementById("customTime").addEventListener("click", () => {
  document.getElementById("customTimePopup").style.display = "flex";
  document.getElementById("customTimeInput").value = "";
});

document.getElementById("setCustomTime").addEventListener("click", () => {
  const customTime = parseInt(document.getElementById("customTimeInput").value);
  if (customTime && customTime > 0 && customTime <= 300) {
    globalThis.gameTime = customTime * 1000;
    globalThis.wordsLength = DEFAULT_WORDS_LENGTH;
    document.getElementById("customTimePopup").style.display = "none";
    if (document.getElementById("themeText").value !== "") {
      document.getElementById("sendToGPT").click();
    }
    newPrompt();
    removeClass(document.getElementById("fifteenSecondsButton"), "active");
    removeClass(document.getElementById("thirtySecondsButton"), "active");
    addClass(document.getElementById("customTime"), "active");
    saveTimeOrWords();
  }
});

const customTimeInputField = document.getElementById("customTimeInput");

customTimeInputField.addEventListener("input", function () {
  const value = parseInt(customTimeInputField.value, 10);

  if (isNaN(value) || value < 1 || value > 300) {
    document.getElementById("alertMessageTime").style.opacity = 1;
    customTimeInputField.value = "";
  }
  setTimeout(() => {
    document.getElementById("alertMessageTime").style.opacity = 0;
  }, 3000);
});

document.getElementById("customWord").addEventListener("click", (event) => {
  document.getElementById("customWordPopup").style.display = "flex";
  document.getElementById("customWordInput").value = "";
});

document.getElementById("setCustomWord").addEventListener("click", (event) => {
  const customWordCount = parseInt(
    document.getElementById("customWordInput").value
  );
  if (customWordCount > 0 && customWordCount <= 200) {
    globalThis.wordsLength = customWordCount;
    globalThis.gameTime = 1000 * 1000;
    document.getElementById("customWordPopup").style.display = "none";
    if (document.getElementById("themeText").value !== "") {
      document.getElementById("sendToGPT").click();
    }
    newPrompt();
    removeClass(document.getElementById("twentyFiveWordsButton"), "active");
    removeClass(document.getElementById("FiftyWordsButton"), "active");
    addClass(document.getElementById("customWord"), "active");
    saveTimeOrWords();
  }
});

const customWordInputField = document.getElementById("customWordInput");
customWordInputField.addEventListener("input", function () {
  const value = parseInt(customWordInputField.value, 10);

  if (isNaN(value) || value < 1 || value > 200) {
    document.getElementById("alertMessageWords").style.opacity = 1;
    customWordInputField.value = "";
  }
  setTimeout(() => {
    document.getElementById("alertMessageWords").style.opacity = 0;
  }, 3000);
});

document.querySelectorAll(".closePopup").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".popup").style.display = "none";
  });
});

globalThis.onclick = function (event) {
  if (event.target.className === "popup") {
    event.target.style.display = "none";
  }
};

function checkCapsLock(event) {
  document.getElementById("capsLock").style.opacity = event.getModifierState(
    "CapsLock"
  )
    ? "1"
    : "0";
}

document.addEventListener("keydown", (event) => checkCapsLock(event));
document.addEventListener("keyup", (event) => checkCapsLock(event));

document
  .getElementById("githubButton")
  .addEventListener("click", () =>
    globalThis.open("https://github.com/nikooof/TypingLabAI", "blank")
  );

document
  .getElementById("colorAreaChoiceButton")
  .addEventListener("click", () => {
    document.getElementById("colorSwitch").click();
  });

document.getElementById("resetColor").addEventListener("click", () => {
  document.documentElement.style.setProperty("--bgColor", "#141221");
  document.documentElement.style.setProperty("--textColorOne", "#19a9a9");
  localStorage.setItem("bgColor", "#141221");
  localStorage.setItem("textColor", "#19a9a9");
  document.getElementById("time").style.color = "#19a9a9";
  document.getElementById("wordCount").style.color = "#19a9a9";
  if (document.getElementById("typingArea").classList.contains("over")) {
    createWPMChart();
  }
});

newGame();
resetCaretPosition();
globalThis.addEventListener("load", function () {
  setTimeout(() => {
    document.getElementById("words").style.opacity = "0.1";
    newPrompt();
    document.getElementById("words").style.opacity = "1";
    document.getElementById("typingArea").click();
    document.getElementById("typingArea").focus();
  }, 0);
});

function debounce(func, wait) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}

function showCaret() {
  resetCaretPosition();
  document.getElementById("caret").style.display = "block";
  resetAllCaretsPosition();
}

globalThis.addEventListener("scroll", () => {
  document.getElementById("caret").style.display = "none";
  const caretElements = document.querySelectorAll("[id^='caret-']");
  caretElements.forEach((caretElement) => {
    caretElement.style.display = "none";
  });
});

globalThis.addEventListener("scroll", debounce(showCaret, 500));

document.getElementById("colorSwitch").addEventListener("change", function () {
  document.getElementById("colorAreaChoiceButton").click();
  if (
    document.getElementById("colorAreaChoiceButton").innerHTML === "Background"
  ) {
    document.getElementById("colorAreaChoiceButton").innerHTML = "Text";
  } else {
    document.getElementById("colorAreaChoiceButton").innerHTML = "Background";
  }
});

document.getElementById("setColor1").addEventListener("click", function () {
  const colorBox1 = document.getElementById("colorTheme1Box1");
  const colorBox2 = document.getElementById("colorTheme1Box2");
  const bgColor = globalThis.getComputedStyle(colorBox1).backgroundColor;
  const textColor = globalThis.getComputedStyle(colorBox2).backgroundColor;
  document.documentElement.style.setProperty("--bgColor", bgColor);
  document.documentElement.style.setProperty("--textColorOne", textColor);
  localStorage.setItem("bgColor", bgColor);
  localStorage.setItem("textColor", textColor);
  document.getElementById("time").style.color = textColor;
  document.getElementById("wordCount").style.color = textColor;
  if (document.getElementById("typingArea").classList.contains("over")) {
    createWPMChart();
  }
});

document.getElementById("setColor2").addEventListener("click", function () {
  const colorBox1 = document.getElementById("colorTheme2Box1");
  const colorBox2 = document.getElementById("colorTheme2Box2");
  const bgColor = globalThis.getComputedStyle(colorBox1).backgroundColor;
  const textColor = globalThis.getComputedStyle(colorBox2).backgroundColor;
  document.documentElement.style.setProperty("--bgColor", bgColor);
  document.documentElement.style.setProperty("--textColorOne", textColor);
  localStorage.setItem("bgColor", bgColor);
  localStorage.setItem("textColor", textColor);
  document.getElementById("time").style.color = textColor;
  document.getElementById("wordCount").style.color = textColor;
  if (document.getElementById("typingArea").classList.contains("over")) {
    createWPMChart();
  }
});

document.getElementById("saveColor1").addEventListener("click", function () {
  const colorBox1 = document.getElementById("colorTheme1Box1");
  const colorBox2 = document.getElementById("colorTheme1Box2");

  let localBgColor = localStorage.getItem("bgColor");
  let localTextColor = localStorage.getItem("textColor");

  if (localBgColor) {
    colorBox1.style.backgroundColor = localBgColor;
  }
  if (localTextColor) {
    colorBox2.style.backgroundColor = localTextColor;
  }

  document.documentElement.style.setProperty(
    "--themeBoxOneBgColor",
    localBgColor
  );
  document.documentElement.style.setProperty(
    "--themeBoxOneTextColor",
    localTextColor
  );

  localStorage.setItem("bgColorTheme1", localBgColor);
  localStorage.setItem("textColorTheme1", localTextColor);
});

document.getElementById("saveColor2").addEventListener("click", function () {
  const colorBox1 = document.getElementById("colorTheme2Box1");
  const colorBox2 = document.getElementById("colorTheme2Box2");

  let localBgColor = localStorage.getItem("bgColor");
  let localTextColor = localStorage.getItem("textColor");

  if (localBgColor) {
    colorBox1.style.backgroundColor = localBgColor;
  }
  if (localTextColor) {
    colorBox2.style.backgroundColor = localTextColor;
  }

  document.documentElement.style.setProperty(
    "--themeBoxTwoBgColor",
    localBgColor
  );
  document.documentElement.style.setProperty(
    "--themeBoxTwoTextColor",
    localTextColor
  );

  localStorage.setItem("bgColorTheme2", localBgColor);
  localStorage.setItem("textColorTheme2", localTextColor);
});

document.addEventListener("keydown", (event) => {
  if (
    (event.key === "r" || event.key === "R") &&
    (event.metaKey || event.ctrlKey)
  ) {
    globalThis.location.reload();
  }

  if (event.key === "=" && (event.metaKey || event.ctrlKey)) {
    zoomLevel += 10;
    document.body.style.zoom = zoomLevel + "%";
  }

  if (event.key === "-" && (event.metaKey || event.ctrlKey)) {
    zoomLevel -= 10;
    document.body.style.zoom = zoomLevel + "%";
  }

  if (event.key === "0" && (event.metaKey || event.ctrlKey)) {
    zoomLevel = 100;
    document.body.style.zoom = zoomLevel + "%";
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closePopup();
    document.activeElement.blur();
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const customTimePopup = document.getElementById("customTimePopup");
    const customWordPopup = document.getElementById("customWordPopup");
    const aiButton = document.getElementById("AIOrNoAInButtton");

    if (customTimePopup.style.display !== "none") {
      document.getElementById("setCustomTime").click();
    }

    if (customWordPopup.style.display !== "none") {
      document.getElementById("setCustomWord").click();
    }

    if (aiButton.classList.contains("active")) {
      document.getElementById("sendToGPT").click();
    }
    document.activeElement.blur();
  }
});

function closePopup() {
  document.getElementById("customWordPopup").style.display = "none";
  document.getElementById("customTimePopup").style.display = "none";
  document.getElementById("picker").style.display = "none";
}

function saveTimeOrWords() {
  if (globalThis.wordsLength === DEFAULT_WORDS_LENGTH) {
    localStorage.setItem("customTime", globalThis.gameTime);
    localStorage.removeItem("customWordCount");
  } else {
    localStorage.setItem("customWordCount", globalThis.wordsLength);
    localStorage.removeItem("customTime");
  }
}

document.addEventListener("keydown", (event) => {
  if (
    event.key.match(/^[a-z]$/i) &&
    document.activeElement !== typingArea &&
    !document.getElementById("theme").classList.contains("active") &&
    document.getElementById("customWordPopup").style.display === "none" &&
    document.getElementById("customTimePopup").style.display === "none" &&
    document.getElementById("picker").style.display === "none"
  ) {
    document.getElementById("typingArea").focus();
    return;
  }
});

document.getElementById("sendToGPT").addEventListener("click", async () => {
  try {
    document.getElementById("words").style.opacity = "0.05";
    document.getElementById("loading").style.opacity = 1;
    document.getElementById("loadingBar").style.opacity = 1;
    const themeInput = document.getElementById("themeText").value;
    const extra = Number(globalThis.wordsLength) + 50;

    const promptToBeSent = `Generate a paragraph that is precisely ${extra} words long on the topic: ${themeInput}. Adhere strictly to the following guidelines: 1. Make it super different, especially compared to the previous generation. 2. All words must be lowercase. 3. Do not use any numbers or punctuation. 4. There should no contractions. 5. There should no hyphenated words. 6. Do not include a period at the end of the paragraph. 7. Separate words with single spaces only. 8. Do not start or end the paragraph with spaces.`;

    const options = {
      method: "POST",
      body: JSON.stringify({
        message: promptToBeSent,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(
      "https://typinggameprivate.onrender.com/gemini",
      options
    );
    const data = await response.text();
    const text = data.split(" ");

    document.getElementById("loading").style.opacity = 0;
    document.getElementById("loadingBar").style.opacity = 0;
    document.getElementById("words").style.opacity = "1";

    if (text.length > globalThis.wordsLength) {
      globalThis.aiGeneratedText = text
        .slice(0, globalThis.wordsLength)
        .join(" ");
    } else {
      globalThis.aiGeneratedText = text.join(" ");
    }
    newPrompt();
  } catch (error) {
    if (error.message && error.message.includes("GoogleGenerativeAI Error")) {
      document.getElementById("AIAlertMessageText").innerHTML =
        "An issue occured while generating a prompt. Please try again in 1 minute.";
    } else {
      document.getElementById("AIAlertMessageText").innerHTML =
        "An issue occured while generating a prompt. Please retry later.";
    }
    document.getElementById("alertMessageAI").style.opacity = 1;
    setTimeout(() => {
      document.getElementById("alertMessageAI").style.opacity = 0;
    }, 3000);

    document.getElementById("loading").style.opacity = 0;
    document.getElementById("loadingBar").style.opacity = 0;
  }
});

const socket = io("https://typinggameprivate.onrender.com");

const createGameButton = document.getElementById("createGame");
createGameButton.addEventListener("click", () => {
  createGameOptions = document.getElementById("createGameOptions");
  joinGameOptions.style.display = "none";
  createGameOptions.style.display = "flex";
});

const joinGame = document.getElementById("joinGame");
joinGame.addEventListener("click", () => {
  joinGameOptions = document.getElementById("joinGameOptions");
  createGameOptions.style.display = "none";
  joinGameOptions.style.display = "flex";
  document.getElementById("copyGameID").style.display = "none";
});

const submitNameButton = document.getElementById("submitName");
submitNameButton.addEventListener("click", () => {
  document.getElementById("AIAlertMessageText").innerHTML =
    "A game has been created. Please share the ID with your friends to play together!";
  document.getElementById("alertMessageAI").style.opacity = 1;
  setTimeout(() => {
    document.getElementById("alertMessageAI").style.opacity = 0;
  }, 3000);
  const name = document.getElementById("nameInput").value;
  const gameTime = globalThis.gameTime;
  const words = document.getElementById("words").innerHTML;
  const caretColor = localStorage.getItem("textColor")
    ? localStorage.getItem("textColor")
    : getComputedStyle(document.body).getPropertyValue("--textColorOne");
  const data = { name, gameTime, words, caretColor };
  socket.emit("create-game", data);
  document.getElementById("copyGameIDText").innerHTML = socket.id;
  document.getElementById("copyGameID").style.display = "flex";
});

document.getElementById("copyIDButton").addEventListener("click", () => {
  const textToCopy = document.getElementById("copyGameIDText").innerText;
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      document.getElementById("AIAlertMessageText").innerHTML =
        "The game ID has been copied to your clipboard! Feel free to share!";
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("AIAlertMessageText").innerHTML =
        "Failed to copy the game ID to your clipboard. Please try again!";
    });
  document.getElementById("alertMessageAI").style.opacity = 1;
  setTimeout(() => {
    document.getElementById("alertMessageAI").style.opacity = 0;
  }, 3000);
});

const joinGameButton = document.getElementById("joinGameButton");
joinGameButton.addEventListener("click", () => {
  const gameID = document.getElementById("gameID").value;
  const name = document.getElementById("nameJoinInput").value;
  const caretColor = localStorage.getItem("textColor")
    ? localStorage.getItem("textColor")
    : getComputedStyle(document.body).getPropertyValue("--textColorOne");
  const data = { gameID, name, caretColor };
  socket.emit("join-game", data);
  document.getElementById("AIAlertMessageText").innerHTML =
    "You have joined a game! Get ready to compete with your friends!";
  document.getElementById("alertMessageAI").style.opacity = 1;
  setTimeout(() => {
    document.getElementById("alertMessageAI").style.opacity = 0;
  }, 3000);
  document.getElementById("typingArea").focus();
});

socket.on("game-not-found", () => {
  document.getElementById("AIAlertMessageText").innerHTML =
    "This game could not be found. Please try again or make a new game";
  document.getElementById("alertMessageAI").style.opacity = 1;
  setTimeout(() => {
    document.getElementById("alertMessageAI").style.opacity = 0;
  }, 3000);
});

socket.on("not-lobby-leader", () => {
  document.getElementById("AIAlertMessageText").innerHTML =
    "The person who created the game must be the one to start it!";
  document.getElementById("alertMessageAI").style.opacity = 1;
  setTimeout(() => {
    document.getElementById("alertMessageAI").style.opacity = 0;
  }, 3000);
});

socket.on("player-joined", (data) => {
  const { playerID, name } = data;
  isMultiplayer = data.isMultiplayer;
  if (playerID !== socket.id) {
    document.getElementById(
      "AIAlertMessageText"
    ).innerHTML = `Please welcome ${name}!!! They have just joined the game!!! Get ready to compete!!!`;
    document.getElementById("alertMessageAI").style.opacity = 1;
    setTimeout(() => {
      document.getElementById("alertMessageAI").style.opacity = 0;
    }, 2000);
  }
});

socket.on("game-settings", (settings) => {
  document.getElementById("time").innerHTML = settings.gameTime / 1000;
  document.getElementById("words").innerHTML = settings.words;
});

const startGameButton = document.getElementById("startGame");
startGameButton.addEventListener("click", () => {
  joinGameOptions.style.display = "none";
  createGameOptions.style.display = "none";
  document.getElementById("copyGameID").style.display = "none";
  socket.emit("start-game", socket.id);
  document.getElementById("typingArea").focus();
});

socket.on("countdown", (seconds) => {
  document.getElementById("alertMessageAI").style.opacity = 1;
  document.getElementById("AIAlertMessageText").innerHTML =
    "Warm up your fingers and get ready to type! The game starts in " +
    seconds +
    " seconds!";
  if (seconds === 0) {
    setTimeout(() => {
      document.getElementById("alertMessageAI").style.opacity = 0;
    }, 1000);
  }
});

socket.on("start-timer", (gameTime) => {
  isMultiplayerGameStarted = true;
  document.getElementById("AIAlertMessageText").innerHTML =
    "Go!! Go!!! Go!!!! Go!!!!! Go!!!!!! The race has started! Good luck!";
  document.getElementById("alertMessageAI").style.opacity = 1;
  setTimeout(() => {
    document.getElementById("alertMessageAI").style.opacity = 0;
  }, 1000);

  globalThis.gameTime = gameTime;

  if (!globalThis.timer) {
    updateTimer();
    globalThis.timer = setInterval(updateTimer, 1000);
  }
});

socket.on("update-caret-position", (data) => {
  const { playerID, caretColor, currentWordIndex, nextLetterIndex } = data;

  if (playerID === socket.id) {
    const localDuplicateCaret = document.getElementById("caret-" + playerID);
    if (localDuplicateCaret) {
      localDuplicateCaret.style.display = "none";
    }
    return;
  }

  let caret = document.getElementById("caret-" + playerID);
  if (!caret) {
    caret = createPlayerCaret(playerID, caretColor);
  }

  const targetWord =
    document.querySelectorAll("#words .word")[currentWordIndex];
  const targetLetter = targetWord ? targetWord.children[nextLetterIndex] : null;

  if (targetLetter) {
    const { top, left } = targetLetter.getBoundingClientRect();
    caret.style.top = `${top}px`;
    caret.style.left = `${left - 1}px`;
  } else if (targetWord) {
    const { top, right } = targetWord.getBoundingClientRect();
    caret.style.top = `${top}px`;
    caret.style.left = `${right - 1}px`;
  }
});

function createPlayerCaret(playerID, color) {
  let existingCaret = document.getElementById("caret-" + playerID);
  if (existingCaret) {
    return existingCaret;
  }

  const caret = document.createElement("div");

  caret.id = "caret-" + playerID;
  caret.style.display = "block";
  caret.style.position = "fixed";
  caret.style.backgroundColor = color ? color : "red";
  caret.style.width = "0.15em";
  caret.style.height = "1.35em";
  caret.style.transition = "top 0.15s ease, left 0.2s ease";

  const existingCaretElement = document.getElementById("caret");
  if (existingCaretElement && existingCaretElement.parentNode) {
    existingCaretElement.parentNode.insertBefore(
      caret,
      existingCaretElement.nextSibling
    );
  } else {
    document.getElementById("typingArea").appendChild(caret);
  }

  if (playerID === socket.id) {
    const localDuplicateCaret = document.getElementById("caret-" + playerID);
    if (localDuplicateCaret) {
      localDuplicateCaret.style.display = "none";
    }
  }

  return caret;
}

const multiPlayerResultsList = [];

socket.on("player-wpm", (data) => {
  const { playerID, playerName, WPM } = data;

  multiPlayerResultsList.push({ playerName, WPM });
  multiPlayerResultsList.sort((a, b) => b.WPM - a.WPM);

  if (
    multiPlayerResultsList.length > 0 &&
    multiPlayerResultsList[0].playerName.toLowerCase() === "tammy" &&
    playerID === socket.id
  ) {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      displayResultsTable(multiPlayerResultsList);
    }, 250);
  }

  setTimeout(() => {
    displayResultsTable(multiPlayerResultsList);
  }, 250);
});

function displayResultsTable(results) {
  const color = getComputedStyle(document.body).getPropertyValue(
    "--textColorOne"
  );
  const resultsTable = document.createElement("table");
  resultsTable.setAttribute("border", "1");
  resultsTable.style.border = `2px solid ${color}`;
  resultsTable.style.borderCollapse = "collapse";

  const headerRow = document.createElement("tr");
  const playerNameHeader = document.createElement("th");
  playerNameHeader.innerText = "Players";
  playerNameHeader.style.color = color;
  playerNameHeader.style.padding = "10px 10px";
  const wpmHeader = document.createElement("th");
  wpmHeader.innerText = "WPM";
  wpmHeader.style.color = color;
  wpmHeader.style.padding = "10px 10px";

  headerRow.appendChild(playerNameHeader);
  headerRow.appendChild(wpmHeader);
  resultsTable.appendChild(headerRow);

  results.forEach((result) => {
    const row = document.createElement("tr");
    const playerIDCell = document.createElement("td");
    playerIDCell.innerText = result.playerName;
    playerIDCell.style.color = color;
    playerIDCell.style.padding = "10px 10px";
    const wpmCell = document.createElement("td");
    wpmCell.innerText = result.WPM;
    wpmCell.style.color = color;
    wpmCell.style.padding = "10px 10px";
    row.appendChild(playerIDCell);
    row.appendChild(wpmCell);
    resultsTable.appendChild(row);
  });

  const multiPlayerResults = document.getElementById("multiPlayerResults");
  multiPlayerResults.innerHTML = "";
  multiPlayerResults.appendChild(resultsTable);
  multiPlayerResults.style.paddingTop = "15px";
}

socket.on("create-caret", (data) => {
  const { playerID, caretColor } = data;

  let caret = document.getElementById("caret-" + playerID);
  if (!caret) {
    caret = createPlayerCaret(playerID, caretColor);
  }
  resetCaretPositionMultiplayer(playerID);
  resetAllCaretsPosition();
  if (playerID === socket.id) {
    caret.style.display = "none";
    return;
  }
});

function resetAllCaretsPosition() {
  const carets = document.querySelectorAll("[id^='caret-']");
  carets.forEach((caret) => {
    const playerID = caret.id.split("-")[1];
    resetCaretPositionMultiplayer(playerID);
  });
}

function resetCaretPositionMultiplayer(playerID) {
  const caret = document.getElementById("caret-" + playerID);
  const currentLetter = document.querySelector(".letter.current");
  if (currentLetter && caret) {
    const rect = currentLetter.getBoundingClientRect();
    caret.style.top = `${rect.top}px`;
    caret.style.left = `${rect.left - 1}px`;
    caret.style.display = "block";
  }
}

function removeAllPlayerCarets() {
  const allCarets = document.querySelectorAll('[id^="caret-"]');
  allCarets.forEach((caret) => {
    caret.remove();
  });
}
