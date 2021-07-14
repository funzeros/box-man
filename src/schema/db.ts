import {BIGINT, BOOLEAN, Sequelize} from "sequelize";
import {loadEnv} from "../util/env";
const {DB_NAME, DB_USER, DB_PASSWORD, DB_IP} = loadEnv();

const database = DB_NAME || "test";
const name = DB_USER || "root";
const password = DB_PASSWORD || "123456";
export const sequelize = new Sequelize(database, name, password, {
  dialect: "mysql", //数据库类型
  host: DB_IP, //主机地址
  port: 3306,
  pool: {
    //连接池设置
    max: 5, //最大连接数
    idle: 30000,
    acquire: 60000,
  },
  dialectOptions: {
    charset: "utf8mb4", //字符集
    collate: "utf8mb4_unicode_ci",
  },
  define: {
    //模型设置
    freezeTableName: true, //自定义表面，不设置会自动将表名转为复数形式
    timestamps: false, //自动生成更新时间、创建时间字段：updatedAt,createdAt
  },
  timezone: "+08:00", //东八时区
});

// 公共的定义方法
export const defineModel = (name: string, attributes: any) => {
  console.log(`定义${name}表结构`);
  const attrs: any = {};
  attrs.id = {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
  };
  for (const key in attributes) {
    const value = attributes[key];
    if (typeof value === "object" && value["type"]) {
      value.allowNull = value.allowNull || false;
      attrs[key] = value;
    } else {
      attrs[key] = {
        type: value,
        allowNull: false,
      };
    }
  }
  attrs.createdAt = {
    type: BIGINT,
    allowNull: false,
  };
  attrs.updatedAt = {
    type: BIGINT,
    allowNull: false,
  };
  attrs.version = {
    type: BIGINT,
    allowNull: false,
  };
  attrs.delFlag = {
    type: BOOLEAN,
    allowNull: false,
    defaultValue: false,
  };
  return sequelize.define(name, attrs, {
    tableName: name,
    timestamps: false,
    hooks: {
      beforeValidate: (obj: any) => {
        const now = Date.now();
        if (obj.isNewRecord) {
          obj.createdAt = now;
          obj.updatedAt = now;
          obj.version = 0;
        } else {
          obj.updatedAt = Date.now();
          obj.version++;
        }
      },
      beforeBulkUpdate: (obj: any) => {
        // 更新时间
        obj.fields.push("updatedAt");
        obj.attributes.updatedAt = Date.now();
      },
    },
  });
};
