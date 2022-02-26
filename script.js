const list = document.querySelector("ul.list");
const showMoreItemsButton = document.querySelector(".button__expand");
const byName = document.querySelector('input#byname');
const byFilm = document.querySelector('input#byfilm')
const filters = document.querySelectorAll("input[type='radio']");
const header = document.querySelector(".details__header");
const content = document.querySelector(".details__content");
let listStartInex = 0;
let listEndIndex = 9;
let currentApiPage = 1;
const characterByFilm = [];
let temp = [];

async function fetchData(endpoint) {
  const rawData = await fetch(endpoint).catch((err) => console.error(err));
  const data = await rawData.json().catch((err) => console.error(err));
  return data;
}

async function generateCharactersList(filmindex = null){
  if(byFilm.checked){
    //generate char. list by selected Film
    const people = await Promise.all(characterByFilm[filmindex].map(fetchData));
    list.innerHTML = [...people
      .map(
        (person) => `
          <li>
          <button class="list__button button--character" data-url=${person.url}>
          ${person.name}
          </button>
          </li>`
          )
          .join('')].join('');
  }
  else {
    // generate char. list by Name
    // increment API page
    if (listEndIndex > currentApiPage * 10) currentApiPage++;
    const endpoint = `https://swapi.dev/api/people/?page=${currentApiPage}`;
    const people = await fetchData(endpoint).catch((err) => console.error(err));
    if (!people) return;
    const arrayStartIndex =
    currentApiPage > 1 ? listStartInex % 10 : listStartInex;
    const arrayEndIndex = currentApiPage > 1 ? listEndIndex % 10 : listEndIndex;
    temp = temp.concat([...people.results
    .map(
      (person) => `
        <li>
        <button class="list__button button--character" data-url=${person.url}>
        ${person.name}
        </button>
        </li>`
        )
        .slice(arrayStartIndex, arrayEndIndex + 1).join('')]);
        list.innerHTML =  temp.join('');
      }
}

async function generateFilmList(){
  const endpoint = `https://swapi.dev/api/films/`;
  const films = await fetchData(endpoint).catch((err) => console.error(err));
  let filmIndex = 0; 
  const title = films.results.map(film => `<li><button class="list__button button--film" data-filmIndex=${filmIndex++}>${film.title}</button></li>`).join('');
  list.innerHTML = title;
  films.results.map(film => characterByFilm.push(film.characters));
}

function showMoreItems() {
  listStartInex = listEndIndex + 1;
  listEndIndex = listEndIndex + 5;
  generateCharactersList();
}

function getDetailsFromArray(items) {
  return Promise.all(items.map(fetchData));
}

function getNameOrTitle({ name, title }) {
  return name || title;
}


async function populatePersonDetails(endpoint) {
  const person = await fetchData(endpoint);
  const homeworld = await fetchData(person.homeworld);
  const films = (await getDetailsFromArray(person.films)).map(getNameOrTitle).map(item => `<li>${item}</li>`);
  const starships = (await getDetailsFromArray(person.starships)).map(
    getNameOrTitle
  ).map(item => `<li>${item}</li>`);
  const vehicles = (await getDetailsFromArray(person.vehicles)).map(
    getNameOrTitle
  ).map(item => `<li>${item}</li>`);

  if (!person) return;
  header.textContent = person.name;
  content.innerHTML = `
  <span>Biographical information</span>  
  <ul class="details__list list--biograpfical">
      <li>Height - ${person.height}</li>
      <li>Mass - ${person.mass}</li>
      <li>Hair color - ${person.hair_color}</li>
      <li>Skin color - ${person.skin_color}</li>
      <li>Eye color - ${person.eye_color}</li>
      <li>Birthyear - ${person.birth_year}</li>
      <li>Gender - ${person.gender}</li>
      <li>Homeworld - ${homeworld.name}</li>
    </ul>
    <span>Films</span>
    <ol class="details__list list--films">${films.join("")}</ol>
    <span>Starships </span>
    <ul class="details__list list--starships">${starships.join("") || "<li>- nothing -</li>"}</ul>
    <span>Vehicles</span>
    <ul class="details__list list--vehicles">${vehicles.join("")|| "<li>- nothing -</li>"}</ul>
  `;
}

function showDetails(e) {
  const url = e.target.dataset.url;
  populatePersonDetails(url);
}

function showCharactersByFilm(e){
  console.log(e.target.dataset.filmindex);
  generateCharactersList(e.target.dataset.filmindex)
}

function showList(){
  if(byFilm.checked){
    showMoreItemsButton.classList.add('button--hidden');
    temp = [];
    generateFilmList();
  }else if(byName.checked){
    listStartInex = 0;
    listEndIndex = 9;
    currentApiPage = 1;
    temp = [];
    showMoreItemsButton.classList.remove('button--hidden');
    generateCharactersList();
  }
}

showMoreItemsButton.addEventListener("click", showMoreItems);
list.addEventListener("click", (e) => {
  e.target.matches('button.button--character') &&  showDetails(e);
  e.target.matches('button.button--film') &&  showCharactersByFilm(e);
});
filters.forEach(filter => filter.addEventListener('change', showList))

showList();

