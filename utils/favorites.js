// utils/favorites.js

const STORAGE_KEY = 'userFavorites';
const DEFAULT_FAVORITES = {
  spells: [],
  monsters: [],
  items: [],
};


function loadState() {
  const cached = wx.getStorageSync(STORAGE_KEY);
  if (!cached) {
    return DEFAULT_FAVORITES;
  } else {
    return cached;
  }
}


let state = loadState();


function saveState() {
  wx.setStorageSync(STORAGE_KEY, state);
}


function getFavorites(type) {
  return state[type] || [];
}


function getAllFavorites() {
  return state;
}


function isFavorite(type, id) {
  const favorites = getFavorites(type);
  return favorites.includes(id);
}


function changeFavorite(type, id, marked) {
  let favorites = getFavorites(type);
  const isFav = favorites.includes(id);
  if (isFav && !marked) {
    favorites = favorites.filter(itemId => itemId !== id);
    // console.log('remove favorite', type, id);
  } else if (!isFav && marked) {
    favorites.push(id);
    // console.log('add favorite', type, id);
  } else {
    return;
  }
  state[type] = favorites;
  saveState();
}


function exportFavorites() {
  return JSON.stringify(state);
}


function importFavorites(favStr) {
  if (!favStr) return false;
  try {
    const newFavorites = JSON.parse(favStr);
    state.spells = Array.isArray(newFavorites.spells) ? newFavorites.spells : [];
    state.monsters = Array.isArray(newFavorites.monsters) ? newFavorites.monsters : [];
    state.items = Array.isArray(newFavorites.items) ? newFavorites.items : [];
    saveState();
    return true;
  } catch (err) {
    // console.warn('JSON parse error:', err);
    return false;
  }
}


module.exports = {
  getFavorites,
  getAllFavorites,
  isFavorite,
  changeFavorite,
  exportFavorites,
  importFavorites,
};
