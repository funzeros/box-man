import {STRING} from "sequelize";

import {defineModel} from "../../db";
const version = defineModel("version", {
  versionId: STRING(32),
  publishTime: STRING(20),
});

export default version;
