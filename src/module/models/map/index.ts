import {useRouter} from "../../router";
import {DTO} from "../../types";
import {getNow, getPageFn, validType} from "../../../util/util";
import mapModel from "../../../schema/models/map";
import {v4} from "uuid";
import {GObj} from "../../../types/common";
import userModel, {getInfoByToken} from "../../../schema/models/user";
import {Model, Order} from "sequelize/types";
import {Request} from "express";

const router = useRouter();
/**
 * 新增
 */
router.post("/add", async (req, res) => {
  const valid = await validType(req.body, {
    creator: {
      allowNull: true,
      type: String,
      default: "匿名",
    },
    mapName: {
      allowNull: true,
      type: String,
      default: `地图${v4()}`,
    },
    mapData: Array,
    playerHP: {
      allowNull: true,
      type: Number,
      default: 0,
    },
  });
  if (valid.f) {
    try {
      if (valid.resData.creator.length > 32) return DTO.error(res)("作者名称过长");
      if (valid.resData.mapName.length > 255) return DTO.error(res)("地图名称过长");
      const amount = await mapModel.count({
        where: {
          mapName: valid.resData.mapName,
          delFlag: false,
        },
      });
      if (amount) return DTO.error(res)("该地图名已存在");
      await mapModel.create({...valid.resData, time: getNow()});
      return DTO.data(res)(true);
    } catch (error) {
      console.log(error);
      return DTO.sysError(res)(error);
    }
  }
  return DTO.error(res)(valid.err);
});

/**
 * 计算点赞
 * @param data
 * @param userId
 */
const handleCalcPraise = (data: Model, userId: number) => {
  data.setDataValue(
    "hasPraise",
    data.getDataValue("users").some((data: {id: number}) => data.id === userId)
  );
  data.setDataValue("likes", void 0);
  data.setDataValue(
    "praiseUsers",
    data.getDataValue("users").map(({id, name}: GObj) => ({id, name}))
  );
  data.setDataValue("users", void 0);
};
/**
 * map 调取like关联
 */
const mapInclude = [
  {
    model: userModel,
    attributes: ["id", "name"],
  },
];
/**
 * map查询属性
 */
const mapAttrs = ["id", "creator", "mapName", "mapData", "time", "playerHP", "praiseNumber"];
/**
 * map查询和排序条件
 */

const getSearchParams = (req: Request) => {
  const {mapName, creator, sort} = req.query;
  const where: GObj = {};
  const order: Order = [["id", "DESC"]];
  if (mapName) where.mapName = mapName;
  if (creator) where.creator = creator;
  if (sort) {
    if (sort === "1") order.unshift(["praiseNumber", "DESC"]);
    if (sort === "2") order.unshift(["praiseNumber", "ASC"]);
  }
  return {
    where,
    order,
  };
};
/**
 * list
 */
router.get("/list", async (req, res) => {
  try {
    const userInfo = await getInfoByToken(req);
    let userId = 0;
    if (userInfo) userId = userInfo.getDataValue("id");
    const {where, order} = getSearchParams(req);
    const data = await mapModel.findAll({
      attributes: mapAttrs,
      where: {
        ...where,
        delFlag: false,
      },
      order,
      include: mapInclude,
    });
    data.forEach(m => {
      handleCalcPraise(m, userId);
    });
    DTO.data(res)(data);
  } catch (error) {
    console.log(error);
    DTO.sysError(res)(error);
  }
});

/**
 * list
 */
router.get("/page", async (req, res) => {
  try {
    const userInfo = await getInfoByToken(req);
    let userId = 0;
    if (userInfo) userId = userInfo.getDataValue("id");
    const {where, order} = getSearchParams(req);
    const pageData = await getPageFn(req)(mapModel, mapAttrs, where, {
      order,
      include: mapInclude,
    });
    pageData.rows.forEach(m => {
      handleCalcPraise(m, userId);
    });
    DTO.page(res)(pageData);
  } catch (error) {
    console.log(error);
    DTO.sysError(res)(error);
  }
});

/**
 * detail
 */
router.get("/:id", async (req, res) => {
  try {
    const userInfo = await getInfoByToken(req);
    let userId = 0;
    if (userInfo) userId = userInfo.getDataValue("id");
    const {id} = req.params;
    const data = await mapModel.findOne({
      attributes: mapAttrs,
      where: {
        id,
        delFlag: false,
      },
      include: mapInclude,
    });
    handleCalcPraise(data, userId);
    if (data) return DTO.data(res)(data);
    return DTO.error(res)("地图不存在哦");
  } catch (error) {
    console.log(error);
    DTO.sysError(res)(error);
  }
});
export default router;
