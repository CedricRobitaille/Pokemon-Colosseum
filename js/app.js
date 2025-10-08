const rootUrl = "https://pokeapi.co/api/v2/"
let offset = 0;
let limit = 20;



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

















const fetchData = async (params) => {
  try {
    const response = await fetch(rootUrl + params + `?offset=${offset}&limit=${limit}`);
    if (!response.ok) { // TRUE = Status code within 200-299 | FALSE = Status code outside 200-299 (ie: 404 -> Not Found)
      throw new Error(response.status) // Sends the Status Code to the catch.
    }
    const data = await response.json();
    console.log(data)
    return(data);
  } catch (error) {
    console.log(error)
  }
}








generatePokedex(fetchData("pokemon/129"));