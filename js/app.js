const rootUrl = "https://pokeapi.co/api/v2/"
let offset = 0;
let limit = 15;
let isLoading = false;





const party = {
  currentParty: [],
  maxSize: 6,
  currentSize: 0,
  async addToParty(pokemon) {
    if (this.currentSize < this.maxSize) {
      this.currentParty.push({ name: pokemon.name });

      pokedexPartyAdd(pokemon)

      this.currentSize++;
    } else {
      // PARTY IS FULL WARN THE USER
    }
  },
  /**
   * Removes a pokemon from the current party. This selection is based on the name of the pokemon.
   * @param {string} pokemon - The array index for the party
   */
  removeFromParty(index) {
    pokedexPartyRemove(index); // Removes the element from the 
    if (this.currentParty.length > 1) { // Doesn't like removing the last index
      this.currentParty.splice(index - 1, 1) // Removes the element from the array.
    } else {
      this.currentParty = [];
    }
    
    console.log(this.currentParty)
    this.currentSize--;
  },
}










// ----------------------------------------
// ----------- FILTER CONTAINER -----------
// ----------------------------------------

let typeFilters = [];

/**
 * Toggles the filter's root state from open to closed
 * @param {object} event - The 'click' event
 */
const filterToggle = (event) => {
  event.target.parentNode.classList.toggle("open"); // Toggle the class on the target's parent.
}

/**
 * Toggles between the dropdown states.
 * If 'any' was clicked, turn all on/off.
 * @param {object} event - The 'click' event
 */
const filterTypeToggle = (event) => {
  const targetFilter = event.target;  // The targeted element
  const filterID = event.target.id; // The targeted element's ID

  if (filterID === "any") { // If the selected element is "any"
    if (!targetFilter.classList.contains("selected")) { // 'Any' is not currently enabled.
      const allTypes = document.querySelectorAll(".drop-down-element"); // Collects all filters in an array
      allTypes.forEach((type) => {  // Iterate through every filter
        if (!typeFilters.includes(type.id)) { // The current filter is NOT currently enabled.
          if (type.id != "any") { // DO NOT ADD 'any' TO THE SELECTED FILTER ARRAY
            typeFilters.push(type.id);  // Add's the current filter to the filter array (based on the ID)
          }
          type.classList.add("selected"); // Gives everyone the 'selected' class for styling
        }
      })
    } else {  // Any is already on, meaning we need to disable all other filters.
      typeFilters = []; // Resets the selected filters to empty.
      const selecteds = document.querySelectorAll(".selected"); // All elements with the class "selected" placed in an araay
      selecteds.forEach((item) => { // Iterate through every previously selected filter
        item.classList.remove("selected");  // Remove their selected class/styling
      })
    }
  } else if (typeFilters.includes(filterID)) {  // The user clicked a filter that is already 'selected'
    typeFilters = typeFilters.filter(item => item !== filterID);  // Turns off the filter.
  } else {  // The user clicked on a filter that is not on
    typeFilters.push(filterID); // Add the filter to list!
  }
  if (filterID != "any") {  // Toggle all filters on/off (aside from any since that's done before)
    targetFilter.classList.toggle("selected")
  }
}

const togglePartyModal = () => {
  const partyModalContainer = document.getElementById("party-modal");
  partyModalContainer.classList.toggle("party-modal-closed");
}


// ---------------------------------------
// ------- POKEDEX CARD GENERATION -------
// ---------------------------------------

function pokedexPartyRemove(index) {
  const partyContainer = document.getElementById("party-container");
  const partyElement = document.getElementById(`party${index}`)
  if (partyElement) {
    partyContainer.removeChild(partyElement);
  }

  const partyElementCollection = document.querySelector(".party-element")
  if (!partyElementCollection) { // No more partyelements were found.
    const partyModal = document.getElementById("party-modal")
    partyModal.removeChild(partyContainer);
    togglePartyModal();
  }
}


