import {useRouter} from "../../router";
import {DTO} from "../../types";
import {getNow, getPageFn, validType} from "../../../util/util";
import mapModel from "../../../schema/models/map";
import {v4} from "uuid";
import {GObj} from "../../../types/common";
import userModel, {getInfoByToken} from "../../../schema/models/user";
import {Model, Order, QueryTypes} from "sequelize";
import {Request} from "express";
import collectModel from "../../../schema/models/collect";
import {sequelize} from "../../../schema/db";

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
    stepsPas: Number,
    processData: Array,
    regretDisabled: Number
  });
  if (valid.f) {
    try {
      const userInfo = await getInfoByToken(req);
      if (userInfo) {
        if (valid.resData.creator.length > 32) return DTO.error(res)("作者名称过长");
        if (valid.resData.mapName.length > 255) return DTO.error(res)("地图名称过长");
        const amount = await mapModel.count({
          where: {
            mapName: valid.resData.mapName,
            delFlag: false,
          },
        });
        if (amount) return DTO.error(res)("该地图名已存在");
        const todayTime = new Date(new Date().toLocaleDateString()).getTime()
        const token = userInfo.getDataValue("token");
        // 查询该用户今日上传地图数量
        const todayMap = await sequelize.query(`
          SELECT a.id FROM map AS a
          LEFT JOIN user AS b ON a.creatorId = b.id
          WHERE a.createdAt > ${todayTime} AND b.token = '${token}' AND a.delFlag = false
        `, {type: QueryTypes.SELECT});
        if (todayMap.length > 5) return DTO.error(res)("今日可上传地图已达上限");
        const userId = userInfo.getDataValue("id")
        await mapModel.create({
          ...valid.resData,
          time: getNow(),
          creatorId: userId,
          mapKingId: userId,
        });
        return DTO.data(res)(true);
      }
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
const handleCalc = (data: Model, userId: number) => {
  data.setDataValue(
    "hasPraise",
    data.getDataValue("users").some((data: {id: number}) => data.id === userId)
  );
  data.setDataValue(
    "hasCollect",
    data.getDataValue("collects").some((data: {userId: number}) => data.userId === userId)
  );
  data.setDataValue(
    "praiseUsers",
    data.getDataValue("users").map(({id, name}: GObj) => ({id, name}))
  );
  data.setDataValue("collects", void 0);
  data.setDataValue("users", void 0);
};
/**
 * map 调取like关联
 */
const getMapInclude = () => {
  return [
    {
      model: userModel,
      attributes: ["id", "name"],
    },
    {
      model: collectModel,
      attributes: ["userId"],
    },
  ];
};
/**
 * map查询属性
 */
const mapAttrs = [
  "id",
  "creator",
  "mapName",
  "mapData",
  "time",
  "playerHP",
  "praiseNumber",
  "stepsPas",
  "regretDisabled"
];
/**
 * map查询和排序条件
 */

const getSearchParams = (req: Request, userId: number) => {
  const {mapName, creator, sort, type} = req.query;
  const where: GObj = {};
  const order: Order = [["id", "DESC"]];
  const mapInclude: GObj = getMapInclude();
  if (mapName) where.mapName = mapName;
  if (creator) where.creator = creator;
  if (sort) {
    if (sort === "1") order.unshift(["praiseNumber", "DESC"]);
    if (sort === "2") order.unshift(["praiseNumber", "ASC"]);
  }
  if (type) {
    if (type === "collect") mapInclude[1].where = {userId};
    if (type === "personal") where.creatorId = userId;
  }
  return {
    where,
    order,
    mapInclude,
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
    const {where, order, mapInclude} = getSearchParams(req, userId);
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
      handleCalc(m, userId);
    });
    DTO.data(res)(data);
  } catch (error) {
    console.log(error);
    DTO.sysError(res)(error);
  }
});

/**
 * page
 */
router.get("/page", async (req, res) => {
  try {
    const userInfo = await getInfoByToken(req);
    let userId = 0;
    if (userInfo) userId = userInfo.getDataValue("id");
    const {where, order, mapInclude} = getSearchParams(req, userId);
    const pageData = await getPageFn(req)(mapModel, mapAttrs, where, {
      order,
      include: mapInclude,
    });
    pageData.rows.forEach(m => {
      handleCalc(m, userId);
    });
    DTO.page(res)(pageData);
  } catch (error) {
    console.log(error);
    DTO.sysError(res)(error);
  }
});

/**
 * steps_pas
 */
router.post("/steps_pas", async (req, res) => {
  try {
    const userInfo = await getInfoByToken(req);
    if (!userInfo) return DTO.noAuth(res)();
    const userId = userInfo.getDataValue("id");
    const valid = await validType(req.body, {
      mapId: Number,
      stepsPas: Number,
      processData: Array,
    });
    if (valid.f) {
      const mapIns = await mapModel.findOne({
        attributes: ["stepsPas"],
        where: {
          id: valid.resData.mapId,
        },
      });
      const stepsPas = mapIns.getDataValue("stepsPas");
      if (!stepsPas || valid.resData.stepsPas < stepsPas) {
        await mapModel.update(
          {
            stepsPas: valid.resData.stepsPas,
            processData: valid.resData.processData,
            mapKingId: userId,
          },
          {
            where: {id: valid.resData.mapId},
          }
        );
        return DTO.data(res)(true, "恭喜您创造了新的最佳步数");
      }
      return DTO.data(res)(false, "很遗憾，没有打败最佳步数");
    }
    return DTO.error(res)(valid.err);
  } catch (error) {
    console.log(error);
    DTO.sysError(res)(error);
  }
});
/**
 * delete
 */
router.post("/delete/:id", async (req, res) => {
  try {
    const userInfo = await getInfoByToken(req);
    if (userInfo) {
      if (userInfo.getDataValue("auth") === 1) {
        await mapModel.update(
          {delFlag: true},
          {
            where: {
              id: req.params.id,
            },
          }
        );
        return DTO.data(res)(true);
      }
      return DTO.error(res)("您没有权限");
    }
    return DTO.error(res)("您没有权限");
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
      attributes: [...mapAttrs, "processData", "mapKingId"],
      where: {
        id,
        delFlag: false,
      },
      include: getMapInclude(),
    });
    if (data) {
      const mapKingId = data.getDataValue("mapKingId");
      if (mapKingId) {
        const mapKing = await userModel.findOne({
          attributes: ["name"],
          where: {
            id: mapKingId,
          },
        });
        data.setDataValue("mapKingName", mapKing.getDataValue("name"));
      }
      handleCalc(data, userId);
      return DTO.data(res)(data);
    }
    return DTO.error(res)("地图不存在哦");
  } catch (error) {
    console.log(error);
    DTO.sysError(res)(error);
  }
});

export default router;
