import {BIGINT} from "sequelize";

import {defineModel} from "../../db";
import map from "../map";
import user from "../user";

const collet = defineModel("collet", {
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
// user.belongsToMany(map, {through: collet});
// map.belongsToMany(user, {through: collet});
user.hasMany(collet);
collet.belongsTo(user);
map.hasMany(collet);
collet.belongsTo(map);

export default collet;
