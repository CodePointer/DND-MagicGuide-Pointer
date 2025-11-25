// pages/common/card-list/card-list.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    label: String,
    objectType: String, // 'spell' or 'monster'
    items: {
      type: Array,
      value: []
    },
    stepSize: {
      type: Number,
      value: 16
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    visibleItems: [],
    loadedCount: 0,
    hasMore: false,
  },

  observers: {
    'items': function(items) {
      this.setData({
        visibleItems: items.slice(0, this.data.stepSize),
        loadedCount: Math.min(this.data.stepSize, items.length),
        hasMore: items.length > this.data.stepSize
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    resetPagination(allItems) {
      const step = this.data.stepSize;
      const firstCount = Math.min(step, allItems.length);
      const firstSlice = allItems.slice(0, firstCount);
      this.setData({
        visibleItems: firstSlice,
        loadedCount: firstSlice.length,
        hasMore: allItems.length > step,
      });
    },

    onLoadMore() {
      const allItems = this.data.items || [];
      const { loadedCount, stepSize } = this.data;
      const nextCount = Math.min(
        loadedCount + stepSize, 
        allItems.length
      );
      const nextSlice = allItems.slice(0, nextCount);
      this.setData({
        visibleItems: nextSlice,
        loadedCount: nextSlice.length,
        hasMore: allItems.length > nextCount,
      });
    },

    onItemCellClick(e) {
      const { itemId } = e.detail;
      // console.log('Cell clicked:', itemId);
      this.triggerEvent('itemCellClick', {
        itemId: itemId,
        objectType: this.properties.objectType
      });
    },
    onItemMarkedChange(e) {
      const { itemId, marked } = e.detail;
      this.triggerEvent('itemMarkChange', {
        itemId: itemId,
        objectType: this.properties.objectType,
        marked: marked
      });
    },
    onLoadMoreButtonClick(e) {
      // console.log(e);
      this.onLoadMore();

      this.triggerEvent('loadMoreItem', {
        objectType: this.properties.objectType
      });
    }
  }
})