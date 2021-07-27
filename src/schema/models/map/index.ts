import {INTEGER, JSON, STRING} from "sequelize";

import {defineModel} from "../../db";

const map = defineModel("map", {
  creator: {
    allowNull: true,
    type: STRING(32),
  },
  mapName: {
    allowNull: true,
    type: STRING(255),
  },
  mapData: {
    type: JSON,
    allowNull: false,
  },
  time: {
    type: STRING(20),
    allowNull: false,
  },
  playerHP: {
    type: INTEGER,
    defaultValue: 0,
    allowNull: true,
  },
  praiseNumber: {
    type: INTEGER,
    defaultValue: 0,
    allowNull: true,
  },
});

export default map;
