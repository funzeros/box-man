import {intersection, isNil, keys, omitBy, pick} from "lodash";
import {Model} from "sequelize/types";
import {GObj} from "../types/common";

// 验证控制
export const isEmpty = (params: any) => {
  return [null, undefined, ""].includes(params);
};

// 验证类型
export const validType = (data: any, rule: any) =>
  new Promise<{f: boolean; resData?: any; err?: string}>((res: any, rej: any) => {
    try {
      const resData: any = {};
      const flag = Object.keys(rule).every(k => {
        resData[k] = data[k];
        const ruleItem = rule[k];
        if (ruleItem.constructor === Object) {
          if (isEmpty(data[k])) {
            resData[k] = ruleItem.default;
            return ruleItem.allowNull;
          }
          return data[k].constructor === ruleItem.type;
        } else {
          if (isEmpty(data[k])) return false;
          return data[k].constructor === ruleItem;
        }
      });
      if (flag) {
        res({f: true, resData});
      } else {
        res({f: false, err: "参数错误，请检查类型和空值"});
      }
    } catch (err) {
      rej(err);
    }
  });

// 分页查询
export const getPageFn = (req: any) => {
  const {current = 1, size = 10} = req.query;
  const offset = (+current - 1) * +size;
  const limit = +size;
  return async (
    model: any,
    attributes: string[],
    where: any,
    options: any = {}
  ): Promise<{rows: Model[]; count: number}> => {
    const data = await model.findAndCountAll({
      attributes,
      where: {...where, delFlag: false},
      offset,
      limit,
      ...options,
    });
    const resData = {
      ...data,
      current: +current,
      size: +size,
    };
    return resData;
  };
};

// 随机范围

export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

/**
 * 覆盖对象属性
 * @param distObject 初始化对象
 * @param srcObject 传递过来新对象
 */
export function mergeProperties<T>(distObject: T, srcObject: GObj) {
  const distPropList = keys(distObject);
  const srcPropList = keys(omitBy(srcObject, isNil));
  const propList = intersection(distPropList, srcPropList);
  return {
    ...distObject,
    ...pick(srcObject, propList),
  };
}

export const formatZero = (num: number, len = 2) => {
  const str = `${num}`;
  if (str.length < len) {
    return (new Array(len).join("0") + str).substring(str.length - 1);
  }
  return str;
};

export const getNow = () => {
  const now = new Date();
  return `${now.getFullYear()}-${formatZero(now.getMonth() + 1, 2)}-${formatZero(
    now.getDate(),
    2
  )} ${formatZero(now.getHours(), 2)}:${formatZero(now.getMinutes(), 2)}:${formatZero(
    now.getSeconds(),
    2
  )}`;
};
