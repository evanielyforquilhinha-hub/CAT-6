// ================= 全局状态管理 =================
let activeDict = localStorage.getItem('activeDict') || 'cet6'; 
let currentWordsList = [];
let learnedWords = [];
let memoryData = {};
let errorBook = [];

// ✨ 手机静音解锁神器：全局唯一 Audio 实例
const audioPlayer = new Audio();

function loadDictData() {
    const prefix = activeDict + '_';
    learnedWords = JSON.parse(localStorage.getItem(prefix + 'learned')) || [];
    memoryData = JSON.parse(localStorage.getItem(prefix + 'memory')) || {};
    errorBook = JSON.parse(localStorage.getItem(prefix + 'errorbook')) || [];
    
    if (activeDict === 'cet6') {
        currentWordsList = typeof allWords !== 'undefined' ? allWords : [];
        const titleEl = document.getElementById('home-main-title');
        if(titleEl) titleEl.innerText = 'CET-6 Pro';
    } else {
        currentWordsList = typeof gaokaoWords !== 'undefined' ? gaokaoWords : [];
        const titleEl = document.getElementById('home-main-title');
        if(titleEl) titleEl.innerText = '高考冲刺 Pro';
    }
}

function saveDictData() {
    const prefix = activeDict + '_';
    localStorage.setItem(prefix + 'learned', JSON.stringify(learnedWords));
    localStorage.setItem(prefix + 'memory', JSON.stringify(memoryData));
    localStorage.setItem(prefix + 'errorbook', JSON.stringify(errorBook));
}

// 切换器逻辑
document.querySelectorAll('.dict-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        if (this.dataset.dict === activeDict) return; 
        document.querySelectorAll('.dict-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        if(this.dataset.dict === 'gaokao') {
            document.getElementById('dict-slider').classList.add('slide-right');
        } else {
            document.getElementById('dict-slider').classList.remove('slide-right');
        }
        activeDict = this.dataset.dict;
        localStorage.setItem('activeDict', activeDict);
        loadDictData();
        updateDashboard();
    });
});

window.onload = () => { 
    if (activeDict === 'gaokao') {
        const gaokaoTab = document.querySelector('.dict-tab[data-dict="gaokao"]');
        const cetTab = document.querySelector('.dict-tab[data-dict="cet6"]');
        if(gaokaoTab) gaokaoTab.classList.add('active');
        if(cetTab) cetTab.classList.remove('active');
        const slider = document.getElementById('dict-slider');
        if(slider) slider.classList.add('slide-right');
    }
    loadDictData(); 
    updateDashboard(); 
}

// ================= ✨ 核心：防屏蔽发音引擎 =================
function playSound(text, isSentence = false) {
    if (!text) return;
    audioPlayer.pause();
    
    // 使用有道官方接口。因为我们在 HTML 加了隐身代码，这里再也不会被屏蔽了！
    let url = "";
    if (isSentence) {
        url = `https://tts.youdao.com/fanyivoice?word=${encodeURIComponent(text)}&le=eng&keyfrom=speaker-target`;
    } else {
        url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
    }
    
    audioPlayer.src = url;
    audioPlayer.play().catch(e => console.log("等待用户点击解锁音频"));
}

window.speakWord = function(text) { playSound(text, false); };
window.speakSentence = function(text) { playSound(text, true); };

// ================= 界面控制逻辑 =================
let studyQueue = []; let currentWord = null; let hintUsedThisTurn = false; let totalTodayTask = 0;

function updateDashboard() {
    if(!currentWordsList || currentWordsList.length === 0) return;
    const total = currentWordsList.length;
    const learned = learnedWords.length;
    const percent = total === 0 ? 0 : Math.round((learned / total) * 100);
    
    const dashLearned = document.getElementById('dash-learned');
    const dashTotal = document.getElementById('dash-total');
    const dashPercent = document.getElementById('dash-percent');
    const dashRing = document.getElementById('dash-ring-path');
    
    if(dashLearned) dashLearned.innerText = learned;
    if(dashTotal) dashTotal.innerText = total;
    if(dashPercent) dashPercent.textContent = percent + "%";
    
    setTimeout(() => {
        if(dashRing) dashRing.setAttribute('stroke-dasharray', `${percent}, 100`);
    }, 100);
}

