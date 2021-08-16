import {STRING} from "sequelize";
import {getNow} from "../../../util/util";

import {defineModel} from "../../db";
const version = defineModel("version", {
  versionId: STRING(32),
  publishTime: {
    type: STRING(20),
    defaultValue: getNow(),
  },
});

export default version;
