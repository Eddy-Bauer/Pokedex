const dialogRef = document.querySelector('[data-id="dialog"]');
const galleryRef = document.getElementById("gallery");

let allPokemon = [];
let visiblePokemon = [];
let currentIndex = 0;
let offset = 0;
let isLoading = false;
let activeTab = "main";

const INITIAL_LIMIT = 10;
const LOAD_MORE_LIMIT = 20;
let limit = INITIAL_LIMIT;

const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function fetchPokemonList(offset, limit) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
  );
  const data = await response.json();
  return data.results; // [{ name, url }, ...]
}

async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  return await response.json();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }
  return response.json();
}

async function fetchPokemonDetails(url) {
  return fetchJson(url);
}

async function fetchPokemonList(offset, limit) {
  const data = await fetchJson(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
  return data.results;
}


async function loadPokemons() {
  setLoading(true);
  try {
    const list = await fetchPokemonList(offset, limit);
    const details = await Promise.all(
      list.map((entry) => fetchPokemonDetails(entry.url)),
    );
    allPokemon.push(...details);
    offset += limit;
    limit = LOAD_MORE_LIMIT;
    visiblePokemon = allPokemon;
    renderCards(visiblePokemon);

  } catch (error) {
    console.error("Fehler beim Laden der Pokémon:", error);
  } finally {
    setLoading(false);
  }
}

//--------------------------------------------------------------------------

function renderCards(pokemonArray) {
  galleryRef.innerHTML = "";
  pokemonArray.forEach((pokemon, index) => {
    galleryRef.innerHTML += getCardHtml(pokemon, index);
  });
}

function getCardHtml(pokemon, index) {
  const mainType = pokemon.types[0].type.name;
  const color = typeColors[mainType] || "#A8A878";
  const imageUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;

  return `
    <button class="card" data-id="card" onclick="openDialog(${index})">
      <div class="card-header">
        <span class="card-id">#${pokemon.id}</span>
        <span class="card-name">${capitalize(pokemon.name)}</span>
      </div>
      <div class="card-image-wrapper" style="background-color:${color}">
        <img class="card-image" data-id="card-image" src="${imageUrl}" alt="${pokemon.name}">
      </div>
      <div class="card-footer">
        ${getTypeBadges(pokemon.types)}
      </div>
    </button>
  `;
}

const typeIcons = {
  normal: "⚪", fire: "🔥", water: "💧", electric: "⚡",
  grass: "🍃", ice: "❄️", fighting: "🥊", poison: "☠️",
  ground: "🌎", flying: "🕊️", psychic: "🔮", bug: "🐛",
  rock: "🪨", ghost: "👻", dragon: "🐉", dark: "🌑",
  steel: "⚙️", fairy: "✨",
};

function getTypeBadges(types) {
  return types
    .map((t) => {
      const typeName = t.type.name;
      const color = typeColors[typeName] || "#777";
      const icon = typeIcons[typeName] || "";
      return `<span class="type-badge" style="background-color:${color}">${icon}</span>`;
    })
    .join("");
}

//------------------------------------------------------------------------

function setLoading(loading) {
  isLoading = loading;
  const button = document.querySelector('[data-id="load-more-button"]');
  button.disabled = loading;

  let spinner = document.querySelector(".loading-spinner");
  if (loading && !spinner) {
    spinner = document.createElement("img");
    spinner.className = "loading-spinner";
    spinner.src = "./assets/img/loading.gif"
    galleryRef.after(spinner);
  } else if (!loading && spinner) {
    spinner.remove();
  }
}

async function loadMore() {
  if (isLoading) return;
  setLoading(true);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await loadPokemons();
}
//---------------------------------------------------------------------

function toggleSearchHint(show) {
  const hint = document.querySelector(".search-hint");
  hint.classList.toggle("error", show);
}

function searchPokemon() {
  const query = document
    .querySelector('[data-id="search-input"]')
    .value.trim()
    .toLowerCase();

  if (query.length > 0 && query.length < 3){
    toggleSearchHint(true);
    return;
  }

  toggleSearchHint(false);

  visiblePokemon = query
    ? allPokemon.filter((p) => p.name.includes(query))
    : allPokemon;

  renderCards(visiblePokemon);
  toggleNotFound(visiblePokemon.length === 0);
}

document.querySelector('[data-id="search-input"]').addEventListener("input", (e) => {
  const query = e.target.value.trim();
  if (query.length === 0 || query.length >= 3) {
    toggleSearchHint(false);
  }
});

document.querySelector('[data-id="search-input"]').addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchPokemon();
});

function toggleNotFound(show) {
  let message = document.querySelector('[data-id="not-found"]');
  if (show && !message) {
    message = document.createElement("p");
    message.setAttribute("data-id", "not-found");
    message.className = "not-found-text";
    message.textContent = "Kein Pokémon gefunden.";
    galleryRef.after(message);
  } else if (!show && message) {
    message.remove();
  }
}

