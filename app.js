// Full JavaScript logic for Typing Trainer with Finger Hints and Leaderboard
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const inputEl = document.getElementById("input");
const targetEl = document.getElementById("target");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("acc");
const charsEl = document.getElementById("chars");
const errsEl = document.getElementById("errs");
const nextCharEl = document.getElementById("nextChar");
const fingerHintEl = document.getElementById("fingerHint");
const timeDisplay = document.getElementById("timeDisplay");
const meterBar = document.getElementById("meterBar");
const leaderTable = document.querySelector("#leaderTable tbody");
const modeSel = document.getElementById("mode");
const customArea = document.getElementById("customArea");
const useCustomBtn = document.getElementById("useCustom");
const customTextEl = document.getElementById("customText");

let targetText = "";
let typedText = "";
let timer = null;
let duration = 30;
let startTime = null;
let errors = 0;

function setTargetText(text){
  targetText = text;
  targetEl.innerHTML = "";
  [...text].forEach((ch,i)=>{
    const span=document.createElement("span");
    span.textContent=ch;
    if(i===0) span.classList.add("next");
    targetEl.appendChild(span);
  });
  typedText="";
  inputEl.value="";
  errors=0;
  updateStats();
  updateNextChar();
}

function startSession(){
  duration=parseInt(document.getElementById("duration").value);
  setTargetText(getSampleText());
  inputEl.disabled=false;
  inputEl.focus();
  startTime=Date.now();
  clearInterval(timer);
  timer=setInterval(tick,100);
}

function resetSession(){
  clearInterval(timer);
  inputEl.value="";
  inputEl.disabled=true;
  targetEl.innerHTML="Click Start (or paste custom text)";
  typedText="";
  errors=0;
  updateStats();
  nextCharEl.textContent="—";
  fingerHintEl.textContent="—";
  highlightFinger(null);
  timeDisplay.textContent="00:"+("0"+duration).slice(-2);
  meterBar.style.width="0%";
}

function tick(){
  const elapsed=(Date.now()-startTime)/1000;
  const remain=Math.max(0,duration-elapsed);
  timeDisplay.textContent="00:"+("0"+Math.floor(remain)).slice(-2);
  const perc=(elapsed/duration)*100;
  meterBar.style.width=Math.min(100,perc)+"%";
  if(remain<=0){endSession();}
}

function endSession(){
  clearInterval(timer);
  inputEl.disabled=true;
  saveScore();
}

function updateStats(){
  const words=typedText.trim().split(/\s+/).filter(Boolean).length;
  const elapsed=(Date.now()-startTime)/1000/60 || 1/60;
  const wpm=Math.round(words/elapsed);
  const acc=Math.round(((typedText.length-errors)/Math.max(1,typedText.length))*100);
  wpmEl.textContent=isNaN(wpm)?0:wpm;
  accEl.textContent=isNaN(acc)?'100%':acc+'%';
  charsEl.textContent=typedText.length;
  errsEl.textContent=errors;
}

function updateNextChar(){
  const idx=typedText.length;
  const ch=idx<targetText.length?targetText[idx]:'';
  nextCharEl.textContent=ch===' ' ? '␣ (space)' : (ch||'—');
  fingerHintEl.textContent=ch?getFingerForChar(ch):'—';
  highlightFinger(getFingerId(ch));
}

function handleInput(){
  typedText=inputEl.value;
  const spans=targetEl.querySelectorAll("span");
  spans.forEach((s,i)=>{
    const ch=typedText[i];
    s.className="";
    if(ch==null){} 
    else if(ch===s.textContent){s.classList.add("correct");}
    else{s.classList.add("wrong");errors++;}
    if(i===typedText.length){s.classList.add("next");}
  });
  updateStats();
  updateNextChar();
}

inputEl.addEventListener("input",handleInput);
startBtn.addEventListener("click",startSession);
resetBtn.addEventListener("click",resetSession);
modeSel.addEventListener("change",()=>{customArea.style.display=modeSel.value==="custom"?"block":"none";});
useCustomBtn.addEventListener("click",()=>{
  const txt=customTextEl.value.trim();
  if(txt){setTargetText(txt);}
});

function getSampleText(){
  if(modeSel.value==="words") return "Typing is fun and improves speed";
  if(modeSel.value==="sentences") return "In a digital world, fast typing is valuable.";
  if(modeSel.value==="custom") return customTextEl.value.trim()||"Paste your custom text";
  return "Typing practice improves accuracy.";
}

function getFingerForChar(ch){
  ch=ch.toLowerCase();
  if("qaz".includes(ch)) return "Left Pinky";
  if("wsx".includes(ch)) return "Left Ring Finger";
  if("edc".includes(ch)) return "Left Middle Finger";
  if("rfvtgb".includes(ch)) return "Left Index Finger";
  if("yhnujm".includes(ch)) return "Right Index Finger";
  if("ik,".includes(ch)) return "Right Middle Finger";
  if("ol.".includes(ch)) return "Right Ring Finger";
  if("p;:/".includes(ch)) return "Right Pinky";
  if(ch===" ") return "Thumb (Space bar)";
  return "Any finger";
}
function getFingerId(ch){
  ch=ch.toLowerCase();
  if("qaz".includes(ch)) return "leftPinky";
  if("wsx".includes(ch)) return "leftRing";
  if("edc".includes(ch)) return "leftMiddle";
  if("rfvtgb".includes(ch)) return "leftIndex";
  if("yhnujm".includes(ch)) return "rightIndex";
  if("ik,".includes(ch)) return "rightMiddle";
  if("ol.".includes(ch)) return "rightRing";
  if("p;:/".includes(ch)) return "rightPinky";
  if(ch===" ") return "thumbs";
  return null;
}
function highlightFinger(fingerId){
  document.querySelectorAll("#handDiagram rect").forEach(r=>r.classList.remove("highlight"));
  if(fingerId){document.getElementById(fingerId).classList.add("highlight");}
}

// Leaderboard
function saveScore(){
  const score={wpm:parseInt(wpmEl.textContent),acc:accEl.textContent,time:new Date().toLocaleTimeString()};
  let scores=JSON.parse(localStorage.getItem("scores")||"[]");
  scores.push(score);
  scores.sort((a,b)=>b.wpm-a.wpm);
  scores=scores.slice(0,5);
  localStorage.setItem("scores",JSON.stringify(scores));
  renderScores();
}
function renderScores(){
  let scores=JSON.parse(localStorage.getItem("scores")||"[]");
  leaderTable.innerHTML="";
  scores.forEach((s,i)=>{
    const row=document.createElement("tr");
    row.innerHTML=`<td>${i+1}</td><td>${s.wpm}</td><td>${s.acc}</td><td>${s.time}</td>`;
    leaderTable.appendChild(row);
  });
}
renderScores();
resetSession();