async function pokedexPartyAdd(pokemon) {
  pokemon = await pokemon;
  console.log(pokemon)
  const partyModal = document.getElementById("party-modal");
  const partySize = party.currentSize;

  const partyModalState = document.querySelector(".party-modal-closed")
  if (partyModalState) {
    togglePartyModal();
  }

  let partyContainer = document.getElementById("party-container");
  if (!partyContainer) { // A party container doesn't exist yet, so make one!
    partyContainer = document.createElement("div");
    partyContainer.id = "party-container";
    partyModal.appendChild(partyContainer);
  }

  const partyElement = document.createElement("div");
  partyElement.classList.add("party-element");
  partyElement.id = `party${partySize}`
  partyContainer.appendChild(partyElement);

  const partyImg = document.createElement("img");
  partyImg.setAttribute("src", pokemon.sprites.front_default);
  partyElement.appendChild(partyImg);

  const partyName = document.createElement("p");
  partyName.innerText = pokemon.name;
  partyName.id = `partyName${partySize}`
  partyElement.appendChild(partyName);

  const partyRemoveButton = document.createElement("button");
  partyRemoveButton.classList.add("party-remove");
  partyRemoveButton.addEventListener("click", () => {
    party.removeFromParty(partySize);
  });
  partyElement.appendChild(partyRemoveButton);
}


/**
 * Clears the pokedex board of all pokemon. Resets the count tracker
 */
const resetPokedex = () => {
  offset = 0;
  try {
    const pokedexContainer = document.getElementById("pokedex-pokemon");
    pokedexContainer.innerHTML = "";
  } catch (error) {

  }
}


/**
 * Removes the modal from the Pokedex screen
 */
const removeModal = () => {
  const pokedex = document.getElementById("pokedex");
  const pokedexModal = document.querySelector(".pokemon-information");
  if (pokedexModal) {
    pokedex.removeChild(pokedexModal)
  }

}


/**
 * Generates a modal on the pokedex page filled with a detailed overview of pokemon traits.
 * @param {object} pokemon - Complete pokemon data from /pokemon/#/
 */
