import {BIGINT} from "sequelize";

import {defineModel} from "../../db";
import map from "../map";
import user from "../user";

const collect = defineModel("collect", {
  userId: {
    type: BIGINT,
    references: {
      model: user,
      key: "id",
    },
  },
  mapId: {
    type: BIGINT,
    references: {
      model: map,
      key: "id",
    },
  },
});
// user.belongsToMany(map, {through: collect});
// map.belongsToMany(user, {through: collect});
user.hasMany(collect);
collect.belongsTo(user);
map.hasMany(collect);
collect.belongsTo(map);

export default collect;
