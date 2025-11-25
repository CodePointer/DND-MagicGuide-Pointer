// pages/mine/mine.js
import Toast from '../../miniprogram_npm/tdesign-miniprogram/toast/index';
import {
  changeFavorite, 
  exportFavorites,
  importFavorites,
  getFavorites,
} from '../../utils/favorites';
import { 
  processSpellData, 
  processMonsterData 
} from '../../utils/dataprocessor';
import { VERSION } from '../../config';
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

    footNoteText: `v${VERSION} | 谢谢Star喵`
  },

  allSpellsMap: {},
  allSpellsInfo: [],
  allMonstersMap: {},
  allMonstersInfo: [],

  flushPage() {
    this.prepareAll();
    this.updateMarkedAll();
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
   * Import & Export
   */
  onExportFavoriates() {
    wx.setClipboardData({
      data: exportFavorites(),
      success: (res) => {
        wx.hideToast();
        this.showToast(`成功导出至剪贴板`, 'success');
      },
      fail: (err) => {
        this.showToast(`导出失败`, 'error');
      },
      complete: (res) => this.flushPage(),
    });
  },
  onImportFavoriates() {
    wx.getClipboardData({
      success: (res) => {
        res = importFavorites(res.data);
        if (!res) {
          this.showToast(`导入失败，剪贴板数据格式错误`, 'error');
          return;
        }
        this.showToast(`已从剪贴板导入`, 'success');
      },
      fail: (err) => {
        this.showToast(`导入失败`, 'error');
      },
      complete: (res) => {
        this.flushPage();
      },
    })
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