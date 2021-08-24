import {INTEGER, JSON, STRING, TINYINT} from "sequelize";

import {defineModel} from "../../db";

const map = defineModel("map", {
  creator: {
    allowNull: true,
    type: STRING(32),
  },
  creatorId: {
    allowNull: false,
    type: INTEGER
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
  stepsPas: {
    type: INTEGER,
    defaultValue: 0,
    allowNull: true,
  },
  processData: {
    type: JSON,
    allowNull: true,
  },
  mapKingId: {
    type: INTEGER,
    allowNull: true,
  },
  regretDisabled: {
    type: TINYINT,
    defaultValue: 0,
    allowNull: true,
  },
});

export default map;
