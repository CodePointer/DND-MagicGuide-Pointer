App({
  globalData: {
    favorites: {
      spells: [],
      monsters: [],
      items: [],
    },
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
      this.globalData.favorites = {
        spells: [],
        monsters: [],
        items: [],
      };
    } else {
      this.globalData.favorites = cached;
    }
  },

  updateFavorite(key, id, marked) {
    let newFavorites = this.globalData.favorites[key];
    const isFavorite = this.globalData.favorites[key].includes(id);
    if (isFavorite && !marked) {
      newFavorites = newFavorites.filter(itemId => itemId !== id);
    } else if (!isFavorite && marked) {
      newFavorites.push(id);
    } else {
      return;
    }
    this.globalData.favorites[key] = newFavorites;
    wx.setStorageSync('userFavorites', this.globalData.favorites);
  },

  updateFavoriteAll(newFavorites) {
    this.globalData.favorites = newFavorites;
    wx.setStorageSync('userFavorites', this.globalData.favorites);
  }
})