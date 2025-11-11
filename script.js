function highlightCode() {
  const code = document.getElementById("codeInput").value;
  const lang = document.getElementById("languageSelector").value;
  const output = document.getElementById("highlightedCode");
  
  if (!code.trim()) {
    alert('Please enter some code first!');
    return;
  }
  
  output.textContent = code;

  if (lang === "auto") {
    hljs.highlightElement(output);
  } else {
    output.className = lang;
    hljs.highlightBlock(output);
  }
  
  addToHistory(code, lang);
}

function formatCode() {
  const input = document.getElementById("codeInput");
  
  if (!input.value.trim()) {
    alert('Please enter some code first!');
    return;
  }
  
  if (typeof prettier === 'undefined' || typeof prettierPlugins === 'undefined') {
    alert('⚠️ Code formatter is loading... Please try again in a moment.');
    return;
  }
  
  try {
    const formatted = prettier.format(input.value, {
      parser: "babel",
      plugins: prettierPlugins,
    });
    input.value = formatted;
    alert('✅ Code formatted successfully!');
  } catch (err) {
    alert("Formatting Error: " + err.message);
  }
}

function checkSyntax() {
  const code = document.getElementById("codeInput").value;
  const output = document.getElementById("errorOutput");
  
  if (!code.trim()) {
    alert('Please enter some code first!');
    return;
  }
  
  if (typeof esprima === 'undefined') {
    alert('⚠️ Syntax checker is loading... Please try again in a moment.');
    return;
  }
  
  try {
    esprima.parseScript(code);
    output.textContent = "✔ No syntax errors detected.";
    output.style.color = "lime";
    output.style.background = "#282c34";
    output.style.padding = "15px";
    output.style.borderRadius = "10px";
  } catch (err) {
    output.textContent = "✖ Syntax Error: " + err.message;
    output.style.color = "red";
    output.style.background = "#282c34";
    output.style.padding = "15px";
    output.style.borderRadius = "10px";
  }
}

function shareCode() {
  const code = document.getElementById("codeInput").value;
  
  if (!code.trim()) {
    alert('Please enter some code first!');
    return;
  }
  
  const encoded = encodeURIComponent(btoa(code));
  const url = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("✅ Shareable link copied to clipboard!");
  }).catch(() => {
    prompt('Copy this link:', url);
  });
}

function searchCode() {
  const searchTerm = document.getElementById("searchBox").value;
  const code = document.getElementById("highlightedCode").innerText;
  
  if (!searchTerm) {
    highlightCode();
    return;
  }
  
  const regex = new RegExp(`(${searchTerm})`, "gi");
  const highlighted = code.replace(regex, '<mark>$1</mark>');
  document.getElementById("highlightedCode").innerHTML = highlighted;
}

let history = [];

function loadHistory() {
    const saved = localStorage.getItem('codecanvaHistory');
    if (saved) {
        history = JSON.parse(saved);
        updateHistoryUI();
    }
}

function saveHistory() {
    localStorage.setItem('codecanvaHistory', JSON.stringify(history));
}

function addToHistory(code, language) {
    const entry = {
        id: Date.now(),
        code: code,
        language: language === 'auto' ? 'Auto Detect' : language,
        timestamp: new Date().toISOString()
    };
    
    history.unshift(entry);
    
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    saveHistory();
    updateHistoryUI();
}

function updateHistoryUI() {
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">No history yet. Start coding! 🚀</div>';
        return;
    }
    
    historyList.innerHTML = history.map(entry => {
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleString();
        const preview = entry.code.substring(0, 60).replace(/\n/g, ' ');
        
        return `
            <div class="history-item" onclick="loadFromHistory(${entry.id})">
                <div class="history-time">🕒 ${timeStr}</div>
                <div class="history-lang">${entry.language.toUpperCase()}</div>
                <div class="history-preview">${escapeHtml(preview)}${entry.code.length > 60 ? '...' : ''}</div>
            </div>
        `;
    }).join('');
}

function loadFromHistory(id) {
    const entry = history.find(h => h.id === id);
    if (entry) {
        document.getElementById('codeInput').value = entry.code;
        const langSelector = document.getElementById('languageSelector');
        if (entry.language !== 'Auto Detect') {
            langSelector.value = entry.language.toLowerCase();
        } else {
            langSelector.value = 'auto';
        }
        toggleHistory();
        highlightCode();
    }
}

function toggleHistory() {
    const modal = document.getElementById('historyModal');
    modal.classList.toggle('show');
}

function clearAllHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        history = [];
        saveHistory();
        updateHistoryUI();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('historyModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            toggleHistory();
        }
    });
});

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedCode = urlParams.get("code");
  if (sharedCode) {
    const decoded = atob(decodeURIComponent(sharedCode));
    document.getElementById("codeInput").value = decoded;
    highlightCode();
  }
  loadHistory();
};
