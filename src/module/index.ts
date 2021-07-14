import map from "./models/map";
const models = {
  map,
};

console.log("加载了", Object.keys(models).join("/"), "主模块(接口)");

export default models;
