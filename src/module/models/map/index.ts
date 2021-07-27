import {useRouter} from "../../router";
import {DTO} from "../../types";
import {getNow, getPageFn, validType} from "../../../util/util";
import map from "../../../schema/models/map";
import {v4} from "uuid";
import {GObj} from "../../../types/common";
import like from "../../../schema/models/like";
import user, {getInfoByToken} from "../../../schema/models/user";
import {Model} from "sequelize/types";

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
      const amount = await map.count({
        where: {
          mapName: valid.resData.mapName,
          delFlag: false,
        },
      });
      if (amount) return DTO.error(res)("该地图名已存在");
      await map.create({...valid.resData, time: getNow()});
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
  data.setDataValue("praiseNumber", data.getDataValue("users").length);
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
    model: user,
    attributes: ["id", "name"],
  },
];

/**
 * list
 */
router.get("/list", async (req, res) => {
  try {
    const userInfo = await getInfoByToken(req);
    let userId = 0;
    if (userInfo) userId = userInfo.getDataValue("id");
    const {mapName, creator} = req.query;
    const where: GObj = {};
    if (mapName) where.mapName = mapName;
    if (creator) where.creator = creator;
    const data = await map.findAll({
      attributes: [
        "id",
        "creator",
        "mapName",
        "mapData",
        "time",
        "playerHP",
        // [fn("COUNT", col("likes.id")), "praiseNumber"],
      ],
      where: {
        ...where,
        delFlag: false,
      },
      order: [["id", "DESC"]],
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
    const {mapName, creator} = req.query;
    const where: GObj = {delFlag: false};
    if (mapName) where.mapName = mapName;
    if (creator) where.creator = creator;
    const pageData = await getPageFn(req)(
      map,
      ["id", "creator", "mapName", "mapData", "time", "playerHP"],
      where,
      {
        order: [["id", "DESC"]],
        include: [
          {
            model: like,
            attributes: ["id", "userId"],
          },
        ],
      }
    );
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
    const data = await map.findOne({
      attributes: ["id", "creator", "mapName", "mapData", "time", "playerHP"],
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
