const teamAName = document.getElementById('teamAName');
const teamBName = document.getElementById('teamBName');
const scoreA = document.getElementById('scoreA');
const scoreB = document.getElementById('scoreB');
const organizerLogo = document.getElementById('organizerLogo');
const sponsorImages = document.querySelectorAll('.sponsor-img');
const scoreboard = document.getElementById('scoreboard');

const modal = document.getElementById('modal');
const settingsBtn = document.getElementById('settingsBtn');
const closeModal = document.getElementById('closeModal');
const saveSettings = document.getElementById('saveSettings');
const resetScore = document.getElementById('resetScore');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const inputTeamA = document.getElementById('inputTeamA');
const inputTeamB = document.getElementById('inputTeamB');
const inputScoreA = document.getElementById('inputScoreA');
const inputScoreB = document.getElementById('inputScoreB');
const inputMaxScore = document.getElementById('inputMaxScore');
const resolutionSelect = document.getElementById('resolutionSelect');
const organizerInput = document.getElementById('organizerInput');
const sponsorInput = document.getElementById('sponsorInput');

let maxScore = 99;
let holdTimer = null;
let longPressed = false;

function formatTeamName(name) {
  const cleanName = name.trim() || 'TEAM';
  const parts = cleanName.split(' ');
  if (parts.length > 1) {
    return `${parts[0]}<br>${parts.slice(1).join(' ')}`;
  }
  return cleanName;
}

function clampScore(value) {
  return Math.max(0, Math.min(maxScore, Number(value) || 0));
}

function setScore(element, value) {
  element.textContent = clampScore(value);
}

function addScore(element) {
  setScore(element, Number(element.textContent) + 1);
}

function subtractScore(element) {
  setScore(element, Number(element.textContent) - 1);
}

function setupScoreButton(element) {
  element.addEventListener('mousedown', () => startHold(element));
  element.addEventListener('touchstart', (event) => {
    event.preventDefault();
    startHold(element);
  });

  element.addEventListener('mouseup', () => endHold(element));
  element.addEventListener('mouseleave', cancelHold);
  element.addEventListener('touchend', () => endHold(element));
  element.addEventListener('touchcancel', cancelHold);
}

function startHold(element) {
  longPressed = false;
  clearTimeout(holdTimer);
  holdTimer = setTimeout(() => {
    subtractScore(element);
    longPressed = true;
  }, 3000);
}

function endHold(element) {
  clearTimeout(holdTimer);
  if (!longPressed) {
    addScore(element);
  }
}

function cancelHold() {
  clearTimeout(holdTimer);
}

function openModal() {
  inputTeamA.value = teamAName.innerText.replace('\n', ' ');
  inputTeamB.value = teamBName.innerText.replace('\n', ' ');
  inputScoreA.value = scoreA.textContent;
  inputScoreB.value = scoreB.textContent;
  inputMaxScore.value = maxScore;
  modal.classList.remove('hidden');
}

function closeSettingModal() {
  modal.classList.add('hidden');
}

function readImageFile(input, callback) {
  const file = input.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

function applyResolution(value) {
  if (value === 'fullscreen') {
    scoreboard.style.width = '100vw';
    scoreboard.style.height = '100vh';
    scoreboard.style.transform = 'none';
    return;
  }

  const [width, height] = value.split('x').map(Number);
  const scale = Math.min(window.innerWidth / width, window.innerHeight / height);

  scoreboard.style.width = `${width}px`;
  scoreboard.style.height = `${height}px`;
  scoreboard.style.transformOrigin = 'top left';
  scoreboard.style.transform = `scale(${scale})`;
}

function saveToStorage() {
  const data = {
    teamA: teamAName.innerHTML,
    teamB: teamBName.innerHTML,
    scoreA: scoreA.textContent,
    scoreB: scoreB.textContent,
    maxScore,
    organizerLogo: organizerLogo.src,
    sponsorLogo: sponsorImages[0].src,
    resolution: resolutionSelect.value
  };
  localStorage.setItem('scoreboardData', JSON.stringify(data));
}

function loadFromStorage() {
  const saved = localStorage.getItem('scoreboardData');
  if (!saved) return;

  const data = JSON.parse(saved);
  teamAName.innerHTML = data.teamA || 'BNI<br>JAKARTA';
  teamBName.innerHTML = data.teamB || 'BNI<br>Surabaya';
  maxScore = Number(data.maxScore) || 99;
  setScore(scoreA, data.scoreA || 20);
  setScore(scoreB, data.scoreB || 20);

  if (data.organizerLogo) organizerLogo.src = data.organizerLogo;
  if (data.sponsorLogo) sponsorImages.forEach(img => img.src = data.sponsorLogo);
  if (data.resolution) resolutionSelect.value = data.resolution;
  applyResolution(resolutionSelect.value);
}

settingsBtn.addEventListener('click', openModal);
closeModal.addEventListener('click', closeSettingModal);

saveSettings.addEventListener('click', () => {
  maxScore = Math.max(1, Number(inputMaxScore.value) || 99);
  teamAName.innerHTML = formatTeamName(inputTeamA.value);
  teamBName.innerHTML = formatTeamName(inputTeamB.value);
  setScore(scoreA, inputScoreA.value);
  setScore(scoreB, inputScoreB.value);
  applyResolution(resolutionSelect.value);

  readImageFile(organizerInput, (imageUrl) => {
    organizerLogo.src = imageUrl;
    saveToStorage();
  });

  readImageFile(sponsorInput, (imageUrl) => {
    sponsorImages.forEach(img => img.src = imageUrl);
    saveToStorage();
  });

  saveToStorage();
  closeSettingModal();
});

resetScore.addEventListener('click', () => {
  setScore(scoreA, 0);
  setScore(scoreB, 0);
  saveToStorage();
});

fullscreenBtn.addEventListener('click', () => {
  document.documentElement.requestFullscreen?.();
});

window.addEventListener('resize', () => applyResolution(resolutionSelect.value));

setupScoreButton(scoreA);
setupScoreButton(scoreB);
loadFromStorage();
