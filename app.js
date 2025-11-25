import { initialize } from './utils/favorites';

App({
  globalData: {
    
  },

  onLaunch() {
    initialize();
  },
})