// pages/mine/mine.js
import Toast from '../../miniprogram_npm/tdesign-miniprogram/toast/index';
import {
  changeFavorite, 
  getFavorites 
} from '../../utils/favorites';
import { 
  processSpellData, 
  processMonsterData 
} from '../../utils/dataprocessor';

const VERSION = '0.2.0-beta';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activateTab: 'mine',
    loading: false,
    progress: 0,

    activePanels: [],

    markedSpellsInfo: [],
    markedMonstersInfo: [],

    selectedObject: null,
    selectedObjectType: null,
    showPopup: false,

    version: VERSION
  },

  allSpellsMap: {},
  allSpellsInfo: [],
  allMonstersMap: {},
  allMonstersInfo: [],

  flushPage() {
    this.prepareAll();
    this.updateMarkedAll();
    // this.loadShowingSpells(false);
    // this.loadShowingMonsters(false);
  },

  /**
   * collapse panel
   */
  handlePanelChange(e) {
    // console.log(e);
    this.setData({
      activePanels: e.detail.value,
    });
  },

  /**
   * all data prepare
   */
  prepareAll() {
    this.prepareAllSpells();
    this.prepareAllMonsters();
  },
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
  prepareAllMonsters() {
    const cached = wx.getStorageSync('allMonsters');
    if (!cached) {
      wx.navigateTo({
        url: '/subpackages/monsterData/dataLoader/dataLoader',
      });
    } else {
      const { allMonstersMap, allMonstersInfo } = processMonsterData(cached);
      this.allMonstersMap = allMonstersMap;
      this.allMonstersInfo = allMonstersInfo;
    }
  },

  /**
   * Updated markedSpells & markedMonsters
   */
  updateMarkedAll() {
    const spellFavoritesSet = new Set(getFavorites('spells'));
    const monsterFavoritesSet = new Set(getFavorites('monsters'));
    this.setData({

      markedSpellsInfo: this.allSpellsInfo.filter(opt => {
        return spellFavoritesSet.has(opt.spellId);
      }).map(opt => ({
        ...opt, 
        marked: true
      })),

      markedMonstersInfo: this.allMonstersInfo.filter(opt => {
        return monsterFavoritesSet.has(opt.monsterId);
      }).map(opt => ({
        ...opt, 
        marked: true
      })),

    });
  },

  /**
   * Change monster/spell favorite
   */
  // changeFavoriate(key, id, marked) {
  //   // Helper function to update marked status locally
  //   const updateMarkedStatusLocally = (arrName) => {
  //     const idx = this.data[arrName].findIndex(sp => sp.spellId === spellId);
  //     if (idx >= 0) {
  //       this.setData({
  //         [`${arrName}[${idx}].marked`]: marked,
  //       });
  //     };
  //   };
  //   // 1. Update favorites
  //   app.updateFavorite(key, id, marked);
  //   // 2. Update locally
  //   if (key === 'monsters') {
  //     updateMarkedStatusLocally('markedMonsters');
  //     updateMarkedStatusLocally('showingMonsters');
  //   } else if (key === 'spells') {
  //     updateMarkedStatusLocally('markedSpells');
  //     updateMarkedStatusLocally('showingSpells');
  //   }
  // },

  /**
   * loadMoreMonsters & loadMoreSpells
   */
  // loadShowingSpells(appendFlag) {
  //   const currentSpellNum = appendFlag ? this.data.showingSpells.length : 0;
  //   const toSliceNum = Math.min(
  //     this.data.markedSpells.length, 
  //     currentSpellNum + this.data.pageSize,
  //   )
  //   this.setData({
  //     showingSpells: this.data.markedSpells.slice(0, toSliceNum),
  //   });
  // },
  // loadShowingMonsters(appendFlag) {
  //   const currentMonsterNum = appendFlag ? this.data.showingMonsters.length : 0;
  //   const toSliceNum = Math.min(
  //     this.data.markedMonsters.length, 
  //     currentMonsterNum + this.data.pageSizeMonsters,
  //   )
  //   this.setData({
  //     showingMonsters: this.data.markedMonsters.slice(0, toSliceNum),
  //   });
  // },

  /**
   * Import & Export
   */
  checkFavorites(spellIds) {
    const allSpellIds = new Set(this.data.allSpells.map(spell => spell.spellId));
    const validSpellIds = spellIds.filter(id => allSpellIds.has(id));
    if (validSpellIds.length > 0) {
      app.updateFavoriteAll({
        spells: validSpellIds,
        monsters: [],
        items: [],
      });
    }
    return validSpellIds;
  },
  getFavoritesStr() {
    return app.globalData.favorites.join(',');
  },
  showToast(message, theme) {
    return Toast({
      context: this,
      selector: '#t-toast',
      message: message,
      theme: theme,
      placement: 'bottom'
    });
  },
  onImportFavoriates() {
    wx.getClipboardData({
      success: (res) => {
        const favorites = this.checkFavorites(res.data.split(','));
        this.showToast(`成功导入 ${favorites.length} 个法术`, 'success');
      },
      fail: (err) => {
        this.showToast(`导入失败`, 'error');
      },
      complete: (res) => {
        this.flushPage();
      },
    })
  },
  onExportFavoriates() {
    const favoritesLength = app.globalData.favorites.length;
    wx.setClipboardData({
      data: this.getFavoritesStr(),
      success: (res) => {
        wx.hideToast();
        this.showToast(`成功导出 ${favoritesLength} 个法术`, 'success');
      },
      fail: (err) => {
        this.showToast(`导出失败`, 'error');
      },
      complete: (res) => this.flushPage(),
    });
  },

  /**
   * Spell popup
   */
  onCellClick(e) {
    const { itemId, objectType } = e.detail;
    let object = null;
    if (objectType === 'monster') {
      object = this.allMonstersMap[itemId];
    } else if (objectType === 'spell') {
      object = this.allSpellsMap[itemId];
    }
    if (object) {
      this.setData({
        selectedObject: object,
        selectedObjectType: objectType,
        showPopup: true
      });
    }
  },
  onSwitchChange(e) {
    const { itemId, objectType, marked } = e.detail;
    if (objectType === 'monster') {
      // change monster favorite
      changeFavorite('monsters', itemId, marked);
      const idx = this.data.markedMonstersInfo.findIndex(mo => mo.monsterId === itemId);
      if (idx >= 0) {
        this.setData({
          [`markedMonstersInfo[${idx}].marked`]: marked,
        });
      };
    } else if (objectType === 'spell') {
      // change spell favorite
      changeFavorite('spells', itemId, marked);
      const idx = this.data.markedSpellsInfo.findIndex(sp => sp.spellId === itemId);
      if (idx >= 0) {
        this.setData({
          [`markedSpellsInfo[${idx}].marked`]: marked,
        });
      };
    }
  },
  onLoadMoreClick(e) {
    // const { objectType } = e.detail;
    // if (objectType === 'monster') {
    //   this.loadShowingMonsters(true);
    // } else if (objectType === 'spell') {
    //   this.loadShowingSpells(true);
    // }
  },
  onClosePopup() {
    this.setData({ 
      selectedObject: null,
      selectedObjectType: null,
      showPopup: false
    });
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.prepareAll();
    this.updateMarkedAll();
    // this.loadShowingSpells(false);
    // this.loadShowingMonsters(false);
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
    await this.prepareAll();
    this.updateMarkedAll();
    // this.loadShowingSpells(false);
    // this.loadShowingMonsters(false);
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