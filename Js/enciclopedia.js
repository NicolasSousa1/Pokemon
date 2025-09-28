let offset = 0; // Posição inicial para a Pokédex
const limit = 20; // Número de Pokémon por lote
const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMore');

// Função para carregar Pokémon da Pokédex
async function loadPokemonBatch(offset, limit) {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    data.results.forEach(addPokemonCard);
}

// Função para adicionar um card de Pokémon na Pokédex
async function addPokemonCard(pokemon) {
    const response = await fetch(pokemon.url);
    const details = await response.json();

    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <img src="${details.sprites.front_default}" alt="${details.name}">
        <h3>${details.name.charAt(0).toUpperCase() + details.name.slice(1)}</h3>
    `;

    // Adiciona um evento de clique no card para exibir as informações do Pokémon
    card.addEventListener('click', () => {
        displayPokemonDetails(details);
    });

    pokemonList.appendChild(card);
}

// Função para exibir os detalhes do Pokémon
async function displayPokemonDetails(pokemon) {
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`;
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`;

    try {
        // Exibe as informações básicas do Pokémon
        document.getElementById('pokemon-name').textContent = pokemon.name.toUpperCase();
        document.getElementById('pokemon-image').src = pokemon.sprites.front_default;
        document.getElementById('pokemon-info').textContent = `
            Tipo: ${pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}
            Altura: ${pokemon.height / 10} m
            Peso: ${pokemon.weight / 10} kg
        `;

        // Requisição para pegar a descrição do Pokémon
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        // Filtra a descrição em português (pt) ou inglês (en)
        const descriptionEntry = speciesData.flavor_text_entries.find(entry => 
            entry.language.name === 'pt' || entry.language.name === 'en'
        );

        // Exibe a descrição do Pokémon (ou uma mensagem de erro)
        if (descriptionEntry) {
            document.getElementById('pokemon-info').textContent += `\n\nDescrição: ${descriptionEntry.flavor_text.replace(/\n|\f/g, ' ')}`;
        } else {
            document.getElementById('pokemon-info').textContent += `\n\nDescrição: Descrição não disponível para este Pokémon.`;
        }
    } catch (error) {
        document.getElementById('pokemon-info').textContent = "Erro ao carregar as informações do Pokémon.";
        document.getElementById('pokemon-name').textContent = "";
        document.getElementById('pokemon-image').src = "";
    }
}

// Event Listener para o botão "Carregar Mais"
loadMoreButton.addEventListener('click', () => {
    offset += limit;
    loadPokemonBatch(offset, limit);
});

// Carregar os primeiros Pokémon ao iniciar
loadPokemonBatch(offset, limit);

// Função para buscar Pokémon pela pesquisa
async function fetchPokemonn() {
    const pokemonNameOrId = document.getElementById('pokemonInput').value.toLowerCase();
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonNameOrId}`;
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonNameOrId}/`;

    try {
        // Primeira requisição para dados básicos
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Atualiza o nome, imagem e informações básicas
        document.getElementById('pokemon-name').textContent = data.name.toUpperCase();
        document.getElementById('pokemon-image').src = data.sprites.front_default;
        document.getElementById('pokemon-info').textContent = ` 
            Tipo: ${data.types.map(typeInfo => typeInfo.type.name).join(', ')}
            Altura: ${data.height / 10} m
            Peso: ${data.weight / 10} kg
        `;

        // Segunda requisição para pegar a descrição
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        // Filtra a descrição em português (pt) ou inglês (en)
        const descriptionEntry = speciesData.flavor_text_entries.find(entry => 
            entry.language.name === 'pt' || entry.language.name === 'en'
        );

        // Exibe a descrição (ou uma mensagem se não for encontrada)
        if (descriptionEntry) {
            document.getElementById('pokemon-info').textContent += `\n\nDescrição: ${descriptionEntry.flavor_text.replace(/\n|\f/g, ' ')}`;
        } else {
            document.getElementById('pokemon-info').textContent += `\n\nDescrição: Descrição não disponível para este Pokémon.`;
        }
    } catch (error) {
        document.getElementById('pokemon-info').textContent = "Pokémon não encontrado. Tente outro nome ou ID.";
        document.getElementById('pokemon-name').textContent = "";
        document.getElementById('pokemon-image').src = "";
    }
}

// Carregar e exibir Pokémon da equipe nas imagens do menu
function carregarEquipeMenu() {
    const equipe = JSON.parse(localStorage.getItem('equipe')) || []; // Recupera a equipe do localStorage
    const rightImages = document.querySelectorAll('.right-images img');

    // Atualiza as imagens dos Pokémon no menu
    equipe.forEach((pokemon, index) => {
        if (index < rightImages.length) { // Evita exceder o número de imagens disponíveis
            rightImages[index].src = pokemon.sprites.front_default;
            rightImages[index].alt = pokemon.name;
        }
    });

    // Define imagens padrão para espaços restantes
    for (let i = equipe.length; i < rightImages.length; i++) {
        rightImages[i].src = 'imagens/placeholder.png'; // Imagem padrão (substitua com o caminho desejado)
        rightImages[i].alt = 'Placeholder';
    }
}

// Carregar a equipe no menu ao iniciar
carregarEquipeMenu();
