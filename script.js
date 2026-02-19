const API_URL = "https://api.tvmaze.com/shows/82/episodes";

const rootElem = document.getElementById("root");
const searchInput = document.getElementById("search-input");
const select = document.getElementById("episode-select");
const count = document.getElementById("display-count");

let allEpisodes = [];

async function setup() {
  // Показываем сообщение о загрузке
  rootElem.innerHTML = "<div class='status-message'>Loading episodes...</div>";

  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Could not fetch data (Status: ${response.status})`);
    }

    allEpisodes = await response.json();

    // Инициализация после успешной загрузки
    initApp();
    
  } catch (error) {
    // Отображение ошибки пользователю
    renderError(error.message);
  }
}

function initApp() {
  renderEpisodes(allEpisodes);
  populateSelect(allEpisodes);
  
  // Живой поиск
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allEpisodes.filter(ep => 
      ep.name.toLowerCase().includes(term) || ep.summary.toLowerCase().includes(term)
    );
    renderEpisodes(filtered);
  });
}

function getEpisodeCode(ep) {
  const s = String(ep.season).padStart(2, '0');
  const e = String(ep.number).padStart(2, '0');
  return `S${s}E${e}`;
}

function renderEpisodes(list) {
  const root = document.getElementById("root");
  
  root.innerHTML = "";
  count.innerText = `Displaying ${list.length}/${allEpisodes.length} episodes`;

  list.forEach(ep => {
    const card = document.createElement("section");
    card.className = "episode-card";
    card.innerHTML = `
      <div class="card-header">
        <h2>${ep.name} - ${getEpisodeCode(ep)}</h2>
      </div>
      <img src="${ep.image ? ep.image.medium : ''}" alt="${ep.name}">
      <div class="summary">${ep.summary}</div>
      <a href="${ep.url}" target="_blank" class="link">View on TVMaze</a>
    `;
    root.appendChild(card);
  });
}

function populateSelect(list) {
  list.forEach(ep => {
    const opt = document.createElement("option");
    opt.value = ep.id;
    opt.textContent = `${getEpisodeCode(ep)} - ${ep.name}`;
    select.appendChild(opt);
  });

  select.onchange = (e) => {
    const id = e.target.value;
    const filtered = id === "all" ? allEpisodes : allEpisodes.filter(ep => ep.id == id);
    renderEpisodes(filtered);
  };
}

function renderError(msg) {
  document.getElementById("root").innerHTML = `
    <div class="error-box">
      <p>Error loading episodes: ${msg}</p>
      <button onclick="location.reload()">Retry</button>
    </div>
  `;
}

window.onload = setup;