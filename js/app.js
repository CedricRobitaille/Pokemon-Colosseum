const rootUrl = "https://pokeapi.co/api/v2/"
let offset = 0;
let limit = 20;





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








fetchData("pokemon/22");