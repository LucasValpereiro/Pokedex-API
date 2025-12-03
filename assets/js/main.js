const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");
const searchInput = document.getElementById("searchInput");

const maxRecords = 151;
const limit = 10;
let offset = 0;
let allPokemons = [];

let currentTypeFilter = "all";


function convertPokemonToLi(pokemon) {
  return ` <li class="pokemon ${pokemon.type}"> 
          <span class="number">${pokemon.number}</span>
          <span class="name">${pokemon.name}</span>

          <div class="detail">
            <ol class="types">
                ${pokemon.types
                  .map((type) => `<li class="type ${type}">${type}</li>`)
                  .join("")}
            </ol>
          <img
          src="${pokemon.photo}"
          alt="${pokemon.name}">  
          </div>
        </li>
        `;
}

function loadPokemonItems(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    allPokemons = allPokemons.concat(pokemons);
    const newHtml = pokemons.map(convertPokemonToLi).join("");
    pokemonList.innerHTML += newHtml;
  });
}

function filterPokemons(searchTerm) {
  let pokemonsToFilter = allPokemons;

  if (currentTypeFilter !== "all") {
    pokemonsToFilter = allPokemons.filter((pokemon) =>
      pokemon.types.includes(currentTypeFilter)
    );
  }

  const filtered = pokemonsToFilter.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Mostra na tela
  pokemonList.innerHTML = filtered.map(convertPokemonToLi).join("");
}

function filterByType(type) {

  if (type === "all") {
    pokemonList.innerHTML = allPokemons.map(convertPokemonToLi).join("");
    return;
  }

  const filtered = allPokemons.filter((pokemon) => 
    pokemon.types.includes(type)
  );

  pokemonList.innerHTML = filtered.map(convertPokemonToLi).join("");
}

searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value;
  filterPokemons(searchTerm);
});

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.getAttribute("data-type");
    currentTypeFilter = type;
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    searchInput.value = "";
    filterByType(type);
  });
});

loadPokemonItems(offset, limit);

loadMoreButton.addEventListener("click", () => {
  searchInput.value = "";

  offset += limit;

  const qtdRecordsWithNextPage = offset + limit;

  if (qtdRecordsWithNextPage >= maxRecords) {
    const newLimit = maxRecords - offset;
    loadPokemonItems(offset, newLimit);

    loadMoreButton.parentElement.removeChild(loadMoreButton);
  } else {
    loadPokemonItems(offset, limit);
  }
});