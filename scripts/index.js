var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
const phrases = [
  "How are you",
  "you can pronounce it",
  "Fuzzy Wuzzy was a bear Fuzzy Wuzzy had no hair Fuzzy Wuzzy wasn't very fuzzy was he",
  "She sells sea shells by the sea shore The shells she sells are surely seashells So if she sells shells on the seashore I'm sure she sells seashore shells",
  "How can a clam cram in a clean cream can",
  "Peter Piper picked a peck of pickled peppers How many pickled peppers did Peter Piper pick",
  "I saw Susie sitting in a shoeshine shop Where she sits she shines and where she shines she sits",
  "Unique New York unique New York unique New York",
  "Six slippery snails slid silently seaward",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood",
  "Six slippery snails slid slowly seaward sailing silently",
  "I thought a thought but the thought I thought wasn't the thought I thought I thought",
  "I slit a sheet a sheet I slit and on a slitted sheet I sit",
  "Rubber baby buggy bumpers",
  "Eleven benevolent elephants",
  "I scream you scream we all scream for ice cream",
];

const positiveMessages = [
  "Outstanding job!",
  "Excellent work!",
  "Impressive effort!",
  "Bravo to you!",
  "Well done!",
  "Superb performance!",
  "Exceptional job!",
  "Fantastic effort!",
  "Kudos to you!",
  "Stellar work!",
  "Way to go!",
  "Terrific job!",
  "Remarkable work!",
  "Great achievement!",
  "Exceptional effort!",
  "Outstanding performance!",
  "Incredible job!",
  "Superb job!",
  "Excellent job!",
  "Well executed!",
];
const negativeMessages = [
  "Winner in parallel universe",
  "Lost, but great effort",
  "Champion of last place",
  "Master of mediocrity",
  "Epic fail, as expected",
  "Almost a winner",
  "Born to be a loser",
  "Nailed the losing strategy",
  "Pro at losing gracefully",
  "Lost the game, won hearts",
  "Expert in epic defeats",
  "Legendary loser status",
  "Top-tier underachiever",
  "Medal for participation",
  "King of near-victory",
  "Queen of the underdogs",
  "Captain of the lost cause",
  "Distinguished defeatist",
  "CEO of second place",
  "Majestic in failure",
];

let score = 0;
let isPhraseVisible = false;
let sentenceCount = 0;
const timerWrapper = document.getElementById("timer-wrapper");
const startWrapper = document.getElementById("start-game-wrapper");
const phraseWrapper = document.getElementById("phrase-wrapper");
const resultWrapper = document.getElementById("result-wrapper");

const timeValue = document.getElementById("timeValue");
const startGameButton = document.getElementById("start-game");
const phraseText = document.getElementById("phrase");
const recordButton = document.getElementById("record-button");
const svg = document.getElementById("svg");
const loading = document.getElementById("loading");
const matchResult = document.getElementById("matchResult");
const scoreValue = document.getElementById("score");
const textReceived = document.getElementById("text-received");
const finalScore = document.getElementById("final-score");
const endGameButton = document.getElementById("end-game");

timerWrapper.style.display = "none";
phraseWrapper.style.display = "none";
resultWrapper.style.display = "none";
loading.style.display = "none";

var recognition = new SpeechRecognition();

function randomPhrase() {
  var number = Math.floor(Math.random() * phrases.length);
  return number;
}

function timeCounter() {
  var minutes = 0.5;
  var seconds = minutes * 60;
  var interval = setInterval(() => {
    seconds = seconds - 1;
    const sec = seconds % 60;
    const min = parseInt(seconds / 60);

    timeValue.innerHTML = `${min <= 9 ? `0${min}` : min} : ${
      sec <= 9 ? `0${sec}` : sec
    }`;
    if (seconds === 0) {
      clearInterval(interval);
      recognition.stop();
      timerWrapper.style.display = "none";
      phraseWrapper.style.display = "none";
      resultWrapper.style.display = "block";
    }
  }, [1000]);
}

