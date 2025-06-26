// constants
const NUM_POKEMON_TO_DISPLAY = 1025; // eventually will change to 1302
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");

// variables
let allPokemons = []; // store pokemon when we retrieve them

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${NUM_POKEMON_TO_DISPLAY}`)
    .then((response) => response.json())
    .then((data) => {
        allPokemons = data.results;
        displayPokemon(allPokemons);
    });

// complete API fetch before progressing
async function fetchPokemonDataBeforeRedirect(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then((result) => result.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
            .then((result) => result.json())
        ]);

        return true;
    }

    catch(error) {
        console.error("Failed to complete API fetch for pokemon and pokemonSpecies before redirecting");
    }
}


// reload page with clean html, create html structure for each pokemon, adds click event for each pokemon
function displayPokemon(pokemon){
    listWrapper.innerHTML = "";

    pokemon.forEach((pokemon) => {
        const pokemonID = pokemon.url.split("/")[6];
        const listItem = document.createElement("div");
        listItem.className = "list-item";
        listItem.innerHTML = `
            <div class="number-wrap">
                <p class="caption-fonts">#${pokemonID}</p>
            </div>
            <div class="img-wrap">
                <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/${pokemonID}.png" alt="${pokemon.name}">
            </div>
            <div class="name-wrap">
                <p class="body3-fonts">#${pokemon.name}</p>
            </div>
        `;

        listItem.addEventListener("click", async() => {
            const success = await fetchPokemonDataBeforeRedirect((pokemonID));

            if(success) {
                window.location.href = `./detail.html?id=${pokemonID}`;
            }
        });

        listWrapper.appendChild(listItem);
    });
}

// search functionality
searchInput.addEventListener("keyup", handleSearch);
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    let filteredPokemons;
    
    if(numberFilter.checked) {
        filteredPokemons = allPokemons.filter((pokemon) => {
            const pokemonID = pokemon.url.split("/")[6];
            return pokemonID.startsWith(searchTerm);
        });
    }
    else if(nameFilter.checked){
        filteredPokemons = allPokemons.filter((pokemon) => {
            return pokemon.name.toLowerCase().startsWith(searchTerm)
        });
    }
    else {
        filteredPokemons = allPokemons;
    }

    displayPokemon(filteredPokemons);

    if(filteredPokemons.length == 0) {
        notFoundMessage.style.display = "block";
    }
    else {
        notFoundMessage.style.display = "none";
    }
}

// clear search entry field 
const closeButton = document.querySelector(".search-close-icon");
closeButton.addEventListener("click", clearSearch);
function clearSearch() {
    searchInput.value = "";
    displayPokemon(allPokemons);
    notFoundMessage.style.display = "none";
}