const generatePokedexModal = async (pokemon) => {
  pokemon = await pokemon;

  /**
   * Creates the modal object once all checks have been approved
   * Generates the modal under the following structure:
   * <article id="pokemon-Name" class="pokemon-information">
        <div class="modal-intro">
          <img src="" alt="">
          <p class="modal-id"></p>
          <h2 class="modal-name"></h2>
          <p class="flavor-text"></p>
        </div>

        <div id="modal-stats">
          <h3></h3>
          <div class="modal-stats-container">
            <div class="horizontal-stat-container">
              <p class="stat-name"></p>
              <p class="stat-value"></p>
              <div class="stat-bar-container">
                <div class="stat-bar"></div>
              </div>
            </div>
            <div class="poke-type-container">
              <p class="typeID">water</p>
            </div>
            <div class="abilities-container">
              <p class="abilityID">Swift Swim</p>
            </div>
          </div>
        </div>

        <div id="modal-evolutions">
          <h3></h3>
          <div class="evolutions-container">
            <img src="" alt="">
          </div>
        </div>
        <button class="btn btn-ghost"></button>
      </article>
   * @param {object} pokemon - Complete pokemon data from /pokemon/#/
   */
  const placePokedexInformation = async (pokemon) => {
    pokemon = await pokemon;
    species = await fetchData(`pokemon-species/${pokemon.id}`);
    evolutions = await fetchData(species.evolution_chain.url.replace("https://pokeapi.co/api/v2/", ""))

    console.log("MODAL INFO:")
    console.log(pokemon)
    console.log(species)
    console.log(evolutions)
    removeModal()

    const pokedex = document.getElementById("pokedex");

    const pokedexModalContainer = document.createElement("div");
    pokedexModalContainer.classList.add("pokemon-information")
    pokedexModalContainer.id = pokemon.name;
    pokedex.appendChild(pokedexModalContainer);

    const pokemonImg = document.createElement("img");
    pokemonImg.setAttribute("src", pokemon.sprites.front_default);
    pokemonImg.id = "pokedex-information-img"
    pokedexModalContainer.appendChild(pokemonImg)

    const pokedexModal = document.createElement("article");
    pokedexModal.classList.add("pokemon-information-container");
    pokedexModalContainer.appendChild(pokedexModal);

    // Intro Section

    const modalIntro = document.createElement("div");
    modalIntro.id = "modal-intro";
    pokedexModal.appendChild(modalIntro);

    const pokemonID = document.createElement("p");
    pokemonID.classList.add("modal-id");
    pokemonID.innerText = `N°${pokemon.id}`;
    modalIntro.appendChild(pokemonID);

    const pokemonName = document.createElement("h2");
    pokemonName.classList.add("modal-name");
    pokemonName.innerText = pokemon.name;
    modalIntro.appendChild(pokemonName);

    const flavorText = document.createElement("p");
    const flavorTextContent = species.flavor_text_entries[0].flavor_text.replace(/\n/g, " ").replace(/\f/g, " ");
    flavorText.innerText = flavorTextContent;
    flavorText.classList.add("flavor-text");
    modalIntro.appendChild(flavorText);

    // Modal Stats

    const modalStats = document.createElement("div");
    modalStats.id = "modal-stats";
    pokedexModal.appendChild(modalStats);

    const statsText = document.createElement("h3");
    statsText.innerText = "Stats"
    modalStats.appendChild(statsText)

    const statsContainer = document.createElement("div");
    statsContainer.classList.add("modal-stats-container");
    modalStats.appendChild(statsContainer);

    pokemon.stats.forEach((stat) => { // In the pokemon obj, loop through each stat in the `stats key`.
      const uniqueStatContainer = document.createElement("div");
      uniqueStatContainer.classList.add("horizontal-stat-container");
      statsContainer.appendChild(uniqueStatContainer);

      const statName = document.createElement("p");
      statName.classList.add("stat-name");
      statName.innerText = stat.stat.name;
      uniqueStatContainer.appendChild(statName);

      const statValue = document.createElement("p");
      statValue.classList.add("stat-value");
      statValue.innerText = stat.base_stat;
      uniqueStatContainer.appendChild(statValue);

      const statBarContainer = document.createElement("div");
      statBarContainer.classList.add("stat-bar-container");
      uniqueStatContainer.appendChild(statBarContainer);

      const statBar = document.createElement("div");
      statBar.classList.add("stat-bar");
      statBar.style.width = `${Math.min((parseInt(stat.base_stat) / 250 * 100), 100)}%` // sets element width to a percentage of the estimated max stat possible, capped at 100%
      statBarContainer.appendChild(statBar);
    });

    const typeContainer = document.createElement("div");
    typeContainer.classList.add("poke-type-container");
    modalStats.appendChild(typeContainer);

    pokemon.types.forEach((type) => { // Runs through each pokemon type
      const pokemonType = document.createElement("p");
      pokemonType.classList.add(type.type.name);
      pokemonType.innerText = type.type.name
      typeContainer.appendChild(pokemonType);
    })

    const abilityContainer = document.createElement("div");
    abilityContainer.classList.add("abilities-container")
    modalStats.appendChild(abilityContainer)

    pokemon.abilities.forEach((ability) => { // Runs through each pokemon ability
      const pokemonAbility = document.createElement("p");
      pokemonAbility.classList.add("ability-text");
      pokemonAbility.innerText = ability.ability.name
      abilityContainer.appendChild(pokemonAbility);
    });

    // Evolutions

    const modalEvolutions = document.createElement("div");
    modalEvolutions.classList.add("modal-evolutions");
    pokedexModal.appendChild(modalEvolutions);

    const evolutionText = document.createElement("h3");
    evolutionText.innerText = "Evolutions"
    modalEvolutions.appendChild(evolutionText);

    const evolutionsContainer = document.createElement("div");
    evolutionsContainer.classList.add("evolutions-container")
    modalEvolutions.appendChild(evolutionsContainer);

    /**
     *  Recursively tunnels through the evolution tree to output every step in the tree
     * @param {object} evolutions - The current stage of the evolution tree
     */
    const evolutionStep = async (evolution) => {
      evolution = await evolution;
      const imgSrc = await fetchData(`pokemon/${evolution.species.name}`)

      const evolutionImg = document.createElement("img");
      evolutionImg.setAttribute("src", imgSrc.sprites.front_default)
      evolutionsContainer.appendChild(evolutionImg);

      if (evolution.evolves_to.length > 0) { // Selected evolution tree spot does evolve again
        evolutionStep(evolution.evolves_to[0]);
      }
    }
    evolutionStep(evolutions.chain);

    const partyButton = document.createElement("button");
    partyButton.classList.add("btn", "btn-ghost");
    partyButton.innerText = "Add to Team";
    partyButton.addEventListener("click", () => {
      party.addToParty(pokemon);
    });
    pokedexModal.appendChild(partyButton);
    isLoading = false;
  }

  // Checks a) if a previous modal exists
  // Then b) if that modal is belonging to the pokemon selected (remove it, don't regenerate)
  const previousModal = document.querySelector(".pokemon-information");
  if (!previousModal) {
    placePokedexInformation(pokemon)
  } else if (previousModal.id != pokemon.name) {
    placePokedexInformation(pokemon)
  } else {
    removeModal();
  }
  isLoading = false;
}


