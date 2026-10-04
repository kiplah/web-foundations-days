const noteText = document.getElementById('note-text');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');

function updateCounts() {
    const text = noteText.value;
    const chars = text.length;
    const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
    
    charCount.textContent = `${chars} / 200 characters`;
    
    let wordText = words === 1 ? "word" : "words";
    wordCount.textContent = `${words} ${wordText}`;
    
    charCount.classList.remove('warning', 'over');
    if (chars > 200) {
        charCount.classList.add('over');
    } else if (chars > 180) {
        charCount.classList.add('warning');
    }
}

function updateThemeLabel() {
    if (document.body.classList.contains('dark')) {
        themeToggle.textContent = 'Light mode';
    } else {
        themeToggle.textContent = 'Dark mode';
    }
}

function clearEverything() {
    noteText.value = '';
    updateCounts();
    localStorage.removeItem('draftNote');
}

// Event Listeners
noteText.addEventListener('input', () => {
    updateCounts();
    localStorage.setItem('draftNote', noteText.value);
});

noteText.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        clearEverything();
    }
});

clearBtn.addEventListener('click', clearEverything);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    updateThemeLabel();
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkTheme', isDark);
});

// Initialization
function init() {
    const savedNote = localStorage.getItem('draftNote');
    if (savedNote !== null) {
        noteText.value = savedNote;
    }
    
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
        document.body.classList.add('dark');
    }
    
    updateThemeLabel();
    updateCounts();
}

init();
