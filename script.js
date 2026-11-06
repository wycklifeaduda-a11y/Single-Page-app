const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const SAVED_WORDS_KEY = 'savedWords';
const THEME_KEY = 'wordlyTheme';

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    document.getElementById('search-form').addEventListener('submit', handleSearch);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('save-word-btn').addEventListener('click', saveWord);
    document.getElementById('clear-saved-words-btn').addEventListener('click', clearSavedWords);
    document.getElementById('sidebar-list').addEventListener('click', handleSavedWordClick);

    applyTheme(localStorage.getItem(THEME_KEY) === 'dark');
    renderSavedWords();
}

async function handleSearch(event) {
    event.preventDefault();
    const word = document.getElementById('search-input').value.trim();
    if (!word) return;

    setLoading(true);
    hideError();
    document.getElementById('response-container').classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}${encodeURIComponent(word)}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `No definition found for "${word}".`);
        }
        displayWordData(data);
    } catch (error) {
        showError(error instanceof TypeError
            ? 'Could not connect to the dictionary. Check your internet connection and try again.'
            : error.message || 'Something went wrong. Please try again.');
    } finally {
        setLoading(false);
    }
}

function displayWordData(entries) {
    const entry = entries[0];
    const responseContainer = document.getElementById('response-container');
    const title = document.getElementById('word-title');
    const phonetic = document.getElementById('word-phonetic');
    const meanings = document.getElementById('word-meanings');
    const saveButton = document.getElementById('save-word-btn');

    title.textContent = entry.word;
    phonetic.textContent = entry.phonetic || entry.phonetics?.find(item => item.text)?.text || '';
    meanings.replaceChildren();

    entry.meanings?.forEach(meaning => {
        const section = document.createElement('section');
        section.className = 'meaning';

        const partOfSpeech = document.createElement('h3');
        partOfSpeech.textContent = meaning.partOfSpeech;
        section.appendChild(partOfSpeech);

        const definitionList = document.createElement('ol');
        meaning.definitions?.forEach(item => {
            const definition = document.createElement('li');
            definition.textContent = item.definition;
            if (item.example) {
                const example = document.createElement('p');
                example.className = 'example';
                example.textContent = `“${item.example}”`;
                definition.appendChild(example);
            }
            definitionList.appendChild(definition);
        });
        section.appendChild(definitionList);

        addWordGroup(section, 'Synonyms', uniqueWords([
            ...(meaning.synonyms || []),
            ...(meaning.definitions || []).flatMap(item => item.synonyms || [])
        ]));
        addWordGroup(section, 'Antonyms', uniqueWords([
            ...(meaning.antonyms || []),
            ...(meaning.definitions || []).flatMap(item => item.antonyms || [])
        ]));
        meanings.appendChild(section);
    });

    const audio = document.getElementById('definition-audio');
    const audioUrl = entry.phonetics?.find(item => item.audio)?.audio;
    const audioContainer = document.getElementById('audio-container');
    if (audioUrl) {
        audio.src = audioUrl;
        audioContainer.classList.remove('hidden');
    } else {
        audio.removeAttribute('src');
        audio.load();
        audioContainer.classList.add('hidden');
    }

    saveButton.dataset.word = entry.word;
    updateSaveButton();
    responseContainer.classList.remove('hidden');
}

function addWordGroup(container, label, words) {
    if (!words.length) return;
    const paragraph = document.createElement('p');
    paragraph.className = 'word-group';
    const heading = document.createElement('strong');
    heading.textContent = `${label}: `;
    paragraph.append(heading, document.createTextNode(words.join(', ')));
    container.appendChild(paragraph);
}

function uniqueWords(words) {
    return [...new Set(words.filter(Boolean))];
}

function setLoading(isLoading) {
    document.getElementById('loading-message').classList.toggle('hidden', !isLoading);
    const searchButton = document.getElementById('search-button');
    searchButton.disabled = isLoading;
    searchButton.textContent = isLoading ? 'Searching…' : 'Search';
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}

function getSavedWords() {
    try {
        const words = JSON.parse(localStorage.getItem(SAVED_WORDS_KEY) || '[]');
        return Array.isArray(words) ? words.filter(word => typeof word === 'string') : [];
    } catch {
        return [];
    }
}

function saveWord() {
    const word = document.getElementById('save-word-btn').dataset.word;
    if (!word) return;

    const savedWords = getSavedWords();
    if (!savedWords.some(saved => saved.toLowerCase() === word.toLowerCase())) {
        savedWords.push(word);
        localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(savedWords));
    }
    renderSavedWords();
    updateSaveButton();
}

function updateSaveButton() {
    const button = document.getElementById('save-word-btn');
    const word = button.dataset.word;
    const isSaved = word && getSavedWords().some(saved => saved.toLowerCase() === word.toLowerCase());
    button.textContent = isSaved ? 'Saved' : 'Save word';
    button.disabled = Boolean(isSaved);
}

function renderSavedWords() {
    const list = document.getElementById('sidebar-list');
    const savedWords = getSavedWords();
    list.replaceChildren();

    if (!savedWords.length) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-saved';
        emptyItem.textContent = 'Your saved words will appear here.';
        list.appendChild(emptyItem);
        return;
    }

    savedWords.forEach(word => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'saved-word';
        button.textContent = word;
        button.dataset.word = word;
        item.appendChild(button);
        list.appendChild(item);
    });
}

function handleSavedWordClick(event) {
    const button = event.target.closest('.saved-word');
    if (!button) return;
    document.getElementById('search-input').value = button.dataset.word;
    document.getElementById('search-form').requestSubmit();
}

function clearSavedWords() {
    localStorage.removeItem(SAVED_WORDS_KEY);
    renderSavedWords();
    updateSaveButton();
}

function toggleTheme() {
    applyTheme(!document.body.classList.contains('dark-theme'));
}

function applyTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    const button = document.getElementById('theme-toggle');
    button.textContent = isDark ? 'Use light theme' : 'Use dark theme';
    button.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}