/**
 * Generates a card in the pokedex, based on a fetched pokemon.
 *  @param {object} data - Individual pokemon object data
 */
const generatePokedexCard = async (pokemon) => {
  pokemon = await pokemon; // Ensure data has loaded before looking creating

  // Create Card Element
  const card = document.createElement("div");
  card.classList.add("card-container");
  card.addEventListener("click", () => {
    generatePokedexModal(pokemon)
  });

  // Create Pokemon Sprite -> Append to Card
  const sprite = document.createElement("img");
  await sprite.setAttribute("src", pokemon.sprites.front_default);
  card.appendChild(sprite);

  // Create PokeID Element -> Append to Card
  const pokeID = document.createElement("p");
  pokeID.innerText = `N°${pokemon.id}`;
  pokeID.classList.add("poke-id")
  card.appendChild(pokeID);

  // Create Pokemon Name Element -> Append to Card
  const pokeName = document.createElement("h3");
  pokeName.innerText = pokemon.name;
  pokeName.classList.add("poke-name");
  card.appendChild(pokeName);

  // Create Type Container -> Create types based on array -> Append types to Container -> Append to Card
  const typeContainer = document.createElement("div");
  typeContainer.classList.add("poke-type-container");
  card.appendChild(typeContainer)

  pokemon.types.forEach(async (type) => { // Creates a new type element for each type the pokemon has.
    const pokeType = document.createElement("p");
    pokeType.innerText = type.type.name;
    pokeType.classList.add(type.type.name);
    typeContainer.appendChild(pokeType);
  })

  // All card elements have been made. Return the card variable.
  return card;
}


/**
 * Creates a placeholder card in the dom.
 * ID value is added from the pokemon provided.
 * @param {object} data - Object containing pokemon data (either from /pokemon/ or /pokemon/#/)
 */
const generatePlaceholderCard = (data) => {
  let pokemonID = 0;

  if ("id" in data) {
    pokemonID = data.id;
  } else {
    pokemonID = data.url.replace("https://pokeapi.co/api/v2/pokemon/", "").replace("/", "")
  }

  const pokedex = document.getElementById("pokedex-pokemon"); // Get the pokedex parent container

  const card = document.createElement("div"); // Create the placeholder card element
  card.id = pokemonID;  // Assign the card a unique ID
  card.classList.add("pokedex-card"); // Give the card styling
  card.classList.add("placeholder");  // Give class 'Placeholder' for styling.
  pokedex.appendChild(card) // Add the placeholder to the pokedex container
}


