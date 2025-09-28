let offset = 0; // Posição inicial para a Pokédex
const limit = 20; // Número de Pokémon por lote
const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMore');
const team = JSON.parse(localStorage.getItem('equipe')) || [];


// Função para carregar Pokémon da Pokédex
async function loadPokemonBatch(offset, limit) {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    data.results.forEach(addPokemonCard); // Adiciona um card para cada Pokémon
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

    // Adiciona o evento de clique ao card para exibir a árvore de evolução
    card.addEventListener('click', () => {
        fetchEvolutionTree(details.name); // Passa o nome do Pokémon clicado para exibir a árvore de evolução
    });

    pokemonList.appendChild(card);
}

// Event Listener para o botão "Carregar Mais"
loadMoreButton.addEventListener('click', () => {
    offset += limit;
    loadPokemonBatch(offset, limit);
});

// Carregar os primeiros Pokémon ao iniciar
loadPokemonBatch(offset, limit);

// Função para buscar a árvore de evolução de um Pokémon
async function fetchEvolutionTree(pokemonNameOrId) {
    const evolutionTreeContainer = document.getElementById('evolutionTree');
    evolutionTreeContainer.innerHTML = '<p>Carregando...</p>'; // Feedback enquanto carrega

    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonNameOrId}/`;

    try {
        // Requisição para dados da espécie
        const speciesResponse = await fetch(speciesUrl);
        if (!speciesResponse.ok) throw new Error('Pokémon não encontrado.');

        const speciesData = await speciesResponse.json();
        const evolutionChainUrl = speciesData.evolution_chain.url;

        // Requisição para a cadeia de evolução
        const evolutionResponse = await fetch(evolutionChainUrl);
        const evolutionData = await evolutionResponse.json();

        // Processa a cadeia de evolução
        const evolutions = [];
        let currentStage = evolutionData.chain;

        while (currentStage) {
            evolutions.push(currentStage.species.name);
            currentStage = currentStage.evolves_to[0]; // Avança para o próximo estágio
        }

        // Renderiza a árvore de evolução
        displayEvolutionTree(evolutions);
    } catch (error) {
        evolutionTreeContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

// Função para renderizar a árvore de evolução
async function displayEvolutionTree(evolutions) {
    const evolutionTreeContainer = document.getElementById('evolutionTree');
    evolutionTreeContainer.innerHTML = ''; // Limpa conteúdo anterior

    for (const speciesName of evolutions) {
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesName}`);
        const pokemonData = await pokemonResponse.json();

        // Cria um card para cada Pokémon na árvore
        const evolutionCard = document.createElement('div');
        evolutionCard.classList.add('evolution-card');
        evolutionCard.innerHTML = `
            <img src="${pokemonData.sprites.front_default}" alt="${speciesName}">
            <p>${speciesName.charAt(0).toUpperCase() + speciesName.slice(1)}</p>
        `;
        evolutionTreeContainer.appendChild(evolutionCard);
    }
}

// Event Listener para o botão de busca
document.getElementById('searchButton').addEventListener('click', () => {
    const pokemonNameOrId = document.getElementById('evolutionInput').value.trim().toLowerCase();
    if (pokemonNameOrId) {
        fetchEvolutionTree(pokemonNameOrId);
    } else {
        document.getElementById('evolutionTree').innerHTML = '<p class="error">Por favor, insira um nome ou ID.</p>';
    }
});

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
