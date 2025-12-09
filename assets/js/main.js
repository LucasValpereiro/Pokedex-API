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

async function searchPokemonByName(name) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    
    if (!response.ok) {
      return null;
    }
    
    const pokeDetail = await response.json();

    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name;
    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    pokemon.types = types;
    pokemon.type = types[0];
    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default; 

    return pokemon;
  } catch (erro) {
    return null;
  }
}

async function getAllPokemonsByType(type) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    // Filtrar apenas os primeiros 151 pokémons
    const pokemonPromises = data.pokemon
      .filter(p => {
        const id = parseInt(p.pokemon.url.split('/').slice(-2, -1)[0]);
        return id <= maxRecords;
      })
      .map(async (p) => {
        const id = parseInt(p.pokemon.url.split('/').slice(-2, -1)[0]);
        const pokemonData = await fetch(p.pokemon.url).then(res => res.json());
        
        const pokemon = new Pokemon();
        pokemon.number = pokemonData.id;
        pokemon.name = pokemonData.name;
        const types = pokemonData.types.map((typeSlot) => typeSlot.type.name);
        pokemon.types = types;
        pokemon.type = types[0];
        pokemon.photo = pokemonData.sprites.other.dream_world.front_default;
        
        return pokemon;
      });
    
    const pokemons = await Promise.all(pokemonPromises);
    return pokemons.sort((a, b) => a.number - b.number);
    
  } catch (error) {
    console.error('Erro ao buscar pokémons por tipo:', error);
    return [];
  }
}

async function filterPokemons(searchTerm) {
  if (!searchTerm.trim()) {
    if (currentTypeFilter !== "all") {
      await filterByType(currentTypeFilter);
    } else {
      pokemonList.innerHTML = allPokemons.map(convertPokemonToLi).join("");
    }
    return;
  }

  const apiPokemon = await searchPokemonByName(searchTerm);
  
  if (apiPokemon) {
    if (currentTypeFilter === "all" || apiPokemon.types.includes(currentTypeFilter)) {
      pokemonList.innerHTML = convertPokemonToLi(apiPokemon);
    } else {
      pokemonList.innerHTML = '<li style="grid-column: 1/-1; text-align: center; padding: 2rem;">Nenhum Pokémon encontrado com esse filtro</li>';
    }
  } else {
    pokemonList.innerHTML = '<li style="grid-column: 1/-1; text-align: center; padding: 2rem;">Pokémon não encontrado</li>';
  }
}

async function filterByType(type) {
  if (type === "all") {
    pokemonList.innerHTML = allPokemons.map(convertPokemonToLi).join("");
    return;
  }

  pokemonList.innerHTML = '<li style="grid-column: 1/-1; text-align: center; padding: 2rem;">Carregando...</li>';
  
  const pokemons = await getAllPokemonsByType(type);
  
  if (pokemons.length > 0) {
    pokemonList.innerHTML = pokemons.map(convertPokemonToLi).join("");
  } else {
    pokemonList.innerHTML = '<li style="grid-column: 1/-1; text-align: center; padding: 2rem;">Nenhum Pokémon encontrado</li>';
  }
}

searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value;
  filterPokemons(searchTerm);
});

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const type = button.getAttribute("data-type");
    currentTypeFilter = type;
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    searchInput.value = "";
    await filterByType(type);
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