/**
 * Generates the list of pokedex entries based on provided pokemon data.
 * Object data should come in one of two forms:
 * - Object containing many pokemon (url/pokemon)
 * - Individual pokemon object (url/pokemon/#)
 * @param {object} data - Pokemon data (/pokemon/ or /pokemon/#/)
 */
const generatePokedex = async (data) => {
  isLoading = true; // No more large calls can be requested until we're done loading.
  data = await data; // Since fetchData is async, the data we're using needs to be logged asyncly
  console.log("Generating Pokedex from:", data)

  if ("id" in data) { // The data provided contains a direct ID (comes from /pokemon/#)
    resetPokedex();
    generatePlaceholderCard(data)

    const makeCard = async (data) => {
      const pokeID = data.id;
      const card = await generatePokedexCard(data)

      const cardContainer = document.getElementById(pokeID)
      cardContainer.classList.remove("placeholder");
      console.log(card)
      cardContainer.appendChild(card)
    }

    makeCard(data);


  } else { // The data provided doesn't contain a direct ID (comes from /pokemon/)
    data.results.forEach((pokemon) => { // Create placeholder cards for each pokemon being sourced.
      generatePlaceholderCard(pokemon);
    });

    data.results.forEach(async (pokemon) => {
      const pokeID = pokemon.url.replace("https://pokeapi.co/api/v2/pokemon/", "").replace("/", ""); // FROM THE URL, Remove all the junk, leave the pokemon ID
      const pokeData = await fetchData(`pokemon/${pokeID}`) // Fetch the data specific to the current pokemon
      const card = await generatePokedexCard(pokeData) // Generate a card based on the individual pokemon's data

      const cardContainer = document.getElementById(pokeID) // Get the placeholder container with the matching ID
      cardContainer.classList.remove("placeholder");  // Remove the placeholder class since the card data has loaded
      cardContainer.appendChild(card) // Place the contents.

      offset++; // A card has been made. Increase the search offset by 1
    })
  }

  isLoading = false; // All cards requested have been loaded. We can now allow more calls to be called.
}



// ---------------------------------------
// ------------ DATA FETCHING ------------
// ---------------------------------------

const fetchData = async (params) => {
  try {
    const response = await fetch(rootUrl + params + `?offset=${offset}&limit=${limit}`);
    if (!response.ok) { // TRUE = Status code within 200-299 | FALSE = Status code outside 200-299 (ie: 404 -> Not Found)
      throw new Error(response.status) // Sends the Status Code to the catch.
    }
    const data = await response.json();
    // console.log("Fetched:",data)
    return (data); // Only return the results from the fetched data
  } catch (error) {
    console.log(error)
  }
}




// ---------------------------------------
// ------------ PAGE CREATION ------------
// ---------------------------------------

/**
 * Loads the Landing Page based on the following structure skeleton stucture:
 *    <header>
        <div class="header-content">
          <h1></h1>
          <button></button>
        </div>
        <img src="" alt="">
      </header>
      <div class="carousel">
        <h2></h2>
        <div class="carousel-container">
          <div class="carousel-card"> // Sources a random pokemon (3 Carousel Cards)
            <img class="carousel-sprite" src="" alt=""> // Adds the image from the selected pokemon's data
            <h3 class="carousel-ID"></h3> // Adds the ID from the selected pokemon's data
            <p class="carousel-name"></p> // Adds the name from the selected pokemon's data
          </div>
        </div>
      </div>
      <article id="landing-grid">
        <div class="landing-grid-unit">
          <h2></h2>
          <div class="team-split">
            <img src="" alt=""> Grabs 3 random pokemon pictures
          </div>
          <button></button>
        </div>

        <div class="landing-grid-unit">
          <h2></h2>
          <div class="team-split">
            <img src="" alt=""> Grabs 3 random gym badges pictures
          </div>
          <button></button>
        </div>
      </article>
 */
