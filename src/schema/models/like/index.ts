import {BIGINT} from "sequelize";

import {defineModel} from "../../db";
import map from "../map";
import user from "../user";

const like = defineModel("like", {
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
user.belongsToMany(map, {through: like});
map.belongsToMany(user, {through: like});
user.hasMany(like);
like.belongsTo(user);
map.hasMany(like);
like.belongsTo(map);
export default like;
