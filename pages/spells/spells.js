// pages/spells/spells.js
import { isFavorite, changeFavorite } from '../../utils/favorites';
import { processSpellData } from '../../utils/dataprocessor';


Page({
  /**
   * 页面的初始数据
   */
  data: {
    activateTab: 'spells',

    searchValue: '',
    selectedFilters: null,
    // allSpells: [],
    filteredSpellsInfo: [],
    // showingSpells: [],
    // pageSize: 16,

    selectedSpell: null,
    showPopup: false
  },

  allSpellsMap: {},
  allSpellsInfo: [],

  flushPage() {
    this.prepareAllSpells();
    this.applyFilter();
    // this.loadShowingSpells(false);
  },

  /**
   * filteredSpells & ShowingSpells
   */
  prepareAllSpells() {
    const cached = wx.getStorageSync('allSpells');
    // console.log('cached', cached);
    if (!cached) {
      // console.log('navigate');
      wx.navigateTo({
        url: '/subpackages/spellData/dataLoader/dataLoader',
      });
    } else {
      const { allSpellsMap, allSpellsInfo } = processSpellData(cached);
      this.allSpellsMap = allSpellsMap;
      this.allSpellsInfo = allSpellsInfo;
    }
  },
  applyFilter() {
    const { searchValue, selectedFilters } = this.data;
    const filteredSpellsInfo = this.allSpellsInfo
      .filter(spell => {
        const matchName = searchValue == '' ||
          spell.chineseName.includes(searchValue) ||
          spell.englishName.toLowerCase().includes(searchValue.toLowerCase());
        if (selectedFilters == null) return matchName;
        const matchLevel = selectedFilters.level.includes(`${spell.level}`);
        const matchClass = selectedFilters.class.some(opt => spell.classes.includes(opt));
        const matchSchool = selectedFilters.school.includes(spell.school);
        const matchSource = selectedFilters.source.includes(spell.source);
        const matchConcentration = !selectedFilters.special.includes('0') || spell.concentration;
        const matchRitual = !selectedFilters.special.includes('1') || spell.ritual;
        return matchName && matchLevel && matchClass && 
          matchSchool && matchSource && matchConcentration && matchRitual;
      })
      .map(spell => ({
        ...spell,
        id: spell.spellId,
        marked: isFavorite('spells', spell.spellId),
      }));
    this.setData({ filteredSpellsInfo: filteredSpellsInfo });
  },
  // loadShowingSpells(appendFlag) {
  //   const currentSpellNum = appendFlag ? this.data.showingSpells.length : 0;
  //   const toSliceNum = Math.min(
  //     this.data.filteredSpells.length, 
  //     currentSpellNum + this.data.pageSize,
  //   );
  //   this.setData({
  //     showingSpells: this.data.filteredSpells.slice(0, toSliceNum),
  //   });
  // },

  /**
   * Spell-filter
   */
  onFilterChange(e) {
    const { searchValue, selectedFilters } = e.detail;
    this.setData({
      searchValue: searchValue,
      selectedFilters: selectedFilters,
    });
    this.applyFilter();
    // this.loadShowingSpells(false);
  },

  /**
   * Spell popup
   */
  onSpellCellClick(e) {
    const { itemId } = e.detail;
    const spell = this.allSpellsMap[itemId];
    if (spell) {
      this.setData({
        selectedSpell: spell,
        showPopup: true
      });
    }
  },
  onClosePopup() {
    this.setData({ showPopup: false });
  },

  /**
   * Spell list
   */
  onLoadMoreSpellClick(e) {
    // this.loadShowingSpells(true);
  },
  onSpellSwitchChange(e) {
    const { itemId, marked } = e.detail;
    changeFavorite('spells', itemId, marked);
    const idx = this.data.filteredSpellsInfo.findIndex(sp => sp.spellId === itemId);
    if (idx >= 0) {
      this.setData({
        [`filteredSpellsInfo[${idx}].marked`]: marked,
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.flushPage();
  },  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const tabbar = this.getTabBar();
    if (tabbar) {
      tabbar.setData({ value: 'spells' });
    }
    this.flushPage();
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