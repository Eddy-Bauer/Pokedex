const dialogRef = document.querySelector('[data-id="dialog"]');
const galleryRef = document.getElementById("gallery");

let allPokemon = [];
let visiblePokemon = [];
let currentIndex = 0;
let offset = 0;
let isLoading = false;

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
    spinner = document.createElement("p");
    spinner.className = "loading-spinner";
    spinner.textContent = "Lade Pokémon...";
    galleryRef.after(spinner);
  } else if (!loading && spinner) {
    spinner.remove();
  }
}

function loadMore() {
  if (isLoading) return;
  loadPokemons();
}
//---------------------------------------------------------------------

function searchPokemon() {
  const query = document
    .querySelector('[data-id="search-input"]')
    .value.trim()
    .toLowerCase();

  visiblePokemon = query
    ? allPokemon.filter((p) => p.name.includes(query))
    : allPokemon;

  renderCards(visiblePokemon);
  toggleNotFound(visiblePokemon.length === 0);
}

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

function openDialog(index) {
  currentIndex = index;
  renderDialogContent(visiblePokemon[currentIndex]);
  dialogRef.showModal();
  document.querySelector("main").classList.add("no-scroll");
}

function renderDialogContent(pokemon) {
  document.getElementById("dialogTitle").textContent = capitalize(pokemon.name);
  document.querySelector('[data-id="dialog-image"]').src = pokemon.sprites.front_default;
  document.getElementById("img-counter").textContent =
    `${currentIndex + 1}/${visiblePokemon.length}`;

  const hp = getStat(pokemon, "hp");
  const attack = getStat(pokemon, "attack");
  const defense = getStat(pokemon, "defense");

  document.getElementById("dialogStats").innerHTML = `
    <p>HP: ${hp}</p>
    <p>Attack: ${attack}</p>
    <p>Defense: ${defense}</p>
  `;
}

function getStat(pokemon, statName) {
  return pokemon.stats.find((s) => s.stat.name === statName).base_stat;
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

async function openDialog(index) {
  currentIndex = index;
  const pokemon = visiblePokemon[currentIndex];
  renderDialogContent(pokemon);
  dialogRef.showModal();
  document.querySelector("main").classList.add("no-scroll");

  await loadEvolutionChain(pokemon);
}

async function loadEvolutionChain(pokemon) {
  // Caching: nur laden, wenn noch nicht vorhanden
  if (pokemon.evolutionChainNames) {
    renderEvolutionChain(pokemon.evolutionChainNames);
    return;
  }

  const species = await fetchPokemonDetails(pokemon.species.url);
  const evolutionData = await fetchPokemonDetails(species.evolution_chain.url);

  pokemon.evolutionChainNames = extractEvolutionNames(evolutionData.chain);
  renderEvolutionChain(pokemon.evolutionChainNames);
}

function extractEvolutionNames(chain) {
  const names = [];
  let current = chain;
  while (current) {
    names.push(capitalize(current.species.name));
    current = current.evolves_to[0];
  }
  return names;
}

function renderEvolutionChain(names) {
  const container = document.getElementById("dialogStats");
  container.innerHTML += `<p>Evolution: ${names.join(" → ")}</p>`;
}