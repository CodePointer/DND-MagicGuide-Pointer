App({
  globalData: {
    favorites: [],
    // spells: [],
  },

  onLaunch() {
    this.prepareFavorite();
  },

  loadSpells() {
    // this.globalData.spells = allSpells;
  },

  prepareFavorite() {
    const cached = wx.getStorageSync('userFavorite');
    if (!cached) {
      this.globalData.favorites = [];
    } else {
      this.globalData.favorites = cached;
    }
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
    wx.setStorageSync('userFavorites', newFavorites);
  }
})