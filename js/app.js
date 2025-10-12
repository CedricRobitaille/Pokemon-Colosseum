const rootUrl = "https://pokeapi.co/api/v2/"
let offset = 0;
let limit = 15;
let isLoading = false;





const party = {
  currentParty: [],
  maxSize: 6,
  currentSize: 0,

  /**                                          ----  -----------  --------  -----  -----  -----  ---------
   * Adds a pokemon to the party. Includes The Name, Sprite URLs, Nickname, Types, Stats, Moves, Abilities, and Held Item
   * @param {object} pokemon - Selected pokemon to add to our party. (Comes from /pokemon/#/)
   */
  async addToParty(pokemon) {
    console.log("Adding", pokemon)

    const setPokemonProperties = (pokemon) => {
      const index = this.currentSize;
      this.currentParty.push({}); // Start a new pokemon here.

      const currentPokemon = this.currentParty[index]; // This is the current Pokemon.
      currentPokemon.name = pokemon.name; // Give the pokemon it's name
      const nickname = currentPokemon.name.split("-")
      const newNickname = [];
      nickname.forEach((word) => newNickname.push(word.charAt(0).toUpperCase() + word.slice(1)));
      currentPokemon.nickname = newNickname.join(" "); // Set default value for nickname

      currentPokemon.sprites = {}; // Initiates the pokemon sprites sub-object
      Object.keys(pokemon.sprites).forEach((spriteName) => { // For each sprite in the pokemon sprite list
        if (pokemon.sprites[spriteName] != null) { // Makes sure the current sprite isnt NULL
          currentPokemon.sprites[spriteName] = pokemon.sprites[spriteName];
        }
      });

      currentPokemon.types = [] // Initializes the types sub-array
      pokemon.types.forEach((type) => { // Runs through everyarray element
        currentPokemon.types.push(type.type.name);  // Adds the type `type[type{name: ---}]`
      })

      currentPokemon.stats = [] // Initializes the stats sub-array
      pokemon.stats.forEach((stat, index) => { // Goes through each stat element in the stats array
        currentPokemon.stats.push({});  // Creates the new stat object on the current pokemon
        currentPokemon.stats[index].name = stat.stat.name;  // Give this object a name
        currentPokemon.stats[index].base_stat = stat.base_stat; // Give this object a value
      })

      currentPokemon.movesAvailable = []  // Collection of all moves available
      pokemon.moves.forEach((move, index) => { // Goes through the source pokemon's moves array
        currentPokemon.movesAvailable.push({});
        currentPokemon.movesAvailable[index].name = move.move.name;
        currentPokemon.movesAvailable[index].url = move.move.url;
      })

      currentPokemon.movesEquipped = [] // Collection of moves the pokemon can use during combat
      for (let index = 0; index < Math.min(currentPokemon.movesAvailable.length, 4); index++) { // Loops though the quantity of moves available, capped at 4. (ie: Magikarp only knows 2, so dont go past 2, whereas others know 4+)
        const move = Math.floor(Math.random() * currentPokemon.movesAvailable.length); // Gets a random move from their possible moves
        currentPokemon.movesEquipped.push({})
        currentPokemon.movesEquipped[index].name = currentPokemon.movesAvailable[move].name;
        currentPokemon.movesEquipped[index].url = currentPokemon.movesAvailable[move].url;
      }

      currentPokemon.movesEquipped.forEach((move, index) => {
        const searchParams = move.url.replace("https://pokeapi.co/api/v2/", "");
        this.setMoveProps(fetchData(searchParams), currentPokemon, index);
      })

      currentPokemon.abilitiesAvailable = [] // initiates the array
      pokemon.abilities.forEach((ability, index) => {  // For each ability in the ability array
        currentPokemon.abilitiesAvailable.push({});
        currentPokemon.abilitiesAvailable[index].name = ability.ability.name;
        currentPokemon.abilitiesAvailable[index].url = ability.ability.url;
        // currentPokemon.abilitiesAvailable.push(ability.ability.name); // Sets the element to the ability name. Can use the name for the API call.
      })

      const randomAbilityIndex = Math.floor(Math.random() * currentPokemon.abilitiesAvailable.length);
      currentPokemon.abilityEquipped = currentPokemon.abilitiesAvailable[randomAbilityIndex];

      currentPokemon.heldItem = ""

      console.log("Current Pokemon:", currentPokemon) // The current Pokemon
    }

    if (this.currentSize < this.maxSize) {
      setPokemonProperties(pokemon);
      pokedexPartyAdd(pokemon)
      this.currentSize++;
    } else {
      // PARTY IS FULL WARN THE USER
    }
    await console.log("Current Party:", this.currentParty);
  },

  /**
   * Removes a pokemon from the current party. This selection is based on the name of the pokemon.
   * @param {string} pokemon - The array index for the party
   */
  removeFromParty(index) {
    pokedexPartyRemove(index); // Removes the element from the 
    if (this.currentParty.length > 0) { // Doesn't like removing the last index
      this.currentParty.splice(index, 1) // Removes the element from the array.
    } else {
      this.currentParty = [];
    }

    console.log("Removed Pokemon.\nCurrent Party:", this.currentParty)
    this.currentSize--;
  },

  async setMoveProps(move, pokemon, index) {
    move = await move;
    console.log("MOVE:", pokemon)

    pokemon.movesEquipped[index].name = move.name;

    pokemon.movesEquipped[index].power = move.power;
    pokemon.movesEquipped[index].pp = move.pp;
    pokemon.movesEquipped[index].priority = move.priority;
    pokemon.movesEquipped[index].accuracy = move.accuracy;
    pokemon.movesEquipped[index].type = move.type.name;
    pokemon.movesEquipped[index].damageClass = move.damage_class.name;

    pokemon.movesEquipped[index].flavorText = move.flavor_text_entries[0].flavor_text.replaceAll("\n", " ").replaceAll("\f", "");

    pokemon.movesEquipped[index].meta = move.meta;
    pokemon.movesEquipped[index].stat_changes = move.stat_changes;
  },

  /**
   * Tool to edit the properties of selected pokemon!
   * @param {number} pokemon - Pokemon Index in the Current Party array
   * @param {string} value - Value to change in the current property's string.
   * @param {string} property - The property to be changed
   * @param {number} propertyIndex - If an attack, which attack index?
   */
  async editPokemonProps(pokemon, value, property, propertyIndex) {
    console.log("Saving:", pokemon, value, property, propertyIndex)
    if (property === "move") {
      this.setMoveProps(fetchData(`move/${value}`), this.currentParty[pokemon], propertyIndex);
    } else if (property === "held-item") {
      this.currentParty[pokemon].heldItem = value;
    } else if (property === "ability") {
      const ability = await fetchData(`ability/${value}`)
      this.currentParty[pokemon].abilityEquipped.name = ability.name;
      this.currentParty[pokemon].abilityEquipped.url = `https://pokeapi.co/api/v2/ability/${ability.id}`;
    } else {
      this.currentParty[pokemon].nickname = value;
    }
    // console.log(property)
  }
}








