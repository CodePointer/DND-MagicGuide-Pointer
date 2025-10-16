App({
  globalData: {
    favorites: [],
    // spells: [],
  },

  onLaunch() {
  },

  loadSpells() {
    // this.globalData.spells = allSpells;
  },

  updateFavorite(spellId, marked) {
    let newFavorites = this.globalData.favorites;
    const isFavorite = this.globalData.favorites.includes(spellId);
    if (isFavorite && !marked) {
      newFavorites = newFavorites.filter(id => id !== spellId);
    } else if (!isFavorite && marked) {
      newFavorites.push(spellId);
    } else {
      return;
    }
    this.updateFavorites(newFavorites);
  },

  updateFavorites(newFavorites) {
    this.globalData.favorites = newFavorites;
  }
})