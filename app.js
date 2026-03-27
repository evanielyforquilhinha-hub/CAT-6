// ================= 双引擎全局状态管理 =================
let activeDict = localStorage.getItem('activeDict') || 'cet6'; 
let currentWordsList = [];
let learnedWords = [];
let memoryData = {};
let errorBook = [];

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

// ================= ✨ 核心：终极发音引擎 =================
const audioPlayer = new Audio();

function safeStopSpeech() { 
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}

function speakWord(text) { 
    if(!text) return;
    safeStopSpeech();
    // 单词发音：有道词典标准美音
    audioPlayer.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
    audioPlayer.play().catch(e => console.log("播放失败", e));
}

function speakSentence(text) { 
    if(!text) return;
    safeStopSpeech();
    // 句子发音：有道翻译【长句专用】底层接口，无视跨域，国内秒开！
    audioPlayer.src = `https://tts.youdao.com/fanyivoice?word=${encodeURIComponent(text)}&le=eng&keyfrom=speaker-target`;
    audioPlayer.play().catch(e => console.log("播放失败", e));
}
// =================================================================

function speakWord(text) { playNativeSound(text); }
function speakSentence(text) { playNativeSound(text); }

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
    const textToTranslate = sourceEl.innerText;
    targetEl.style.display = 'block'; targetEl.innerText = "正在呼叫 AI 翻译...";
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(textToTranslate)}`);
        const data = await response.json();
        const translatedText = data[0].map(item => item[0]).join('');
        targetEl.innerHTML = "<span style='color:#5e5ce6; font-weight:800; margin-right:6px;'>译</span>" + translatedText;
    } catch (error) { targetEl.innerText = "翻译失败，请检查网络。"; }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array;
}

const views = { 
    home: document.getElementById('view-home'), 
    learn: document.getElementById('view-learn'), 
    notebook: document.getElementById('view-notebook'), 
    allwords: document.getElementById('view-all-words') 
};

function switchView(viewName) { 
    Object.values(views).forEach(v => { if(v) v.classList.remove('active'); }); 
    if(views[viewName]) views[viewName].classList.add('active'); 
    safeStopSpeech(); 
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
    const bottomBar = document.getElementById('fixed-bottom-bar');
    if(bottomBar) bottomBar.classList.remove('show');
    const viewLearn = document.getElementById('view-learn');
    if(viewLearn) viewLearn.style.paddingBottom = '40px';

    if (studyQueue.length === 0) {
        const progressBar = document.getElementById('progress-bar');
        if(progressBar) progressBar.style.width = '100%';
        const learningCard = document.getElementById('learning-card');
        if(learningCard) {
            learningCard.innerHTML = `<div class="card-header" style="padding: 80px 20px;"><div style="color:#34c759; margin-bottom:20px;"><svg class="sf-icon" style="width:5rem;height:5rem;" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div><div style="font-size:1.8rem; font-weight:800; color:#1c1c1e;">今日目标达成</div><div style="color:#8e8e93; margin-top:10px; font-weight:500; font-size:1.05rem;">记忆神经已重塑完毕！</div><button class="btn-primary" onclick="window.location.reload()" style="margin-top:40px; width:80%;">返回主页</button></div>`;
        }
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

    const hintTrans = document.getElementById('hint-trans');
    if(hintTrans) hintTrans.style.display = 'none';
    const cetTrans = document.getElementById('cet-trans');
    if(cetTrans) cetTrans.style.display = 'none';

    const hintContainer = document.getElementById('hint-container');
    if(hintContainer) {
        hintContainer.classList.add('invisible'); 
        hintContainer.style.position = 'absolute'; 
    }
    
    const detailSec = document.getElementById('detail-section'); 
    if(detailSec) {
        detailSec.classList.remove('show'); 
        detailSec.classList.add('hidden');
    }
    
    const mainBtns = document.getElementById('main-buttons');
    if(mainBtns) mainBtns.classList.remove('hidden');

    const badge = document.getElementById('memory-level-badge');
    if(badge) {
        let currentLevel = memoryData[currentId] || 0;
        badge.innerText = currentLevel > 0 ? `复习 Lv.${currentLevel}` : "新词";
        badge.className = `level-${currentLevel}`;
        if (currentLevel === 0 && !learnedWords.includes(currentId)) badge.classList.remove('hidden'); 
        else if (currentLevel > 0) badge.classList.remove('hidden'); 
        else badge.classList.add('hidden');
    }

    const btnStar = document.getElementById('btn-star');
    if(btnStar) {
        if (errorBook.includes(currentId)) btnStar.classList.add('starred'); 
        else btnStar.classList.remove('starred');
    }

    updateUI(); 
    speakWord(currentWord.word);
}

// 绑定按钮事件
document.getElementById('btn-learn-notebook')?.addEventListener('click', () => {
    if (errorBook.length === 0) return;
    studyQueue = shuffleArray([...errorBook]); totalTodayTask = studyQueue.length;
    switchView('learn'); loadNextWord();
});

document.getElementById('btn-start-learning')?.addEventListener('click', () => { 
    // 解锁手机语音限制
    if ('speechSynthesis' in window) {
        let msg = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(msg);
    }
    if (generateTodayQueue()) { switchView('learn'); loadNextWord(); } 
});

document.getElementById('btn-go-notebook')?.addEventListener('click', () => { renderNotebook(); switchView('notebook'); });
document.getElementById('btn-go-allwords')?.addEventListener('click', () => { 
    const title = document.getElementById('overview-title');
    if(title) title.innerText = activeDict === 'cet6' ? '六级词库全景' : '高考词库全景';
    renderAllWords(); switchView('allwords'); 
});
document.getElementById('btn-back-home')?.addEventListener('click', () => switchView('home'));

document.getElementById('btn-hint')?.addEventListener('click', () => { 
    hintUsedThisTurn = true; 
    const hc = document.getElementById('hint-container'); 
    if(hc) {
        hc.classList.remove('invisible'); 
        hc.style.position = 'relative'; 
    }
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
            const btnStar = document.getElementById('btn-star');
            if(btnStar) btnStar.classList.add('starred'); 
        }
    }
    memoryData[currentId] = newLevel; 
    saveDictData();

    studyQueue.shift(); 
    if (newLevel === 2) studyQueue.splice(Math.min(3, studyQueue.length), 0, currentId);
    else if (newLevel === 1) studyQueue.splice(Math.min(7, studyQueue.length), 0, currentId);

    const hc = document.getElementById('hint-container'); 
    if(hc) {
        hc.classList.remove('invisible'); 
        hc.style.position = 'relative';
    }
    const mainBtns = document.getElementById('main-buttons');
    if(mainBtns) mainBtns.classList.add('hidden');
    
    const detailSec = document.getElementById('detail-section'); 
    if(detailSec) {
        detailSec.classList.remove('hidden'); 
        void detailSec.offsetWidth; 
        detailSec.classList.add('show'); 
    }
    
    const bottomBar = document.getElementById('fixed-bottom-bar');
    if(bottomBar) bottomBar.classList.add('show');
    const viewLearn = document.getElementById('view-learn');
    if(viewLearn) viewLearn.style.paddingBottom = '110px';
    
    safeStopSpeech(); speakWord(currentWord.word); 
}

document.getElementById('btn-known')?.addEventListener('click', () => handleAnswer('known'));
document.getElementById('btn-unknown')?.addEventListener('click', () => handleAnswer('unknown'));
document.getElementById('btn-next')?.addEventListener('click', () => { safeStopSpeech(); loadNextWord(); });

document.getElementById('btn-speak-word')?.addEventListener('click', () => speakWord(currentWord.word));
document.getElementById('word-display')?.addEventListener('click', () => speakWord(currentWord.word));
document.getElementById('btn-speak-hint')?.addEventListener('click', () => speakSentence(currentWord.hintSentence));
document.getElementById('btn-speak-cet')?.addEventListener('click', () => speakSentence(currentWord.cetSentences));

function generateListHtml(wordsArr, isHideMode, isLearnedStatus) {
    let htmlStr = '';
    const statusClass = isLearnedStatus ? 'status-learned' : 'status-unlearned';
    const statusText = isLearnedStatus ? '已学' : '未学';
    
    wordsArr.forEach(w => {
        const meaningState = isHideMode ? 'hidden-meaning' : 'hidden-meaning revealed';
        htmlStr += `
            <div class="list-item">
                <div style="flex:1;">
                    <div class="list-word-row">
                        <span class="list-word-text">${w.word}</span>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <button class="btn-icon-top" style="padding:6px; color:#5e5ce6;" onclick="speakWord('${w.word}')">
                            <svg class="sf-icon" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                        </button>
                    </div>
                    <div class="list-meaning ${meaningState}" onclick="this.classList.toggle('revealed')">
                        <span class="mask-text">
                            <svg class="sf-icon" style="width:1.1rem;height:1.1rem;" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path></svg>
                            轻触揭开
                        </span>
                        <span class="real-text">${w.pos} ${w.meaning}</span>
                    </div>
                </div>
            </div>
        `;
    });
    return htmlStr;
}

function renderNotebook() {
    const container = document.getElementById('notebook-list-container'); 
    const emptyTip = document.getElementById('notebook-empty'); 
    const actionDiv = document.getElementById('notebook-actions');
    if(!container) return;
    
    container.innerHTML = '';
    if (errorBook.length === 0) { 
        if(emptyTip) emptyTip.style.display = 'block'; 
        if(actionDiv) actionDiv.style.display = 'none'; 
        return; 
    }
    if(emptyTip) emptyTip.style.display = 'none'; 
    if(actionDiv) actionDiv.style.display = 'block';

    const errorWords = currentWordsList.filter(w => errorBook.includes(w.id));
    errorWords.forEach(w => {
        const div = document.createElement('div'); div.className = 'list-item';
        div.innerHTML = `
            <div style="flex:1;">
                <div class="list-word-row">
                    <span class="list-word-text">${w.word}</span>
                    <button class="btn-icon-top" style="padding:6px; color:#5e5ce6;" onclick="speakWord('${w.word}')">
                        <svg class="sf-icon" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    </button>
                </div>
                <div class="list-meaning hidden-meaning" onclick="this.classList.toggle('revealed')">
                    <span class="mask-text">
                        <svg class="sf-icon" style="width:1.1rem;height:1.1rem;" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path></svg>
                        轻触揭开
                    </span>
                    <span class="real-text">${w.pos} ${w.meaning}</span>
                </div>
            </div>
            <button class="btn-remove-nb" onclick="removeFromNotebook(${w.id})"><svg class="sf-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        `;
        container.appendChild(div);
    });
}