// -------------------------------------
// ------- PARTY PAGE GENERATION -------
// -------------------------------------



const togglePropertyDetails = async (event) => {
  const propertyContainer = event.parentNode;
  const propertyType = document.getElementById("party-property-modal").classList[0];
  console.log(propertyContainer);

  if (propertyContainer.classList.contains("openProperty")) {
    propertyContainer.classList.remove("openProperty");
    return;
  }

  propertyContainer.classList.add("openProperty");

  const openedBeforeChecker = propertyContainer.querySelector(".property-item-details-container");
  if (!openedBeforeChecker) { // The details have NOT been generated before, so let's make them!

    const propertyDetails = document.createElement("div");
    propertyDetails.classList.add("property-item-details-container");
    propertyContainer.appendChild(propertyDetails);

    switch (propertyType) {
      case "ability":
        propertyDetails.classList.add("modal-ability-container");
        const ability = await fetchData(`ability/${propertyContainer.id}`)

        const abilityTitle = document.createElement("h5");
        abilityTitle.innerText = "Description:"
        propertyDetails.appendChild(abilityTitle);

        for (let index = 0; index < ability.effect_entries.length; index++) {
          if (ability.effect_entries[index].language.name === "en") {
            const propertyText = document.createElement("p");
            propertyText.innerText = ability.effect_entries[index].effect;
            propertyDetails.appendChild(propertyText);
          }
        }
        break;

      case "held-item":
        console.log(propertyContainer.id)
        propertyDetails.classList.add("modal-item-container");
        const item = await fetchData(`item/${propertyContainer.id}`);

        const sprite = document.createElement("img");
        sprite.setAttribute("src", item.sprites.default);
        propertyDetails.appendChild(sprite);

        const itemTitle = document.createElement("h5");
        itemTitle.innerText = "Description:"
        propertyDetails.appendChild(itemTitle);

        for (let index = 0; index < item.effect_entries.length; index++) {
          if (item.effect_entries[index].language.name === "en") {
            const propertyText = document.createElement("p");
            const outputString = item.effect_entries[index].effect;
            propertyText.innerText = outputString.replace("\n:", ":\n");
            propertyDetails.appendChild(propertyText);
            break;
          }
        }

        console.log(item)
        break;

      case "move":
        propertyDetails.classList.add("modal-move-container");
        const move = await fetchData(`move/${propertyContainer.id}`)
        console.log(move)

        // TYPES

        const typeContainer = document.createElement("div");
        typeContainer.classList.add("type-container");
        propertyDetails.appendChild(typeContainer);

        const type = document.createElement("p");
        type.id = move.type.name;
        type.innerText = move.type.name;
        typeContainer.appendChild(type);

        const classType = document.createElement("p");
        classType.id = move.damage_class.name;
        classType.innerText = move.damage_class.name;
        typeContainer.appendChild(classType);

        // STATS

        const statContainer = document.createElement("div");
        statContainer.classList.add("party-move-stat-container");
        propertyDetails.appendChild(statContainer);

        const powerContainer = document.createElement("div")
        powerContainer.classList.add("party-move-stat-container-inner");
        statContainer.appendChild(powerContainer);

        const powerTitle = document.createElement("h5");
        powerTitle.innerText = "Power";
        powerContainer.appendChild(powerTitle);

        const powerValue = document.createElement("p");
        let powerVal = move.power;
        if (!powerVal) {
          powerVal = "---"
        }
        powerValue.innerText = powerVal;
        powerContainer.appendChild(powerValue);

        const ppContainer = document.createElement("div")
        ppContainer.classList.add("party-move-stat-container-inner");
        statContainer.appendChild(ppContainer);

        const ppTitle = document.createElement("h5");
        ppTitle.innerText = "PP";
        ppContainer.appendChild(ppTitle);

        const ppValue = document.createElement("p");
        let ppVal = move.pp;
        if (!ppVal) {
          ppVal = "---"
        }
        ppValue.innerText = ppVal;
        ppContainer.appendChild(ppValue);

        const priorityContainer = document.createElement("div")
        priorityContainer.classList.add("party-move-stat-container-inner");
        statContainer.appendChild(priorityContainer);

        const priorityTitle = document.createElement("h5");
        priorityTitle.innerText = "Priority";
        priorityContainer.appendChild(priorityTitle);

        const priorityValue = document.createElement("p");
        let priorityVal = move.priority;
        if (!priorityVal) {
          priorityVal = "---"
        }
        priorityValue.innerText = priorityVal;
        priorityContainer.appendChild(priorityValue);

        // DESCRIPTION

        const descriptionContainter = document.createElement("div");
        descriptionContainter.classList.add("party-move-description");
        propertyDetails.appendChild(descriptionContainter)

        const moveTitle = document.createElement("h5");
        moveTitle.innerText = "Description:"
        descriptionContainter.appendChild(moveTitle);

        for (let index = 0; index < move.flavor_text_entries.length; index++) {
          if (move.flavor_text_entries[index].language.name === "en") {
            const propertyText = document.createElement("p");
            const outputString = move.flavor_text_entries[index].flavor_text;
            propertyText.innerText = outputString.replaceAll("\n ", " ").replaceAll("\n", " ");
            descriptionContainter.appendChild(propertyText);
            break;
          }
        }

        break;
    }

    // Button to swap prop

    const swapPropertyButton = document.createElement("button");
    swapPropertyButton.classList.add("swap-property-button");
    if (propertyType === "ability") {
      swapPropertyButton.innerText = `Add Ability`
    } else if (propertyType === "move") {
      swapPropertyButton.innerText = `Add Move`
    } else {
      swapPropertyButton.innerText = `Add Item`
    }
    swapPropertyButton.addEventListener("click", () => {
      document.getElementById("inputSelected").innerText = propertyContainer.id;
    });
    propertyContainer.appendChild(swapPropertyButton);
  }
}

