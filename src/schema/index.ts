import {sequelize} from "./db";
import {loadEnv} from "../util/env";
const {DB_ALTER, DB_FORCE} = loadEnv();

export const connectDB = (): void => {
  sequelize
    .authenticate()
    .then(() => {
      console.log("数据库已连接！");
      sequelize
        .sync({
          alter: DB_ALTER, // 表格结构有变更时修改 生产环境用
          force: DB_FORCE, // 每次都删表重新建 开发环境用
        })
        .then(() => {
          console.log("数据库表初始化 ok");
        })
        .catch(err => {
          console.log("数据库表初始化 error", err);
        });
    })
    .catch(err => {
      console.log(err);
      console.log("数据库连接失败");
    });
};
