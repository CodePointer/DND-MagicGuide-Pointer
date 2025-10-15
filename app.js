import { ENV_ID } from './config.js';

App({
  globalData: {
    userInfo: null,
    favorites: [],
    spells: null,
    spellsPromise: null,
    onProgressUpdate: null
  },

  setProgressListener(callback) {
    this.globalData.onProgressUpdate = callback;
  },

  onLaunch() {
    wx.cloud.init({
      env: ENV_ID,
      traceUser: true,
    });
    this.login();
  },

  async loadSpells() {
    if (this.globalData.spells) {
      return this.globalData.spells;
    }
    if (this.globalData.spellsPromise) {
      return this.globalData.spellsPromise;
    }

    const db = wx.cloud.database();
    const countRes = await db.collection('spells').count();
    const batchsize = 20;
    const batchTimes = Math.ceil(countRes.total / batchsize);
    // const batchTimes = 5;
    const spells = [];

    this.globalData.spellsPromise = (async () => {
      for (let i = 0; i < batchTimes; i++) {
        const res = await db.collection('spells')
          .skip(i * batchsize)
          .limit(batchsize)
          .get();
        spells.push(...res.data);
        const progress = Math.round(((i + 1) / batchTimes) * 100);
        if (this.globalData.onProgressUpdate) {
          this.globalData.onProgressUpdate(progress)
        }
      }
      this.globalData.spells = spells;
      this.globalData.spellsPromise = null;
      return spells;
    })();
    return this.globalData.spellsPromise;
  },

  async login() {
    const db = wx.cloud.database();
    try {
      const res = await wx.cloud.callFunction({ name: 'getOpenId' });
      const openId = res.result.openid;
      const userRes = await db.collection('users').where({ _openid: openId }).get();
      let userData;
      if (userRes.data.length == 0) {
        const newUser = {
          favorites: [],
          created_at: db.serverDate(),
          updated_at: db.serverDate()
        };
        const addRes = await db.collection('users').add({ data: newUser });
        userData = { ...newUser, _id: addRes._id, _openid: addRes._openid };
      } else {
        userData = userRes.data[0];
      }
      this.globalData.userInfo = userData;
      this.globalData.favorites = userData.favorites || [];
    } catch (err) {
      console.log('Login failed', err);
    }
  },

  async updateFavorite(spellId, marked) {
    let newFavorites = this.globalData.favorites;
    const isFavorite = this.globalData.favorites.includes(spellId);
    if (isFavorite && !marked) {
      newFavorites = newFavorites.filter(id => id !== spellId);
    } else if (!isFavorite && marked) {
      newFavorites.push(spellId);
    } else {
      return;
    }
    await this.updateFavorites(newFavorites);
  },

  async updateFavorites(newFavorites) {
    const db = wx.cloud.database();
    const { _id } = this.globalData.userInfo;
    this.globalData.favorites = newFavorites;
    await db.collection('users').doc(_id).update({
      data: { 
        favorites: newFavorites,
        updated_at: db.serverDate()
      },
    }).catch(() => console.warn('收藏失败'));
  }
})