const createUndefinedPropertySet = async (property) => {
  const dataSet = await fetchData(property);

  const itemContainerSet = document.getElementById("property-set-container")
  itemContainerSet.innerHTML = ""; // Empties the container.

  dataSet.results.forEach((item) => {
    const itemContainer = document.createElement("div");
    itemContainer.classList.add("item-set-container");
    itemContainer.id = item.name;
    itemContainerSet.appendChild(itemContainer);

    const itemHeader = document.createElement("div");
    itemHeader.classList.add("property-item-header");
    itemHeader.addEventListener("click", (event) => {
      togglePropertyDetails(event.currentTarget);
    });
    itemContainer.appendChild(itemHeader);

    const itemTitle = document.createElement("h4");
    itemTitle.innerText = item.name.replace("-", " ");
    itemHeader.appendChild(itemTitle);
  })


}

const togglePokemonDetails = (event) => {
  event.parentElement.classList.toggle("open")
}

/**
 * Upon clicking the `Save Changes` button,
 * Passes properties and values to the party.editPokemonProps function
 */
const savePartyChanges = () => {
  const partyDetailsContainer = document.querySelectorAll(".party-pokemon-container"); // Gets the container that holds all the pokemonDetails items

  partyDetailsContainer.forEach(async (partyPokemon, index) => { // Iterate through every pokemon details element
    const pokemonID = index;  // Set the party.currentParty pokemon array index

    const traitsArray = partyPokemon.querySelectorAll(".party-pokemon-traits .party-pokemon-input"); // Gets all inputs under the traits container
    traitsArray.forEach((trait) => { // Iterate through every pokemon property in the individual pokemon
      const traitPropert = trait.getAttribute("property");  // Determines what the property of the input is
      if (traitPropert === null) { // Nickname doesn't have a property
        const value = trait.value;  // Gets the user-inputted value;
        party.editPokemonProps(pokemonID, value, "nickname"); // Runs the function to set the properties on the party element
      } else {  // Not a nickname, and not a move.
        const value = trait.innerText;  // Gets the trait
        party.editPokemonProps(pokemonID, value, traitPropert); // Runs the function to set the properties on the party element
      }
    });

    const movesArray = partyPokemon.querySelectorAll(`[property="move"`); // Gets all move elements from their property
    movesArray.forEach((move, moveIndex) => { // Iterate through every move
      const value = move.innerText; // Set the move's current value;
      party.editPokemonProps(pokemonID, value, "move", moveIndex); // Runs the function to set the properties on the party element
    });
  })

  console.log(party.currentParty);
}

