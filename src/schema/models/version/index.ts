import {STRING, BOOLEAN} from "sequelize";

import {defineModel} from "../../db";
const version = defineModel("version", {
  versionId: STRING(32),
  publishTime: STRING(20),
  isForce: {
    type: BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
});

export default version;
