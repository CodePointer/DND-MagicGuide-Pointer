// pages/mine/mine.js
import { VERSION } from '../../config.js';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activateTab: 'mine',
    loading: false,
    progress: 0,

    markedSpells: [],
    showingSpells: [],
    pageSize: 32,

    selectedSpell: null,
    showPopup: false,

    version: VERSION
  },

  /**
   * markedSpells & showingSpells
   */
  async prepareAllSpells() {
    app.setProgressListener((progress) => {
      this.setData({ progress });
    });
    this.setData({
      loading: true,
    });
    await app.loadSpells();
    this.setData({
      loading: false,
    });
  },
  updateMarkedSpells() {
    const favorites = new Set(app.globalData.favorites);
    this.setData({
      markedSpells: app.globalData.spells.filter(opt => favorites.has(opt.spellId)).map(opt => {
        return { ...opt, marked: true };
      }),
    });
  },
  loadShowingSpells(appendFlag) {
    const currentSpellNum = appendFlag ? this.data.showingSpells.length : 0;
    const toSliceNum = Math.min(
      this.data.markedSpells.length, 
      currentSpellNum + this.data.pageSize,
    )
    this.setData({
      showingSpells: this.data.markedSpells.slice(0, toSliceNum),
    });
  },
  changeFavoriate(spellId, marked) {
    // 1. Update favorites
    app.updateFavorite(spellId, marked);
    // 2. Update locally
    const updateMarkedStatus = (arrName) => {
      const idx = this.data[arrName].findIndex(sp => sp.spellId === spellId);
      if (idx >= 0) {
        this.setData({
          [`${arrName}[${idx}].marked`]: marked,
        });
      };
    };
    updateMarkedStatus('markedSpells');
    updateMarkedStatus('showingSpells');
  },

  /**
   * Spell popup
   */
  onSpellCellClick(e) {
    const { spellId } = e.detail;
    // console.log('Cell clicked:', spellId);
    const spell = this.data.showingSpells.find(s => s.spellId == spellId);
    if (spell) {
      this.setData({
        selectedSpell: spell,
        showPopup: true
      });
      console.log(spell.description);
    }
  },
  onClosePopup() {
    this.setData({ showPopup: false });
  },

  /**
   * Spell list
   */
  onLoadMoreSpellClick(e) {
    this.loadShowingSpells(true);
  },
  onSpellSwitchChange(e) {
    const { spellId, marked } = e.detail;
    this.changeFavoriate(spellId, marked);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await this.prepareAllSpells();
    this.updateMarkedSpells();
    this.loadShowingSpells(false);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    const tabbar = this.getTabBar();
    if (tabbar) {
      tabbar.setData({ value: 'mine' });
    }
    await this.prepareAllSpells();
    this.updateMarkedSpells();
    this.loadShowingSpells(false);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})