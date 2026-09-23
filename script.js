const dialogRef = document.querySelector('[data-id="dialog"]');
const galleryRef = document.getElementById("gallery");

let allPokemon = [];
let visiblePokemon = [];
let currentIndex = 0;
let offset = 0;
let isLoading = false;
let activeTab = "main";

const INITIAL_LIMIT = 10;
const LOAD_MORE_LIMIT = 10;
let limit = INITIAL_LIMIT;

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }
  return response.json();
}

async function fetchPokemonList(offset, limit) {
  const data = await fetchJson(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
  );
  return data.results;
}

async function fetchPokemonDetails(url) {
  return fetchJson(url);
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

function renderCards(pokemonArray) {
  galleryRef.innerHTML = "";
  pokemonArray.forEach((pokemon, index) => {
    galleryRef.innerHTML += getCardHtml(pokemon, index);
  });
}

function setLoading(loading) {
  isLoading = loading;
  const button = document.querySelector('[data-id="load-more-button"]');
  button.disabled = loading;

  let spinner = document.querySelector(".loading-spinner");
  if (loading && !spinner) {
    spinner = document.createElement("img");
    spinner.className = "loading-spinner";
    spinner.src = "./assets/img/loading.gif";
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

function toggleSearchHint(show) {
  const hint = document.querySelector(".search-hint");
  hint.classList.toggle("error", show);
}

function searchPokemon() {
  const query = document
    .querySelector('[data-id="search-input"]')
    .value.trim()
    .toLowerCase();

  if (query.length > 0 && query.length < 3) {
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

document
  .querySelector('[data-id="search-input"]')
  .addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (query.length === 0 || query.length >= 3) {
      toggleSearchHint(false);
    }
  });

document
  .querySelector('[data-id="search-input"]')
  .addEventListener("keydown", (e) => {
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
  document.getElementById("img-counter").textContent =
    `${currentIndex + 1}/${visiblePokemon.length}`;
  document.getElementById("dialogTypes").innerHTML = getTypeBadges(
    pokemon.types,
  );

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

function closeDialog() {
  dialogRef.close();
  document.querySelector("main").classList.remove("no-scroll");
}

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

function changeImg(step) {
  currentIndex += step;
  if (currentIndex >= visiblePokemon.length) currentIndex = 0;
  else if (currentIndex < 0) currentIndex = visiblePokemon.length - 1;

  const pokemon = visiblePokemon[currentIndex];
  renderDialogContent(pokemon);
  loadEvolutionChain(pokemon);
}
