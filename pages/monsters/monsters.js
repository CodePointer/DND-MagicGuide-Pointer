// pages/monsters/monsters.js
import { isFavorite, changeFavorite } from '../../utils/favorites';
import { processMonsterData } from '../../utils/dataprocessor';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'monsters',

    searchValue: '',
    selectedFilters: null,

    filteredMonstersInfo: [],

    selectedMonster: null,
    showPopup: false
  },

  allMonstersMap: {},
  allMonstersInfo: [],

  flushPage() {
    this.prepareAllMonsters();
    this.applyFilter();
    // this.loadShowingMonsters(false);
  },

  /**
   * filteredMonsters & ShowingMonsters
   */
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
  applyFilter() {
    const { searchValue, selectedFilters } = this.data;
    const parseCR = (crString) => {
      if (crString.includes('/')) {
        const [num, den] = crString.split('/').map(parseFloat);
        return num / den;
      } else {
        return parseFloat(crString);
      }
    };

    const filteredMonstersInfo = this.allMonstersInfo
      .filter(monster => {
        const matchName = searchValue == '' ||
          monster.chineseName.includes(searchValue) ||
          monster.englishName.toLowerCase().includes(searchValue.toLowerCase());
        if (selectedFilters == null) return matchName;
        const matchSize = monster.size.some(size => selectedFilters.size.includes(size));
        const matchType = selectedFilters.type.includes(monster.type);
        const matchAlignment = selectedFilters.alignment.includes(monster.alignment);
        const matchPb = selectedFilters.pb.includes(monster.proficiencies);
        const matchCr = parseCR(monster.challengeRating) >= selectedFilters.crValue[0] &&
          parseCR(monster.challengeRating) <= selectedFilters.crValue[1];
        const matchSwarm = !selectedFilters.special.includes('0') || monster.swarm;
        return matchName && matchSize && matchType &&
          matchAlignment && matchPb && matchCr && matchSwarm;
      })
      .map(monster => ({
        ...monster,
        id: monster.monsterId,
        marked: isFavorite('monsters', monster.monsterId),
      }));
    this.setData({ filteredMonstersInfo: filteredMonstersInfo });
  },
  // loadShowingMonsters(appendFlag) {
  //   const currentMonsterNum = appendFlag ? this.data.showingMonsters.length : 0;
  //   const toSliceNum = Math.min(
  //     this.data.filteredMonsters.length,
  //     currentMonsterNum + this.data.pageSize
  //   );
  //   this.setData({
  //     showingMonsters: this.data.filteredMonsters.slice(0, toSliceNum),
  //   });
  // },

  /**
   * Monster-filter
   */
  onFilterChange(e) {
    const { searchValue, selectedFilters } = e.detail;
    this.setData({
      searchValue: searchValue,
      selectedFilters: selectedFilters,
    });
    this.applyFilter();
    // this.loadShowingMonsters(false);
  },

  /**
   * Monster popup
   */
  onMonsterCellClick(e) {
    const { itemId } = e.detail;
    const monster = this.allMonstersMap[itemId];
    if (monster) {
      this.setData({
        selectedMonster: monster,
        showPopup: true
      });
    }
  },
  onClosePopup() {
    this.setData({
      showPopup: false,
      selectedMonster: null
    });
  },

  /**
   * Monster list
   */
  onLoadMoreMonsterClick(e) {
    // this.loadShowingMonsters(true);
  },
  onMonsterSwitchChange(e) {
    const { itemId, marked } = e.detail;
    changeFavorite('monsters', itemId, marked);
    const idx = this.data.filteredMonstersInfo.findIndex(mo => mo.monsterId === itemId);
    if (idx >= 0) {
      this.setData({
        [`filteredMonstersInfo[${idx}].marked`]: marked,
      });
    };
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
      tabbar.setData({ value: 'monsters' });
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