const loadLandingPage = async () => {
  const landingPageContainer = document.getElementById('landing-page');

  /// HEADER

  const header = document.createElement("header");
  landingPageContainer.appendChild(header);

  const headerContent = document.createElement("div");
  headerContent.classList.add("header-content");
  header.appendChild(headerContent);

  const h1 = document.createElement("h1");
  h1.innerHTML = "Build Your Party<br><span>Conquer the Colosseum</span>";
  headerContent.appendChild(h1);

  const cta = document.createElement("button");
  cta.classList.add("btn", "btn-cta");
  cta.innerText = "Get Started";
  headerContent.appendChild(cta);
  cta.addEventListener("click", () => {
    navUpdate("pokedex-nav");
    updatePage("pokedex-nav")
  })

  const headerImg = document.createElement("img");
  // headerImg.setAttribute("src", ""); -> Set when there's an image to be placed
  header.appendChild(headerImg);

  /// CAROUSEL

  const carousel = document.createElement("div");
  carousel.classList.add("carousel");
  landingPageContainer.appendChild(carousel);

  const carouselHeader = document.createElement("h2");
  carouselHeader.innerText = "Discover Pokemon"
  carousel.appendChild(carouselHeader);

  const carouselContainer = document.createElement("div");
  carouselContainer.classList.add("carousel-container");
  carousel.appendChild(carouselContainer);

  const carouselCardCount = [0, 1, 2];
  carouselCardCount.forEach(async () => { // Creates 3 Carousel Cards
    const randomPokemon = parseInt(Math.random() * 1025); // Gets a random Pokemon Index 1-1025
    const pokemon = await fetchData(`pokemon/${randomPokemon}`)

    const carouselCard = document.createElement("div");
    carouselCard.classList.add("carousel-card");
    carouselContainer.appendChild(carouselCard);

    const carouselImg = document.createElement("img");
    carouselImg.setAttribute("src", pokemon.sprites.front_default);
    carouselImg.classList.add("carousel-sprite");
    carouselCard.appendChild(carouselImg);

    const carouselID = document.createElement("h3");
    carouselID.classList.add("carousel-ID");
    carouselID.innerText = pokemon.id;
    carouselCard.appendChild(carouselID);

    const pokemonName = document.createElement("p");
    pokemonName.classList.add("carousel-name");
    pokemonName.innerText = pokemon.name;
    carouselCard.appendChild(pokemonName);
  });

  /// LANDING GRID


  const gridContainer = document.createElement("article");
  gridContainer.id = "landing-grid";
  landingPageContainer.appendChild(gridContainer);

  /// LEFT GRID ITEM

  const teamUnit = document.createElement("div");
  teamUnit.classList.add("landing-grid-unit");
  gridContainer.appendChild(teamUnit);

  const teamHeader = document.createElement("h2");
  teamHeader.innerText = "Build Your Team";
  teamUnit.appendChild(teamHeader);

  const teamSplit = document.createElement("div");
  teamSplit.classList.add("team-split");
  teamUnit.appendChild(teamSplit);

  const imgSize = [0, 1, 2];
  imgSize.forEach(async () => { // Creates 3 random pokemon images
    const randomPokemon = parseInt(Math.random() * 1025);
    const pokemon = await fetchData(`pokemon/${randomPokemon}`);

    const teamImg = document.createElement("img");
    teamImg.setAttribute("src", pokemon.sprites.front_default);
    teamSplit.appendChild(teamImg);
  })//

  const teamButton = document.createElement("button");
  teamButton.classList.add("btn", "btn-ghost");
  teamButton.innerText = "Start Building";
  teamButton.addEventListener("click", () => {
    navUpdate("party-nav");
    updatePage("party-nav")
  })
  teamUnit.appendChild(teamButton);

  /// RIGHT GRID ITEM

  const gymUnit = document.createElement("div");
  gymUnit.classList.add("landing-grid-unit");
  gridContainer.appendChild(gymUnit);

  const gymHeader = document.createElement("h2");
  gymHeader.innerText = "Challenge Gyms";
  gymUnit.appendChild(gymHeader);

  const gymSplit = document.createElement("div");
  gymSplit.classList.add("gym-split");
  gymUnit.appendChild(gymSplit);

  const gymSize = [0, 1, 2, 3, 4];
  gymSize.forEach(async () => { // Creates 3 random pokemon images
    const randomGym = parseInt(Math.random() * 66) + 1;

    const badgeImg = document.createElement("img");
    badgeImg.setAttribute("src", `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/${randomGym}.png`);
    gymSplit.appendChild(badgeImg);
  })//

  const gymButton = document.createElement("button");
  gymButton.classList.add("btn", "btn-ghost");
  gymButton.innerText = "Let's Fight";
  gymButton.addEventListener("click", () => {
    navUpdate("battle-nav");
    updatePage("battle-nav")
  })
  gymUnit.appendChild(gymButton);
}