//--------------------------------------------------------------------------


function renderDialogContent(pokemon) {
  const mainType = pokemon.types[0].type.name;
  const color = typeColors[mainType] || "#A8A878";
  const imageUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;

  document.getElementById("dialogId").textContent = `#${pokemon.id}`;
  document.getElementById("dialogTitle").textContent = capitalize(pokemon.name);
  document.getElementById("dialogImageWrapper").style.backgroundColor = color;
  document.querySelector('[data-id="dialog-image"]').src = imageUrl;
  document.getElementById("img-counter").textContent = `${currentIndex + 1}/${visiblePokemon.length}`;
  document.getElementById("dialogTypes").innerHTML = getTypeBadges(pokemon.types);

  renderTabButtons();
  renderTabContent(pokemon);
}

function switchTab(tabName) {
  activeTab = tabName;
  renderTabButtons();
  renderTabContent(visiblePokemon[currentIndex]);
}

function renderTabButtons() {
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === activeTab);
  });
}

function renderTabContent(pokemon) {
  const container = document.getElementById("dialogTabContent");

  if (activeTab === "main") {
    container.innerHTML = getMainTabHtml(pokemon);
  } else if (activeTab === "stats") {
    container.innerHTML = getStatsTabHtml(pokemon);
  } else if (activeTab === "evo-chain") {
    container.innerHTML = pokemon.evolutionChain
      ? getEvoChainHtml(pokemon.evolutionChain)
      : "<p>Lade Evolutionskette...</p>";
  }
}

function getStat(pokemon, statName) {
  return pokemon.stats.find((s) => s.stat.name === statName).base_stat;
}

function getMainTabHtml(pokemon) {
  const abilities = pokemon.abilities.map((a) => a.ability.name).join(", ");
  return `
    <div class="info-row"><span>Height :</span><span>${pokemon.height / 10} m</span></div>
    <div class="info-row"><span>Weight :</span><span>${pokemon.weight / 10} kg</span></div>
    <div class="info-row"><span>Base experience :</span><span>${pokemon.base_experience}</span></div>
    <div class="info-row"><span>Abilities :</span><span>${abilities}</span></div>
  `;
}

function getStatsTabHtml(pokemon) {
  const statNames = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
  return statNames
    .map((statName) => {
      const value = getStat(pokemon, statName);
      const percent = Math.min(100, (value / 255) * 100);
      return `
        <div class="stat-row">
          <span class="stat-name">${statName}</span>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${percent}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function closeDialog() {
  dialogRef.close();
  document.querySelector("main").classList.remove("no-scroll");
}

function changeImg(step) {
  currentIndex += step;
  if (currentIndex >= visiblePokemon.length) currentIndex = 0;
  else if (currentIndex < 0) currentIndex = visiblePokemon.length - 1;
  renderDialogContent(visiblePokemon[currentIndex]);
}

//--------------------------------------------------------------------------

function openDialog(index) {
  currentIndex = index;
  const pokemon = visiblePokemon[currentIndex];
  activeTab = "main";
  renderDialogContent(pokemon);
  dialogRef.showModal();
  document.querySelector("main").classList.add("no-scroll");
  loadEvolutionChain(pokemon);
}

async function loadEvolutionChain(pokemon) {
 if (pokemon.evolutionChain) {
    if (activeTab === "evo-chain" && dialogRef.open) renderTabContent(pokemon);
    return;
  }

  const species = await fetchPokemonDetails(pokemon.species.url);
  const evolutionData = await fetchPokemonDetails(species.evolution_chain.url);

  pokemon.evolutionChain = extractEvolutionChain(evolutionData.chain);

  if (activeTab === "evo-chain" && dialogRef.open) {
    renderTabContent(pokemon);
  }
}

function extractEvolutionChain(chain) {
  const stages = [];
  let current = chain;
  while (current) {
    stages.push({
      id: extractIdFromUrl(current.species.url),
      name: current.species.name,
    });
    current = current.evolves_to[0];
  }
  return stages;
}

function extractIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function getEvoChainHtml(chain) {
  return `
    <div class="evo-chain-row">
      ${chain
        .map((stage, i) => {
          const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${stage.id}.png`;
          const arrow = i < chain.length - 1 ? `<span class="evo-arrow">»</span>` : "";
          return `
            <div class="evo-stage">
              <img src="${sprite}" alt="${stage.name}">
              <p>${capitalize(stage.name)}</p>
            </div>
            ${arrow}
          `;
        })
        .join("")}
    </div>
  `;
}

function changeImg(step) {
  currentIndex += step;
  if (currentIndex >= visiblePokemon.length) currentIndex = 0;
  else if (currentIndex < 0) currentIndex = visiblePokemon.length - 1;

  const pokemon = visiblePokemon[currentIndex];
  renderDialogContent(pokemon);
  loadEvolutionChain(pokemon);
}
