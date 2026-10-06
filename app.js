const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=24';
const list = document.querySelector('#pokemon-list');
const status = document.querySelector('#status');
const search = document.querySelector('#search');
const typeFilter = document.querySelector('#type-filter');
const sort = document.querySelector('#sort');
let pokemon = [];

const setStatus = (message, error = false) => { status.textContent = message; status.classList.toggle('error', error); };

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

const render = () => {
  const query = search.value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const visible = pokemon.filter((item) => item.name.includes(query) && (selectedType === 'all' || item.types.includes(selectedType))).sort((a, b) => sort.value === 'name' ? a.name.localeCompare(b.name) : a.id - b.id);
  list.innerHTML = visible.map((item) => `<article class="pokemon-card"><span class="pokemon-number">#${String(item.id).padStart(3, '0')}</span><img class="pokemon-image" src="${item.image}" alt="${escapeHtml(titleCase(item.name))}" loading="lazy" /><h2>${escapeHtml(item.name)}</h2><div class="types">${item.types.map((type) => `<span class="type">${escapeHtml(type)}</span>`).join('')}</div><div class="pokemon-meta"><span>Height<strong>${item.height / 10} m</strong></span><span>Weight<strong>${item.weight / 10} kg</strong></span></div></article>`).join('');
  setStatus(`${visible.length} Pokemon displayed`);
};

const loadPokemon = async () => {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('API request failed');
    const index = await response.json();
    pokemon = await Promise.all(index.results.map(async (item) => {
      const detail = await (await fetch(item.url)).json();
      return { id: detail.id, name: detail.name, image: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default, types: detail.types.map(({ type }) => type.name), height: detail.height, weight: detail.weight };
    }));
    [...new Set(pokemon.flatMap((item) => item.types))].sort().forEach((type) => typeFilter.insertAdjacentHTML('beforeend', `<option value="${type}">${titleCase(type)}</option>`));
    render();
  } catch (error) {
    setStatus('Pokemon ma’lumotlarini yuklab bo‘lmadi. Internet aloqasini tekshiring.', true);
  }
};

[search, typeFilter, sort].forEach((control) => control.addEventListener('input', render));
loadPokemon();
