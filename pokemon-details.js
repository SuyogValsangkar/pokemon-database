let currentPokemonID = null;
const NUM_POKEMON_TO_DISPLAY = 1025;

document.addEventListener("DOMContentLoaded", () => {
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonID, 10);

    if(id < 1 || id > NUM_POKEMON_TO_DISPLAY) {
        return (window.location.href = "./index.html");
    }

    currentPokemonID = id;
    loadPokemon(id);
});

async function loadPokemon(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then((result) => result.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
            .then((result) => result.json())
        ]);

        const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");
        abilitiesWrapper.innerHTML = "";
        
        if(currentPokemonID == id) {
            displayPokemonDetails(pokemon);
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector(".body3-fonts.pokemon-description").textContent = flavorText;
            
            const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) => document.querySelector(sel));
            leftArrow.removeEventListener("click", navigatePokemon);
            rightArrow.removeEventListener("click", navigatePokemon);

            if(id != 1) {
                leftArrow.addEventListener("click", () => navigatePokemon(id - 1));
            }

            if (id != NUM_POKEMON_TO_DISPLAY) {
                rightArrow.addEventListener("click", () => navigatePokemon(id + 1));
            }

            window.history.pushState({}, "", `./detail.html?id=${id}`);
        }
        return true;
    }
    catch (error) {
        console.error("An error occured while fetching pokémon data", error);
        return false;
    }
}

async function navigatePokemon(id) {
    currentPokemonID = id;
    await loadPokemon(id);
}

const typeColors = {
    normal: "#a8a878",
    fire: "#f08030",
    water: "#6890f0",
    electric: "#f8d030",
    grass: "#78c850",
    ice: "#98d8d8",
    fighting: "#c03028",
    poison: "#a040a0",
    ground: "#e0c068",
    flying: "#a890f0",
    psychic: "#f85888",
    bug: "#a8b820",
    rock: "#b8a038",
    ghost: "#705898", 
    dragon: "#7038f8",
    dark: "#705848",
    steel: "#b8b8d0",
    fairy: "#ee99ac"
};

function setElementStyles(elements, cssProperty, value) {
    if (elements instanceof Element) {
        elements.style[cssProperty] = value;
    }
    else {
        elements.forEach((element) =>  element.style[cssProperty] = value);
    }
}

function rgbaFromHex(hexColor) {
    return [parseInt(hexColor.slice(1, 3), 16),
            parseInt(hexColor.slice(3, 5), 16),
            parseInt(hexColor.slice(5, 7), 16)
           ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];

    if(!color) {
        console.warn(`Color not defined for type: ${mainType}`);
        return;
    }

    const detailMainElement = document.querySelector(".detail-main");
    setElementStyles([detailMainElement], "backgroundColor", color);
    setElementStyles([detailMainElement], "borderColor", color);
    setElementStyles(document.querySelectorAll(".power-wrapper > p"), "backgroundColor", color);
    setElementStyles(document.querySelectorAll(".stats-wrap p.stats"), "color", color);
    setElementStyles(document.querySelectorAll(".stats-wrap > .progress-bar"), "color", color);

    const rgbaColor = rgbaFromHex(color);
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
        .stats-wrap .progress-bar::-webkit-progress-bar {
            background-color: rgba(${rgbaColor}, 0.5);
        }
        .stats-wrap .progress-bar::-webkit-progress-value {
            background-color: ${color};
        }
    `;

    document.head.appendChild(styleTag);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function displayPokemonDetails(pokemon) {
    const {name, id, types, weight, height, abilities, stats} = pokemon;
    const capitalizedPokemonName = capitalizeFirstLetter(name);
    document.querySelector("title").textContent = capitalizedPokemonName;

    const detailMainElement = document.querySelector(".detail-main");
    detailMainElement.classList.add(name.toLowerCase());

    document.querySelector(".name-wrap .name").textContent = capitalizedPokemonName;
    document.querySelector(".pokemon-id-wrap .body2-fonts").textContent = `#${String(id).padStart(3, "0")}`;

    const imageElement = document.querySelector(".detail-img-wrapper img");
    imageElement.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/${id}.png`;
    imageElement.alt = name;

    const typeWrapper = document.querySelector(".power-wrapper");
    typeWrapper.innerHTML = "";
    types.forEach(({type}) => createAndAppendElement(typeWrapper, "p", {className: `body3-fonts type ${type.name}`, textContent: type.name}));

    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight").textContent = `${(weight / 4.5).toFixed(1)} lbs`;
    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height").textContent = `${(height / 3).toFixed(1)} ft`;

    const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");
    abilities.forEach(({ability}) => createAndAppendElement(abilitiesWrapper, "p", {className: "body3-fonts", textContent: ability.name}));

    const statsWrapper = document.querySelector(".stats-wrapper");
    statsWrapper.innerHTML = "";
    const statNameMapping = {
        hp: "HP", 
        attack: "ATK",
        defense: "DEF",
        "special-attack": "S-ATK",
        "special-defense": "S-DEF",
        speed: "SPD"
    };

    stats.forEach(({stat, base_stat}) => {
        const statDiv = document.createElement("div");
        statDiv.className = "stats-wrap";
        statsWrapper.appendChild(statDiv);

        createAndAppendElement(statDiv, "p", {className: "body3-fonts stats", textContent: statNameMapping[stat.name]});
        createAndAppendElement(statDiv, "p", {className: "body3-fonts", textContent: String(base_stat).padStart(3, "0")});
        createAndAppendElement(statDiv, "progress", {className: "progress-bar", value: base_stat, max: 100});
    });

    setTypeBackgroundColor(pokemon);
}

function createAndAppendElement(parent, tag, options = {}) {
    const element = document.createElement(tag);
    Object.keys(options).forEach((key) => element[key] = options[key]);
    parent.appendChild(element);
    return element;
}

function getEnglishFlavorText(pokemonSpecies) {
    for (let entry of pokemonSpecies.flavor_text_entries){
        if(entry.language.name == "en") {
            let flavor = entry.flavor_text.replace(/\f/g, "");
            return flavor;
        }
    }

    return "";
}
