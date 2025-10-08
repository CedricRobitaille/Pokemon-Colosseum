const rootUrl = "https://pokeapi.co/api/v2/"
let offset = 0;
let limit = 16;



// --------------------------
// Filter Containers
// --------------------------

let typeFilters = [];

const filterToggle = (event) => {
  event.target.parentNode.classList.toggle("open");
}

const filterTypeToggle = (event) => {
  const targetFilter = event.target;
  const filterID = event.target.id;
  if (filterID === "any") {
    if (!targetFilter.classList.contains("selected")) {
      const allTypes = document.querySelectorAll(".drop-down-element");
      allTypes.forEach((type) => {
        if (!typeFilters.includes(type.id)) {
          if (type.id != "any") {
            typeFilters.push(type.id);
          }
          type.classList.add("selected");
        }
      })
    } else {
      typeFilters = [];
      const selecteds = document.querySelectorAll(".selected");
      selecteds.forEach((item) => {
        item.classList.remove("selected");
      })
    }
  } else if (typeFilters.includes(filterID)) {
    typeFilters = typeFilters.filter(item => item !== filterID);
  } else {
    typeFilters.push(filterID);
  }
  if (filterID != "any") {
    targetFilter.classList.toggle("selected")
  }
  console.log(typeFilters);
}






// ---------------------------------------
// ------- POKEDEX CARD GENERATION -------
// ---------------------------------------

/**
 * Generates a card in the pokedex, based on a fetched pokemon.
 *  @param {object} data - Individual pokemon object data
 */
const generatePokedexCard = async (pokemon) => {
  pokemon = await pokemon;

  // Create Card Element
  const card = document.createElement("div");
  card.id = pokemon.id;
  card.classList.add("pokedex-card");

  // Create Pokemon Sprite -> Append to Card
  const sprite = document.createElement("img");
  sprite.setAttribute("src", pokemon.sprites.front_default);
  card.appendChild(sprite);

  // Create PokeID Element -> Append to Card
  const pokeID = document.createElement("p");
  pokeID.innerText = pokemon.id;
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

  pokemon.types.forEach(async (type) => {
    console.log(type.type.name)
    const pokeType = document.createElement("p")
    pokeType.innerText = type.type.name;
    pokeType.classList.add(type.type.name);
    typeContainer.appendChild(pokeType);
  })

  card.appendChild(typeContainer)

  // All card elements have been made. Return the card variable.
  return card;
}


/**
 * Generates the list of pokedex entries based on provided pokemon data.
 * Object data should come in one of two forms:
 * - Object containing many pokemon (url/pokemon)
 * - Individual pokemon object (url/pokemon/#)
 * @param {object} data - Pokemon data (/pokemon/ or /pokemon/#/)
 */
const generatePokedex = async (data) => {
  data = await data; // Since fetchData is async, the data we're using needs to be logged asyncly
  console.log("Generating Pokedex from:",data)

  // const cardArray = [];
  // let currentCard = 0;
  // let maxCards = data.results.length-1;

  // Get the data for each individual Card
  data.results.forEach(async (pokemon) => {
    const pokeID = pokemon.url.replace("https://pokeapi.co/api/v2/pokemon/", "").replace("/", ""); // FROM THE URL, Remove all the junk, leave the pokemon ID
    const pokeData = await fetchData(`pokemon/${pokeID}`)
    const card = await generatePokedexCard(pokeData) // Generate a card based on the individual pokemon's data

    const pokedex = document.getElementById("pokedex-pokemon");
    pokedex.appendChild(card)
  })

  // const placeCard = async () => {
  //   for (let cardIndex = currentCard; cardIndex < cardArray.length; cardIndex++) {
  //     if (cardArray[cardIndex][0] =)
  //   }
  // }



  
  
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
    return(data); // Only return the results from the fetched data
  } catch (error) {
    console.log(error)
  }
}



////////////////////////////////////////
// FLAVOR TEXT -> pokemon-species.flavor_text_entries[i]
////////////////////////////////////////






// ---------------------------------------
// ------------ PAGE CREATION ------------
// ---------------------------------------

const loadLandingPage = () => {

}


const loadPokedexPage = () => {
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
  searchBarContainer.appendChild(searchInput);

  const searchButton = document.createElement("button");
  searchButton.id = "search-button";
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
    if (!pages[i].classList.contains("hidden")){  // If the page is not hidden (active page)
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






