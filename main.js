// --- Theme Logic ---
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') body.classList.add('dark-mode');

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// --- AI Animal Test Logic ---
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/dMLI4npjC/";
let model, labelContainer, maxPredictions;
let isModelLoading = false;

async function initAI() {
  if (model || isModelLoading) return;
  isModelLoading = true;
  try {
    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    labelContainer = document.getElementById("label-container");
    console.log("AI Model loaded successfully.");
  } catch (e) {
    console.error("Model load failed", e);
  } finally {
    isModelLoading = false;
  }
}

async function previewFile() {
  const preview = document.getElementById('preview-image');
  const file = document.getElementById('upload-input').files[0];
  const reader = new FileReader();

  if (!file) return;

  reader.onloadend = async function () {
    preview.src = reader.result;
    preview.style.display = 'block';
    document.getElementById('image-selector').style.display = 'none';
    document.getElementById('loading-msg').style.display = 'block';
    
    preview.onload = async function() {
      if(!model) await initAI();
      await predict();
      document.getElementById('loading-msg').style.display = 'none';
      document.getElementById('action-buttons').style.display = 'block';
    };
  }
  reader.readAsDataURL(file);
}

async function predict() {
  if (!model) return;
  const image = document.getElementById("preview-image");
  const prediction = await model.predict(image);
  
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    // Robust class name matching
    let className = prediction[i].className.toLowerCase();
    let displayName = "알 수 없음";
    
    if (className.includes("dog") || className.includes("강아지")) {
      displayName = "강아지상 🐶";
    } else if (className.includes("cat") || className.includes("고양이")) {
      displayName = "고양이상 🐱";
    } else {
      displayName = prediction[i].className; // Fallback to raw name
    }

    const probability = (prediction[i].probability * 100).toFixed(0);
    
    const labelWrapper = document.createElement("div");
    labelWrapper.innerHTML = `
      <div class="result-label">
        <span>${displayName}</span>
        <span>${probability}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${probability}%"></div>
      </div>
    `;
    labelContainer.appendChild(labelWrapper);
  }
}

// --- Lotto Logic ---
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function pickOneSet() {
  const set = new Set();
  while (set.size < 6) set.add(randInt(1, 45));
  return Array.from(set).sort((a,b) => a-b);
}

function generateFiveSets() {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const numbers = pickOneSet();
    const setDiv = document.createElement("div");
    setDiv.className = "set";
    const label = document.createElement("div");
    label.className = "set-label";
    label.textContent = i + "세트";
    setDiv.appendChild(label);
    numbers.forEach(n => {
      const ball = document.createElement("div");
      ball.className = "ball";
      ball.textContent = n;
      setDiv.appendChild(ball);
    });
    resultDiv.appendChild(setDiv);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const btnGen = document.getElementById("btnGen");
  if (btnGen) {
    btnGen.addEventListener("click", generateFiveSets);
  }
  
  const uploadInput = document.getElementById('upload-input');
  if (uploadInput) {
    uploadInput.addEventListener('change', previewFile);
  }
  
  initAI();
});

// Export functions to window for onclick handlers
window.previewFile = previewFile;
window.initAI = initAI;
