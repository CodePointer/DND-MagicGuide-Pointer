// pages/common/card-list/card-list.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    label: String,
    totalNumber: Number,
    items: Array
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onItemCellClick(e) {
      const { itemId } = e.detail;
      // console.log('Cell clicked:', itemId);
      this.triggerEvent('itemCellClick', {
        itemId: itemId,
      });
    },
    onItemMarkedChange(e) {
      const { itemId, marked } = e.detail;
      this.triggerEvent('itemMarkChange', {
        itemId: itemId,
        marked: marked
      });
    },
    onLoadMoreButtonClick(e) {
      // console.log(e);
      this.triggerEvent('loadMoreItem');
    }
  }
})