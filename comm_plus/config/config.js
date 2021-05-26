const app = getApp();

const baseUrl = app.globalData.baseUrlFlyingCarpet; // 对接全局统一配置，正常情况下应该用这个！！！！！
const baseUrlPlus = app.globalData.baseUrl; // 对接全局统一配置，正常情况下应该用这个！！！！！

export default {
  baseUrl,
  baseUrlPlus,
};