function renderAllWords() {
    const container = document.getElementById('all-words-list-container');
    if(!container) return;
    
    const toggle = document.getElementById('toggle-hide-meanings');
    const isHideMode = toggle ? toggle.checked : false;
    
    let learnedArr = []; let unlearnedArr = [];
    currentWordsList.forEach(w => { if (learnedWords.includes(w.id)) { learnedArr.push(w); } else { unlearnedArr.push(w); } });

    let finalHtml = '';
    if (unlearnedArr.length > 0) {
        finalHtml += `<div class="list-section-title">待学词汇 (${unlearnedArr.length})</div>`;
        finalHtml += generateListHtml(unlearnedArr, isHideMode, false);
    }
    if (learnedArr.length > 0) {
        finalHtml += `<div class="list-section-title" style="margin-top: 15px;">已掌握 (${learnedArr.length})</div>`;
        finalHtml += generateListHtml(learnedArr, isHideMode, true);
    }
    container.innerHTML = finalHtml;
}

document.getElementById('toggle-hide-meanings')?.addEventListener('change', function() {
    const isHideMode = this.checked;
    const meanings = document.querySelectorAll('#all-words-list-container .list-meaning');
    meanings.forEach(m => {
        if (isHideMode) { m.classList.remove('revealed'); } 
        else { m.classList.add('revealed'); }
    });
});

// 挂载到全局，供 HTML 里绑定的 onclick 使用
window.speakWord = speakWord;
window.speakSentence = speakSentence;
window.removeFromNotebook = function(id) { 
    errorBook = errorBook.filter(wId => wId !== id); 
    saveDictData(); 
    renderNotebook(); 
};