const removePropertyModal = () => {
  const party = document.getElementById("party");
  const previousModal = document.getElementById("party-property-modal");
  console.log("YES")
  party.removeChild(previousModal);
}

const removePropertyStyling = () => {
  const previousProperty = document.getElementById("inputSelected");
  previousProperty.id = ""; // Remove the styling of the selected element
}

/**
 * 
 * @param {string} property - The focus property for the modal
 * @param {array} pokemon - The party.currentPokemon index
 */
const generatePropertyModal = async (property, collection) => {
  collection = await collection;

  // Setup

  const party = document.getElementById("party");

  const previousModal = document.getElementById("party-property-modal");
  if (previousModal) {
    removePropertyModal();
  }

  // Modal Header Creation

  const modal = document.createElement("article");
  modal.id = "party-property-modal";
  modal.classList.add(property);
  party.appendChild(modal);

  const modalHeader = document.createElement("div");
  modalHeader.classList.add("party-property-modal-header");
  modal.appendChild(modalHeader);

  const modalMinimize = document.createElement("button");
  modalMinimize.classList.add("minimize-button");
  modalMinimize.addEventListener("click", () => {
    removePropertyStyling();
    party.removeChild(modal);
  })
  modalHeader.appendChild(modalMinimize);

  const modalTitle = document.createElement("h2")
  modalTitle.innerText = property.replace("-", " ") + "s";
  if (property === "ability") {
    modalTitle.innerText = "Abilities";
  } else {
    modalTitle.innerText = property.replace("-", " ") + "s";
  }
  modalHeader.appendChild(modalTitle)

  // Modal Contents

  const propertyCollectionContainer = document.createElement("ol");
  propertyCollectionContainer.classList.add("property-collection-container");
  modal.appendChild(propertyCollectionContainer);

  if (collection) { // For properties who have a set collection (NOT ITEMS)
    collection.forEach((item) => {
      const itemContainer = document.createElement("li");
      itemContainer.classList.add("property-item-container");
      itemContainer.id = item.name;
      propertyCollectionContainer.appendChild(itemContainer);

      const itemHeader = document.createElement("div");
      itemHeader.classList.add("property-item-header");
      itemHeader.addEventListener("click", (event) => {
        togglePropertyDetails(event.currentTarget);
      });
      itemContainer.appendChild(itemHeader);

      const itemTitle = document.createElement("h4");
      itemTitle.innerText = item.name;
      itemHeader.appendChild(itemTitle);
    })
  } else { // No set collection: IE: ITEMS where we need to keep fetching data
    if (property === "held-item") {
      property = "item"
    }
    offset = 0;
    const propertySetContainer = document.createElement("div"); // Container that holds the dataset
    propertySetContainer.id = "property-set-container"
    propertyCollectionContainer.appendChild(propertySetContainer);

    createUndefinedPropertySet(property); // Function to fetch new dataset, and place in the modal

    const paginationMax = await fetchData("item");
    const paginationContainer = document.createElement("div");
    paginationContainer.classList.add("pagination-container");
    propertyCollectionContainer.appendChild(paginationContainer);

    const previousPage = document.createElement("button");
    previousPage.id = "previous-page";
    previousPage.classList.add("pagination-button");
    previousPage.innerText = "Previous";
    previousPage.addEventListener("click", () => {
      if (offset >= 15) {
        offset -= 15;
        createUndefinedPropertySet(property)
      }
    });
    paginationContainer.appendChild(previousPage);

    const nextPage = document.createElement("button");
    nextPage.id = "next-page";
    nextPage.classList.add("pagination-button");
    nextPage.innerText = "Next";
    nextPage.addEventListener("click", () => {
      if (offset < paginationMax.count - 14) {
        offset += 15;
        createUndefinedPropertySet(property);
      }
    });
    paginationContainer.appendChild(nextPage);
  }



}

