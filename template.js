const typeIcons = {
  normal: "⚪",
  fire: "🔥",
  water: "💧",
  electric: "⚡",
  grass: "🍃",
  ice: "❄️",
  fighting: "🥊",
  poison: "☠️",
  ground: "🌎",
  flying: "🕊️",
  psychic: "🔮",
  bug: "🐛",
  rock: "🪨",
  ghost: "👻",
  dragon: "🐉",
  dark: "🌑",
  steel: "⚙️",
  fairy: "✨",
};

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
  const statNames = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];
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

function getEvoStageHtml(stage) {
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${stage.id}.png`;
  return `
    <div class="evo-stage">
      <img src="${sprite}" alt="${stage.name}">
      <p>${capitalize(stage.name)}</p>
    </div>
  `;
}

function getEvoChainHtml(chain) {
  return `
    <div class="evo-chain-row">
      ${chain
        .map((stage, i) => {
          const arrow =
            i < chain.length - 1 ? `<span class="evo-arrow">»</span>` : "";
          return getEvoStageHtml(stage) + arrow;
        })
        .join("")}
    </div>
  `;
}
