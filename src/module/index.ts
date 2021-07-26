import map from "./models/map";
import user from "./models/user";
import like from "./models/like";

const models = {
  map,
  user,
  like,
};

console.log("加载了", Object.keys(models).join("/"), "主模块(接口)");

export default models;