/**
 * 
 * @param {number} pokemon - The party.currentParty index you are working with
 * @param {string} property - The specific property you wish your change;
 * @param {number} index - (OPTIONAL) The index for the selected property (ie: which equipped move was clicked)
 */
const changeProperty = async (pokemon, property, index) => {
  console.clear();

  const styleInputs = () => {
    const currentPokemonElement = document.querySelectorAll(".party-pokemon-container");

    // Remove the previously clicked element's clicked styling.
    const previousProperty = document.getElementById("inputSelected");
    if (previousProperty) {
      if (previousProperty === currentPokemonElement[pokemon].querySelector(`[property="${property}"]`) && property != "move") { // If the user clicked the same property that's already enabled.
        removePropertyStyling();
        removePropertyModal();
        return false; // KILL THE FUNCTION BECAUSE WE CLICKED THE SAME PROP
      }
      if (previousProperty.getAttribute("property") === "move") { // Since moves are indexed, we need to find check for the specific move
        if (currentPokemonElement[pokemon].contains(previousProperty)) { // You are in the same parent element
          const moveArray = currentPokemonElement[pokemon].querySelectorAll(`[property="move"`); // gets all move elements
          if (previousProperty === moveArray[index]) { // the move at index is the same element as the previous
            removePropertyStyling()
            removePropertyModal();
            return false; // KILL THE FUNCTION BECAUSE WE CLICKED THE SAME PROP
          }
        }
      }
      removePropertyStyling();
    }

    // Set styling on the clicked element
    if (property === "move") {

      const moveElementArray = currentPokemonElement[pokemon].querySelectorAll(`[property="move"]`)
      moveElementArray[parseInt(index)].id = "inputSelected"
    } else {
      const selectedPropertElement = currentPokemonElement[pokemon].querySelector(`[property="${property}"]`);
      selectedPropertElement.id = "inputSelected"
    }
    return true;
  }

  const styleInputsReturn = styleInputs();

  if (styleInputsReturn) { // If the style inputs function returns false, dont do (ie: the previous clicked element was clicked again)
    if (property === "ability") {
      generatePropertyModal(property, party.currentParty[pokemon].abilitiesAvailable);
    } else if (property === "held-item") {
      offset = 0;
      generatePropertyModal(property);
    } else {
      generatePropertyModal(property, party.currentParty[pokemon].movesAvailable);
    }
  }



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
// ------- POKEDEX PAGE GENERATION -------
// ---------------------------------------

function pokedexPartyRemove(index) {
  const partyContainer = document.getElementById("party-container");
  const partyElement = partyContainer.children[index]; // Gets the child at the index provided
  if (partyElement) {
    partyContainer.removeChild(partyElement); // Removes the child from the parent
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
  partyRemoveButton.addEventListener("click", (event) => {
    const currentElement = event.currentTarget.parentElement;
    const index = Array.from(currentElement.parentElement.children).indexOf(currentElement); // .children gives a nodelist. Nodelists cannot be indexed through the indexOf function, so we need to convert the nodelist into a shallow copy with `Array.from`
    party.removeFromParty(index);
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

/**
 * Loads the Party Page based on the following skeleton structure:
 *    <div id="party-main">

        <div id="party-overview">
          <div class="overview-card">
            <img src="" alt="">
            <h3>Name</h3>
            <div class="type-container">
              <p></p>
              <p></p>
            </div>
          </div>
        </div>

        <div id="party-details">
          <h1>Your Party</h1>
          <ol id="party-details-list">
            <li class="party-pokemon-containter open" id="1">
              <div class="party-pokemon-overview">
                <div class="party-pokemon-overview-left">
                  <img src="" alt="">
                  <p></p>
                  <h3></h3>
                </div>
                <div class="party-pokemon-overview-right">
                  <p></p>
                  <p></p>
                </div>
              </div>
               <div class="party-pokemon-details">
                <div class="party-pokemon-traits">
                  <h4>Nickname</h4>
                  <input id="nickname" type="text" value="" class="party-pokemon-input">
                  <h4>Ability</h4>
                  <p class="party-pokemon-input"></p>
                  <h4>Held Item</h4>
                  <p class="party-pokemon-input item"></p>
                </div>
                <div class="party-pokemon-stats">
                  <h4>Stats</h4>
                </div>
                <div class="party-pokemon-moves">
                  <h4>Moves</h4>
                  <p class="party-pokemon-input"></p>
                  <p class="party-pokemon-input"></p>
                  <p class="party-pokemon-input"></p>
                  <p class="party-pokemon-input"></p>
                </div>
               </div>
            </li>
          </ol>
        </div>
      </div>
 */
const loadPartyPage = () => {

  const partyPage = document.getElementById("party");

  const partyContainer = document.createElement("div");
  partyContainer.id = "party-main";
  partyPage.appendChild(partyContainer);

  //  Party Overview

  const partyOverview = document.createElement("div");
  partyOverview.id = "party-overview";
  partyContainer.appendChild(partyOverview);

  party.currentParty.forEach((pokemon) => { // Create a card for each pokemon currently in the party
    const pokeCard = document.createElement("div");
    pokeCard.classList.add("overview-card");
    partyOverview.appendChild(pokeCard);

    const pokeImg = document.createElement("img");
    pokeImg.setAttribute("src", pokemon.sprites.front_default);
    pokeCard.appendChild(pokeImg);

    const pokeName = document.createElement("h3");
    pokeName.innerText = pokemon.name;
    pokeCard.appendChild(pokeName);

    const typeContainer = document.createElement("div");
    typeContainer.classList.add("type-container");
    pokeCard.appendChild(typeContainer);

    pokemon.types.forEach((type) => {
      const typeElement = document.createElement("p");
      typeElement.classList.add(type);
      typeElement.innerText = type;
      typeContainer.appendChild(typeElement);
    })
  }) // Finished making party overview card

  // Party Details

  const partyDetails = document.createElement("article");
  partyDetails.id = "party-details";
  partyContainer.appendChild(partyDetails);

  const partyDetailsHeader = document.createElement("div");
  partyDetailsHeader.id = "party-details-header";
  partyDetails.appendChild(partyDetailsHeader)

  const partyDetailsTitle = document.createElement("h1");
  partyDetailsTitle.innerText = "Your Party";
  partyDetailsHeader.appendChild(partyDetailsTitle);

  const saveButton = document.createElement("button");
  saveButton.innerText = "Save Changes";
  saveButton.addEventListener("click", () => {
    savePartyChanges();
  });
  partyDetailsHeader.appendChild(saveButton);

  const partyDetailsContainer = document.createElement("ol");
  partyDetailsContainer.id = "party-details-list";
  partyDetails.appendChild(partyDetailsContainer);

  party.currentParty.forEach((pokemon, index) => { // Makes a list element for each pokemon in the party.

    const pokemonContainer = document.createElement("li"); // The root element for the pokemon overview
    pokemonContainer.classList.add("party-pokemon-container");
    if (index === 0) { // Always have one pokemon details section open by default
      pokemonContainer.classList.add("open");
    }
    partyDetailsContainer.appendChild(pokemonContainer);

    // Pokemon Overview

    const pokemonOverview = document.createElement("div");
    pokemonOverview.classList.add("party-pokemon-overview");
    pokemonOverview.addEventListener("click", (event) => { // When the user clicks the overview, toggle it to become bigger/smaller
      togglePokemonDetails(event.currentTarget);
    });
    pokemonContainer.appendChild(pokemonOverview);

    const overviewLeft = document.createElement("div");
    overviewLeft.classList.add("party-pokemon-overview-left");
    pokemonOverview.appendChild(overviewLeft);

    const overviewImg = document.createElement("img");
    overviewImg.setAttribute("src", pokemon.sprites.front_default);
    overviewLeft.appendChild(overviewImg);

    const overviewNumber = document.createElement("p");
    overviewNumber.innerText = `0${index + 1}`
    overviewLeft.appendChild(overviewNumber);

    const overviewName = document.createElement("h3");
    overviewName.innerText = pokemon.name;
    overviewLeft.appendChild(overviewName);

    const overviewRight = document.createElement("div");
    overviewRight.classList.add("party-pokemon-overview-right");
    pokemonOverview.appendChild(overviewRight);

    pokemon.types.forEach((type) => { // Create a type element for each type within the pokemon object.
      const typeElement = document.createElement("p");
      typeElement.classList.add(type);
      typeElement.innerText = type;
      overviewRight.appendChild(typeElement);
    })

    // Pokemon Details

    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("party-pokemon-details");
    pokemonContainer.appendChild(detailsContainer);

    // Traits

    const traitsContainer = document.createElement("div");
    traitsContainer.classList.add("party-pokemon-traits");
    detailsContainer.appendChild(traitsContainer);

    const traitNicknameLabel = document.createElement("h4");
    traitNicknameLabel.innerText = "Nickname";
    traitsContainer.appendChild(traitNicknameLabel);

    const traitNickname = document.createElement("input");
    traitNickname.setAttribute("value", pokemon.nickname);
    traitNickname.classList.add("party-pokemon-input");
    traitsContainer.appendChild(traitNickname);

    const traitAbilityLabel = document.createElement("h4");
    traitAbilityLabel.innerText = "Ability";
    traitsContainer.appendChild(traitAbilityLabel);

    const traitAbility = document.createElement("p");
    traitAbility.classList.add("party-pokemon-input");
    traitAbility.setAttribute("property", "ability")
    traitAbility.innerText = pokemon.abilityEquipped.name;
    traitAbility.addEventListener("click", () => {
      changeProperty(index, "ability");
    });
    traitsContainer.appendChild(traitAbility);

    const traitItemLabel = document.createElement("h4");
    traitItemLabel.innerText = "Held Item";
    traitsContainer.appendChild(traitItemLabel);

    const traitItem = document.createElement("p");
    traitItem.setAttribute("property", "held-item")
    traitItem.classList.add("party-pokemon-input", "item");
    if (pokemon.heldItem) {
      traitItem.innerText = pokemon.heldItem;
    } else {
      traitItem.innerText = "---";
    }
    traitItem.addEventListener("click", () => {
      changeProperty(index, "held-item");
    })
    traitsContainer.appendChild(traitItem);

    // Stats

    const statsSection = document.createElement("div");
    statsSection.classList.add("party-pokemon-stats");
    detailsContainer.appendChild(statsSection);

    const statsHeader = document.createElement("h4");
    statsHeader.innerText = "Stats";
    statsSection.appendChild(statsHeader);

    const statsContainer = document.createElement("div");
    statsContainer.classList.add("modal-stats-container");
    statsSection.appendChild(statsContainer);

    pokemon.stats.forEach((stat) => { // In the pokemon obj, loop through each stat in the `stats key`.
      const uniqueStatContainer = document.createElement("div");
      uniqueStatContainer.classList.add("horizontal-stat-container");
      statsContainer.appendChild(uniqueStatContainer);

      const statName = document.createElement("p");
      statName.classList.add("stat-name");
      statName.innerText = stat.name;
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

    // Moves

    const movesContainer = document.createElement("div");
    movesContainer.classList.add("party-pokemon-moves");
    detailsContainer.appendChild(movesContainer);

    const movesHeader = document.createElement("h4");
    movesHeader.innerText = "Moves";
    movesContainer.appendChild(movesHeader);

    for (let i = 0; i < pokemon.movesEquipped.length; i++) { // Creates the moves containers, for the amount of moves equiped.
      const moveElement = document.createElement("p");
      moveElement.classList.add("party-pokemon-input");
      moveElement.setAttribute("property", "move")
      moveElement.innerText = pokemon.movesEquipped[i].name;
      moveElement.addEventListener("click", () => {
        changeProperty(index, "move", i)
      });
      movesContainer.appendChild(moveElement);
    }
    for (let i = 0; i < 4 - pokemon.movesEquipped.length; i++) { // Creates the remaining moves if there aren't 4 moves. already set.
      const moveElement = document.createElement("p");
      moveElement.classList.add("party-pokemon-input");
      moveElement.innerText = "---";
      moveElement.addEventListener("click", () => {
        changeProperty(index, "move", i)
      });
      movesContainer.appendChild(moveElement);
    }
  })  // Finished making party list elements.

  if (party.currentSize < party.maxSize) { // If there are still slots for pokemon
    const pokemonAdd = document.createElement("button");
    pokemonAdd.id = "add-pokemon"
    pokemonAdd.innerText = "Add a Pokemon";
    pokemonAdd.addEventListener("click", () => {
      navUpdate("pokedex-nav");
      updatePage("pokedex-nav")
    })
    partyDetailsContainer.appendChild(pokemonAdd);
  }
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








