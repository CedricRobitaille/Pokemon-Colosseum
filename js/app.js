const rootUrl = "https://pokeapi.co/api/v2/"
let offset = 0;
let limit = 16;



// --------------------------
// Filter Containers
// --------------------------

let typeFilters = [];



const filterElem = document.getElementById("type-filter");
const typeContainer = document.getElementById("type-container")
filterElem.addEventListener("click", () => {
  typeContainer.classList.toggle("open");
});

const filterDropDown = document.querySelector(".filter-drop-down");
filterDropDown.addEventListener("click", (event) => {
  const targetFilter = event.target;
  const filterID = event.target.id;
  if (filterID === "any") {
    if (!targetFilter.classList.contains("selected")) {
      const allTypes = document.querySelectorAll(".type");
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
});









const generatePokedexCard = async (pokemon) => {
  pokemon = await pokemon;
  // console.log(pokemon)

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


const generatePokedex = async (data) => {
  data = await data; // Since fetchData is async, the data we're using needs to be logged asyncly
  console.log("Generating Pokedex from:",data)

  // Get the data for each individual Card
  data.results.forEach(async (pokemon, index) => {
    const pokeID = pokemon.url.replace("https://pokeapi.co/api/v2/pokemon/", "").replace("/", ""); // FROM THE URL, Remove all the junk, leave the pokemon ID
    const pokeData = await fetchData(`pokemon/${pokeID}`)
    const card = await generatePokedexCard(pokeData) // Generate a card based on the individual pokemon's data

    const pokedex = document.getElementById("pokedex-pokemon");
    pokedex.appendChild(card)
  })
  
  
}











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












// ---------------------------
// ------- NAV LINKING -------
// ---------------------------

const pokeDexNavigate = () => {
  console.log("yes")
  generatePokedex(fetchData("pokemon"));

}





const nav = document.querySelector("nav");
nav.addEventListener("click", (event) => {
  console.log(event.target.id)
  if (event.target.id === "pokedex-nav") {
    pokeDexNavigate();
  } else if (event.taregt.id === "party-nav") {



  } else if (event.taregt.id === "battle-nav") {

  }
});






