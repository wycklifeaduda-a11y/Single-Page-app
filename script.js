const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    const searchForm = document.getElementById('search-form');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const saveWordBtn = document.getElementById('save-word-btn');
    const clearSavedWordsBtn = document.getElementById('clear-saved-words-btn');

    if (clearSavedWordsBtn) {
        clearSavedWordsBtn.addEventListener('click', clearSavedWords);
    }

    rendersidebarlist(); // Render the sidebar list on page load 
}
if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

if (saveWordBtn) {
    saveWordBtn.addEventListener('click', saveWord);
}

function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('search-input');
    const word = searchInput.value.trim();
    if (word) {
        fetchWordData(word);
    }
}

function fetchWordData(word) {
    const url = `${API_BASE_URL}/api/v2/entries/en/${word}`;
    fetch(url)
        .then(response => response.json())
        .then(data => displayWordData(data))
        .catch(error => console.error('Error fetching word data:', error));
}

function displayWordData(data) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = ''; // Clear previous results

    if (data.title === "No Definitions Found") {
        resultContainer.innerHTML = `<p>No definitions found for the searched word.</p>`;
        return;
    }

    data.forEach(entry => {
        const wordElement = document.createElement('div');
        wordElement.classList.add('word-entry');
        wordElement.innerHTML = `
            <h2>${entry.word}</h2>
            <p><strong>Phonetic:</strong> ${entry.phonetic || 'N/A'}</p>
            <p><strong>Meaning:</strong> ${entry.meanings.map(meaning => meaning.partOfSpeech + ': ' + meaning.definitions.map(def => def.definition).join('; ')).join('<br>')}</p>
        `;
        resultContainer.appendChild(wordElement);
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

function saveWord() {
    const searchInput = document.getElementById('search-input');
    const word = searchInput.value.trim();
    if (word) {
        let savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];
        if (!savedWords.includes(word)) {
            savedWords.push(word);
            localStorage.setItem('savedWords', JSON.stringify(savedWords));
            alert(`Word "${word}" saved successfully!`);
        } else {
            alert(`Word "${word}" is already saved.`);
        }
    }
}
async function fetchWordData(word) {
    const url = `${API_BASE_URL}/api/v2/entries/en/${word}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        displayWordData(data);
    } catch (error) {
        console.error('Error fetching word data:', error);
        const resultContainer = document.getElementById('result-container');
        resultContainer.innerHTML = `<p>Error fetching word data. Please try again later.</p>`;
    }
} 

function handleFetchError(error) {
    console.error('Error fetching word data:', error);
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `<p>Error fetching word data. Please try again later.</p>`;
}

function renderDictionary() {
    const resultContainer = document.getElementById('result-container');
    const savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];
    resultContainer.innerHTML = ''; // Clear previous results

    if (savedWords.length === 0) {
        resultContainer.innerHTML = `<p>No saved words found.</p>`;
        return;
    }

    savedWords.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.classList.add('word-entry');
        wordElement.innerHTML = `<h2>${word}</h2>`;
        resultContainer.appendChild(wordElement);
    });
}   
function defination(word) {
    const url = `${API_BASE_URL}/api/v2/entries/en/${word}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.title === "No Definitions Found") {
                alert(`No definitions found for the word "${word}".`);
                return;
            }
            const definition = data[0].meanings[0].definitions[0].definition;
            alert(`Definition of "${word}": ${definition}`);
        })
        .catch(error => console.error('Error fetching definition:', error));
}
function extractsynonyms(word) {
    const url = `${API_BASE_URL}/api/v2/entries/en/${word}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.title === "No Definitions Found") {
                alert(`No synonyms found for the word "${word}".`);
                return;
            }
            const synonyms = data[0].meanings[0].definitions[0].synonyms;
            if (synonyms && synonyms.length > 0) {
                alert(`Synonyms of "${word}": ${synonyms.join(', ')}`);
            } else {
                alert(`No synonyms found for the word "${word}".`);
            }
        })
        .catch(error => console.error('Error fetching synonyms:', error));
}

function extractantonyms(word) {
    const url = `${API_BASE_URL}/api/v2/entries/en/${word}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.title === "No Definitions Found") {
                alert(`No antonyms found for the word "${word}".`);
                return;
            }
            const antonyms = data[0].meanings[0].definitions[0].antonyms;
            if (antonyms && antonyms.length > 0) {
                alert(`Antonyms of "${word}": ${antonyms.join(', ')}`);
            } else {
                alert(`No antonyms found for the word "${word}".`);
            }
        })
        .catch(error => console.error('Error fetching antonyms:', error));
}

function setupaudio(word) {
    const url = `${API_BASE_URL}/api/v2/entries/en/${word}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.title === "No Definitions Found") {
                alert(`No audio found for the word "${word}".`);
                return;
            }
            const audioUrl = data[0].phonetics[0].audio;
            if (audioUrl) {
                const audioElement = document.createElement('audio');
                audioElement.src = audioUrl;
                audioElement.controls = true;
                document.body.appendChild(audioElement);
            } else {
                alert(`No audio found for the word "${word}".`);
            }
        })
        .catch(error => console.error('Error fetching audio:', error));
}

function rendersidebarlist() {
    const sidebarList = document.getElementById('sidebar-list');
    const savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];
    sidebarList.innerHTML = ''; // Clear previous list
    
    if (savedWords.length === 0) {
        sidebarList.innerHTML = `<li>No saved words found.</li>`;
        return;
    }

    savedWords.forEach(word => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        sidebarList.appendChild(listItem);
    });
}   

function clearSavedWords() {
    localStorage.removeItem('savedWords');
    alert('All saved words have been cleared.');
    rendersidebarlist(); // Update the sidebar list after clearing
}   

