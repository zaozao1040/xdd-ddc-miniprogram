const mealTypeMap = (key) => {
  const tmp = {
    BREAKFAST: "早餐",
    LUNCH: "午餐",
    DINNER: "晚餐",
    NIGHT: "夜宵"
  };
  return tmp[key];
};
export {
  mealTypeMap
};
