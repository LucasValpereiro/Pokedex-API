const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");
const searchInput = document.getElementById("searchInput"); // Nova const para buscar o ID


const maxRecords = 151;
const limit = 10;
let offset = 0;
let allPokemons = []; // Armazena os pokemons carregados

// Função nova para dar retorno e não repetir
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
        `
}

function loadPokemonItems(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    allPokemons = allPokemons.concat(pokemons); // Ir adicionando a busca dos pokemons conforme são exibidos mais
    const newHtml = pokemons.map(convertPokemonToLi).join('');
    pokemonList.innerHTML += newHtml
});
}

// Novo filtro para exibir o Pokemon
function filterPokemons(searchTerm) {
  const filtered = allPokemons.filter((pokemon) =>
  pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
);
pokemonList.innerHTML = filtered.map(convertPokemonToLi).join('');
}

// Evento para busca
searchInput.addEventListener('input', (event) => {
  const searchTerm = event.target.value;
  filterPokemons(searchTerm);
});

loadPokemonItems(offset, limit)

loadMoreButton.addEventListener('click', () => {
  searchInput.value = '';

  offset += limit

  const qtdRecordsWithNextPage = offset + limit

  if(qtdRecordsWithNextPage >= maxRecords) {
    const newLimit = maxRecords - offset
    loadPokemonItems(offset, newLimit)

    loadMoreButton.parentElement.removeChild(loadMoreButton)
  } else {    
    loadPokemonItems(offset, limit)
  }

})