function testSpeech() {
  recordButton.disabled = true;
  toggleLoading();

  if(!isPhraseVisible){
    showPhrase();
  }

  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function (event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object
    var speechResult = event.results[0][0].transcript.toLowerCase();
    textReceived.innerHTML = "Speech received: " + speechResult + ".";

    if (speechResult == phrase) {
      // fire the negative feedback
      const randomNumber = Math.ceil(Math.random() * 20);
      matchResult.textContent = positiveMessages[randomNumber];
      matchResult.style.color = "green";
      var utter = new window.SpeechSynthesisUtterance(
        positiveMessages[randomNumber]
      );
      utter.lang = "en-ca";
      window.speechSynthesis.speak(utter);
    } else {
      const randomNumber = Math.ceil(Math.random() * 20);
      matchResult.textContent = negativeMessages[randomNumber];
      matchResult.style.color = "red";
      var utter = new window.SpeechSynthesisUtterance(
        negativeMessages[randomNumber]
      );
      utter.lang = "en-ie";
      window.speechSynthesis.speak(utter);
    }
    isPhraseVisible = false;
    setTimeout(showPhrase, 2000);
    console.log("Confidence: " + event.results[0][0].confidence);
  };

  recognition.onspeechend = function () {
    recognition.stop();
    recordButton.disabled = false;
  };

  recognition.onerror = function (event) {
    recordButton.disabled = false;
    phraseText.textContent =
      "Error occurred in recognition: " + event.error;
  };

  recognition.onaudiostart = function (event) {
    //Fired when the user agent has started to capture audio.
    console.log("SpeechRecognition.onaudiostart");
  };

  recognition.onaudioend = function (event) {
    //Fired when the user agent has finished capturing audio.
    console.log("SpeechRecognition.onaudioend");
  };

  recognition.onend = function (event) {
    //Fired when the speech recognition service has disconnected.
    toggleSvg();
    console.log("SpeechRecognition.onend");
  };

  recognition.onnomatch = function (event) {
    //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    console.log("SpeechRecognition.onnomatch");
  };

  recognition.onsoundstart = function (event) {
    //Fired when any sound — recognisable speech or not — has been detected.
    console.log("SpeechRecognition.onsoundstart");
  };

  recognition.onsoundend = function (event) {
    //Fired when any sound — recognisable speech or not — has stopped being detected.
    console.log("SpeechRecognition.onsoundend");
  };

  recognition.onspeechstart = function (event) {
    //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    console.log("SpeechRecognition.onspeechstart");
  };
  recognition.onstart = function (event) {
    //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    console.log("SpeechRecognition.onstart");
  };
}

function toggleLoading() {
  svg.classList.remove("show");
  loading.classList.remove("hide");
  svg.classList.add("hide");
  loading.classList.add("show");
}

function toggleSvg() {
  svg.classList.remove("hide");
  loading.classList.remove("show");
  svg.classList.add("show");
  loading.classList.add("hide");
}

function showPhrase(){
  var phrase = phrases[randomPhrase()];
  // To ensure case consistency while checking with the returned output text
  phrase = phrase.toLowerCase();
  phraseText.textContent = phrase;
  isPhraseVisible = true;
  //   resultPara.textContent = "Right or wrong?";
  //   diagnosticPara.textContent = "...diagnostic messages";
  sentenceCount++;
  //console.log(score/sentenceCount);
}
// add all event listners here
recordButton.addEventListener("click", testSpeech);

startGameButton.addEventListener("click", function () {
  if(!isPhraseVisible){
    showPhrase();
  }
  startWrapper.style.display = "none";
  phraseWrapper.style.display = "block";
  timerWrapper.style.display = "block";
  timeCounter();
});

endGameButton.addEventListener("click", function () {
  window.location.reload();
});
