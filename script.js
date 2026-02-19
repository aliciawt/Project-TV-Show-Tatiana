const API_URL = "https://api.tvmaze.com/shows";

const rootElem = document.getElementById("root");
const searchInput = document.getElementById("search-input");
const episodeSelect = document.getElementById("episode-select");
const count = document.getElementById("display-count");
const showSelect = document.getElementById("show-select");

let allShows = [];
let allEpisodes = [];
let episodeCache = {};

async function setup() {
  rootElem.innerHTML = "<div class='status-message'>Loading shows...</div>";

  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Could not fetch shows (Status: ${response.status})`);
    }

    allShows = await response.json();

    populateShowSelect(allShows);

    rootElem.innerHTML = "<div class='status-message'>Please select a show.</div>";
    
  } catch (error) {
    renderError(error.message);
  }

  attachSearchListener();
}

function populateShowSelect(shows) {
  showSelect.innerHTML = '<option value="">Select a show</option>';

  const sorted = [...shows].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  sorted.forEach(show => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  showSelect.addEventListener("change", handleShowChange);

}

async function handleShowChange(e) {
  const showId = e.target.value;

  if (!showId) return;

  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    renderEpisodes(allEpisodes);
    populateEpisodeSelect(allEpisodes);
    return;
  }

  rootElem.innerHTML = "<div class='status-message'>Loading episodes...</div>";

  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);

    if (!response.ok) {
      throw new Error(`Could not fetch episodes (Status: ${response.status})`);
    }

    const episodes = await response.json();

    episodeCache[showId] = episodes;

    allEpisodes = episodes;

    renderEpisodes(allEpisodes);
    populateEpisodeSelect(allEpisodes);

  } catch (error) {
    renderError(error.message);
  }
}



function attachSearchListener() {
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();

    const filtered = allEpisodes.filter(ep =>
      ep.name.toLowerCase().includes(term) ||
      ep.summary.toLowerCase().includes(term)
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
  rootElem.innerHTML = "";
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
    rootElem.appendChild(card);
  });
}

function populateEpisodeSelect(list) {
  episodeSelect.innerHTML = '<option value="all">Show all episodes</option>';
  
  list.forEach(ep => {
    const opt = document.createElement("option");
    opt.value = ep.id;
    opt.textContent = `${getEpisodeCode(ep)} - ${ep.name}`;
    episodeSelect.appendChild(opt);
  });

  episodeSelect.onchange = (e) => {
    const id = e.target.value;
    const filtered = id === "all" ? allEpisodes : allEpisodes.filter(ep => ep.id == id);
    renderEpisodes(filtered);
  };
}

function renderError(msg) {
  rootElem.innerHTML = `
    <div class="error-box">
      <p>Error loading episodes: ${msg}</p>
      <button onclick="location.reload()">Retry</button>
    </div>
  `;
}

window.onload = setup;