/**
 * Loads the Pokedex Page based on the following structure skeleton stucture:
 *  <div id="pokemon-search">
      <search>
        <div>
          <input type="search">
          <button></button>
        </div>
        <div id="filters">
          <div id="filter-container"> // Creates many fitler containers based on what stats need to be filtered
            <p id="filter-type"></p>
            <ul class="filter-drop-down">
              <li id="filter"></li> // Creates many filters based on the pokemon types array
            </ul>
          </div>
        </div>
      </search>
      <div id="pokedex-pokemon">
        // POKEMON CARDS PLACED WITHIN
      </div>
    </div>
 */
const loadPokedexPage = () => {
  resetPokedex();
  const pokedex = document.getElementById("pokedex");

  const pokeSearch = document.createElement("div");
  pokeSearch.id = "pokemon-search"
  pokedex.appendChild(pokeSearch);

  const searchContainer = document.createElement("search");
  pokeSearch.appendChild(searchContainer);

  const searchBarContainer = document.createElement("div");
  searchContainer.appendChild(searchBarContainer);

  const searchInput = document.createElement("input")
  searchInput.id = "search-input";
  searchInput.setAttribute("type", "search");
  searchInput.setAttribute("placeholder", "Search for a Pokemon / ID")
  searchInput.addEventListener("keydown", (event) => { // The user clicked a key while in the search
    if (event.key === "Enter") {
      generatePokedex(fetchData(`pokemon/${searchInput.value}`));
    }
  });
  searchBarContainer.appendChild(searchInput);

  const searchButton = document.createElement("button");
  searchButton.id = "search-button";
  searchButton.addEventListener("click", () => { // On search button click
    generatePokedex(fetchData(`pokemon/${searchInput.value}`));
  });
  searchBarContainer.appendChild(searchButton);

  const filtersContainer = document.createElement("div")
  filtersContainer.id = "filters"
  searchContainer.appendChild(filtersContainer);

  const filtersArray = ["types"];
  const types = ["any", "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "steel", "dragon", "dark", "fairy", "stellar"]
  filtersArray.forEach((filterType) => {
    const currentFilterContainer = document.createElement("div");
    currentFilterContainer.id = `${filterType}-container` // ie: type-container
    filtersContainer.appendChild(currentFilterContainer);

    const filterButton = document.createElement("p");
    filterButton.id = `${filterType}-filter`;
    filterButton.innerText = filterType;
    currentFilterContainer.appendChild(filterButton);
    filterButton.addEventListener("click", (event) => {
      filterToggle(event)
    });

    const filterDropDown = document.createElement("ul");
    filterDropDown.classList.add("filter-drop-down");
    currentFilterContainer.appendChild(filterDropDown);

    types.forEach((type) => {
      const typeElement = document.createElement("li");
      typeElement.id = type;
      typeElement.classList.add("drop-down-element")
      typeElement.innerText = type;
      typeElement.addEventListener("click", (event) => {
        filterTypeToggle(event);
      });
      filterDropDown.appendChild(typeElement);
    });

    // Search Params have all been made.

    const pokedexOutput = document.createElement("div");
    pokedexOutput.id = "pokedex-pokemon";
    pokeSearch.appendChild(pokedexOutput);
  })

  // Create the Party Modal

  const partyModal = document.createElement("section");
  partyModal.id = "party-modal";
  partyModal.classList.add("party-modal-closed");
  pokedex.appendChild(partyModal)

  const partyModalTitle = document.createElement("h2");
  partyModalTitle.id = "party-modal-toggle";
  partyModalTitle.innerText = "Your Party";
  partyModalTitle.addEventListener("click", () => { togglePartyModal() });
  partyModal.appendChild(partyModalTitle);

  party.currentParty.forEach(async (partyPokemon) => { // party.currentParty is an array
    pokedexPartyAdd(await fetchData(`pokemon/${partyPokemon.name}`))  // Get the pokemon data from the array's object's key: "name"
  })

  generatePokedex(fetchData("pokemon"));
}


const loadPartyPage = () => {
}


const loadBattlePage = () => {
}


// ---------------------------------------
// ------------- NAV LINKING -------------
// ---------------------------------------


/**
 * Changes the nav appearance based on the link clicked.
 * @param {string} navID - Nav Link ID clicked.
 */
const navUpdate = (navID) => {
  const navLinks = document.querySelectorAll(".nav-link") // Array of all nav links on the page

  navLinks.forEach((link) => {  // Iterate through each link
    if (link.classList.contains("current-page")) {  // If the link has "current-page" cass
      link.classList.remove("current-page");  // Remove the styling
    }
    if (link.id === navID) {  // If the link is the selected link
      link.classList.add("current-page")  // Add the styling
    }
  })
}

/**
 * Hides the previous page, and then displays the new page.
 * Valid Nav IDs are: 
 * - logo-nav
 * - pokedex-nav
 * - party-nav
 * - battle-nav
 * @param {string} navID - Nav Link ID clicked.
 */
const updatePage = (navID) => {
  const main = document.querySelector("main"); // Gets the main elem
  const pages = main.children;  // Logs every child of main (These are all the individual pages)

  for (let i = 0; i < pages.length; i++) {  // Iterate through every page
    if (!pages[i].classList.contains("hidden")) {  // If the page is not hidden (active page)
      pages[i].classList.add("hidden"); // Give it the class hidden (turn it off)
      pages[i].innerHTML = ""; // Removes all the contents.
    }
  }

  switch (navID) { // Switch cases for each nav location.
    case "logo-nav":
      const landingPage = document.getElementById("landing-page");
      landingPage.classList.remove("hidden");
      loadLandingPage();
      break;

    case "pokedex-nav":
      const pokedexPage = document.getElementById("pokedex");
      pokedexPage.classList.remove("hidden");
      loadPokedexPage();
      break;

    case "party-nav":
      const partyPage = document.getElementById("party");
      partyPage.classList.remove("hidden");
      loadPartyPage();
      break;

    case "battle-nav":
      loadBattlePage();
      break;
  }
}


/**
 * Navigates to targeted content and hides previous content.
 * @param {string} target - The nav element that was clicked
 */
const navClick = (target) => {
  if (target.classList.contains("nav-link")) {
    navUpdate(target.id);
    updatePage(target.id)
  }
}


const nav = document.querySelector("nav");
nav.addEventListener("click", (event) => { navClick(event.target) });




// ----------------------------------------
// ------------ LAUNCH ACTIONS ------------
// ----------------------------------------

let timeDelay = false;
window.addEventListener("scroll", () => {
  const pokedexNav = document.getElementById("pokedex-nav")
  if (pokedexNav.classList.contains("current-page")) {
    if (!isLoading && !timeDelay) {
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 100) {
        isLoading = true;
        timeDelay = true;
        generatePokedex(fetchData("pokemon"));
        setTimeout(() => {
          timeDelay = false;
        }, 200);
      }
    }
  }
});

loadLandingPage();








