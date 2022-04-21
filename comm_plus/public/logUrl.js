// 后端报错情况下打印日志
const logUrlErrorList = ["/order/generateOrder", "/v3/cart/previewOrder"];
// 后端任何情况下都打印日志
const logUrlInfoList = ["/v3/cart/previewOrder"];

export { logUrlErrorList, logUrlInfoList };