async function translateText(sourceId, targetId) {
    const sourceEl = document.getElementById(sourceId);
    const targetEl = document.getElementById(targetId);
    if (!sourceEl || !targetEl) return;
    if (targetEl.style.display === 'block') { targetEl.style.display = 'none'; return; }
    targetEl.style.display = 'block'; targetEl.innerText = "翻译中...";
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(sourceEl.innerText)}`);
        const data = await response.json();
        targetEl.innerHTML = "<span style='color:#5e5ce6; font-weight:800; margin-right:6px;'>译</span>" + data[0].map(item => item[0]).join('');
    } catch (e) { targetEl.innerText = "网络异常"; }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array;
}

const views = { home: document.getElementById('view-home'), learn: document.getElementById('view-learn'), notebook: document.getElementById('view-notebook'), allwords: document.getElementById('view-all-words') };

function switchView(viewName) { 
    Object.values(views).forEach(v => { if(v) v.classList.remove('active'); }); 
    if(views[viewName]) views[viewName].classList.add('active'); 
    audioPlayer.pause(); 
    if(viewName === 'home') updateDashboard(); 
    const bottomBar = document.getElementById('fixed-bottom-bar');
    if(bottomBar) bottomBar.classList.remove('show');
    const viewLearn = document.getElementById('view-learn');
    if(viewLearn) viewLearn.style.paddingBottom = '40px';
}

function generateTodayQueue() {
    const inputNew = document.getElementById('input-new-words');
    const inputReview = document.getElementById('input-review-words');
    const numNew = inputNew ? parseInt(inputNew.value) || 30 : 30;
    const numReview = inputReview ? parseInt(inputReview.value) || 50 : 50;
    
    let reviewCandidates = currentWordsList.filter(w => memoryData[w.id] > 0);
    let selectedReview = shuffleArray(reviewCandidates).slice(0, numReview).map(w => w.id);
    let newCandidates = currentWordsList.filter(w => !learnedWords.includes(w.id) && !(memoryData[w.id] > 0));
    let selectedNew = shuffleArray(newCandidates).slice(0, numNew).map(w => w.id);
    
    studyQueue = shuffleArray([...selectedReview, ...selectedNew]);
    totalTodayTask = studyQueue.length;
    if (totalTodayTask === 0) { alert("当前词库已全部背完或任务量为0！"); return false; }
    return true;
}

function updateUI() {
    const done = totalTodayTask - studyQueue.length;
    const counterText = document.getElementById('queue-counter-text');
    if(counterText) counterText.innerText = `${done} / ${totalTodayTask}`;
    const percentage = totalTodayTask === 0 ? 0 : Math.round((done / totalTodayTask) * 100);
    const progressBar = document.getElementById('progress-bar');
    if(progressBar) progressBar.style.width = `${percentage}%`;
}

function loadNextWord() {
    document.getElementById('fixed-bottom-bar').classList.remove('show');
    document.getElementById('view-learn').style.paddingBottom = '40px';

    if (studyQueue.length === 0) {
        document.getElementById('progress-bar').style.width = '100%';
        document.getElementById('learning-card').innerHTML = `<div class="card-header" style="padding: 80px 20px;"><div style="font-size:1.8rem; font-weight:800; color:#1c1c1e;">今日目标达成</div><button class="btn-primary" onclick="window.location.reload()" style="margin-top:40px; width:80%;">返回主页</button></div>`;
        return;
    }

    const currentId = studyQueue[0]; currentWord = currentWordsList.find(w => w.id === currentId); hintUsedThisTurn = false; 

    document.getElementById('word-display').innerText = currentWord.word;
    document.getElementById('phonetic-display').innerText = currentWord.phonetic;
    document.getElementById('hint-display').innerText = currentWord.hintSentence;
    document.getElementById('detail-pos').innerText = currentWord.pos;
    document.getElementById('detail-meaning-text').innerText = currentWord.meaning;
    document.getElementById('detail-usage').innerText = currentWord.usage;
    document.getElementById('detail-forms').innerText = currentWord.forms;
    const regex = new RegExp(`(${currentWord.word.substring(0,4)}[a-z]*)`, 'gi');
    document.getElementById('detail-cet-text').innerHTML = currentWord.cetSentences.replace(regex, '<span class="highlight">$1</span>');

    document.getElementById('hint-trans').style.display = 'none';
    document.getElementById('cet-trans').style.display = 'none';

    document.getElementById('hint-container').classList.add('invisible'); 
    document.getElementById('hint-container').style.position = 'absolute'; 
    document.getElementById('detail-section').classList.remove('show'); 
    document.getElementById('detail-section').classList.add('hidden');
    document.getElementById('main-buttons').classList.remove('hidden');

    const badge = document.getElementById('memory-level-badge');
    let currentLevel = memoryData[currentId] || 0;
    badge.innerText = currentLevel > 0 ? `复习 Lv.${currentLevel}` : "新词";
    badge.className = `level-${currentLevel}`;
    if (currentLevel === 0 && !learnedWords.includes(currentId)) badge.classList.remove('hidden'); 
    else if (currentLevel > 0) badge.classList.remove('hidden'); 
    else badge.classList.add('hidden');

    const btnStar = document.getElementById('btn-star');
    if (errorBook.includes(currentId)) btnStar.classList.add('starred'); 
    else btnStar.classList.remove('starred');

    updateUI(); 
    speakWord(currentWord.word);
}

// ✨ 解锁苹果手机静音限制：在点击"开始学习"的一瞬间，强行激活音频
document.getElementById('btn-start-learning')?.addEventListener('click', () => { 
    audioPlayer.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    audioPlayer.play().then(() => {
        if (generateTodayQueue()) { switchView('learn'); loadNextWord(); } 
    }).catch(()=>{
        if (generateTodayQueue()) { switchView('learn'); loadNextWord(); } 
    });
});

document.getElementById('btn-hint')?.addEventListener('click', () => { 
    hintUsedThisTurn = true; 
    document.getElementById('hint-container').classList.remove('invisible'); 
    document.getElementById('hint-container').style.position = 'relative'; 
    speakSentence(currentWord.hintSentence); 
});

document.getElementById('btn-star')?.addEventListener('click', function() {
    const currentId = currentWord.id;
    if (errorBook.includes(currentId)) { 
        errorBook = errorBook.filter(id => id !== currentId); 
        this.classList.remove('starred'); 
    } else { 
        errorBook.push(currentId); 
        this.classList.add('starred'); 
    }
    saveDictData();
});

function handleAnswer(action) {
    const currentId = currentWord.id; let oldLevel = memoryData[currentId] || 0; let newLevel = 0;
    if (action === 'known') {
        if (hintUsedThisTurn) newLevel = 1; else newLevel = Math.max(0, oldLevel - 1);
        if (newLevel === 0 && !learnedWords.includes(currentId)) { learnedWords.push(currentId); }
    } else if (action === 'unknown') {
        newLevel = 2; 
        if (!errorBook.includes(currentId)) { 
            errorBook.push(currentId); 
            document.getElementById('btn-star').classList.add('starred'); 
        }
    }
    memoryData[currentId] = newLevel; 
    saveDictData();

    studyQueue.shift(); 
    if (newLevel === 2) studyQueue.splice(Math.min(3, studyQueue.length), 0, currentId);
    else if (newLevel === 1) studyQueue.splice(Math.min(7, studyQueue.length), 0, currentId);

    document.getElementById('hint-container').classList.remove('invisible'); 
    document.getElementById('hint-container').style.position = 'relative';
    document.getElementById('main-buttons').classList.add('hidden');
    
    document.getElementById('detail-section').classList.remove('hidden'); 
    void document.getElementById('detail-section').offsetWidth; 
    document.getElementById('detail-section').classList.add('show'); 
    
    document.getElementById('fixed-bottom-bar').classList.add('show');
    document.getElementById('view-learn').style.paddingBottom = '110px';
    
    speakWord(currentWord.word); 
}

document.getElementById('btn-known')?.addEventListener('click', () => handleAnswer('known'));
document.getElementById('btn-unknown')?.addEventListener('click', () => handleAnswer('unknown'));
document.getElementById('btn-next')?.addEventListener('click', () => { loadNextWord(); });
document.getElementById('btn-speak-word')?.addEventListener('click', () => speakWord(currentWord.word));
document.getElementById('word-display')?.addEventListener('click', () => speakWord(currentWord.word));
document.getElementById('btn-speak-hint')?.addEventListener('click', () => speakSentence(currentWord.hintSentence));
document.getElementById('btn-speak-cet')?.addEventListener('click', () => speakSentence(currentWord.cetSentences));
document.getElementById('btn-back-home')?.addEventListener('click', () => switchView('home'));

// ======== 解决多处挂载 ========
window.translateText = translateText;