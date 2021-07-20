import {useRouter} from "../../router";
import {DTO} from "../../types";
import {getNow, getPageFn, validType} from "../../../util/util";
import map from "../../../schema/models/map";
import {v4} from "uuid";
import {GObj} from "../../../types/common";

const router = useRouter();
/**
 * 新增
 */
router.post("/add", async (req, res) => {
  const valid: any = await validType(req.body, {
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
      return DTO.error(res)("地图创建失败");
    }
  }
  return DTO.error(res)(valid.err);
});
/**
 * list
 */
router.get("/list", async (req, res) => {
  try {
    const {mapName, creator} = req.query;
    const where: GObj = {delFlag: false};
    if (mapName) where.mapName = mapName;
    if (creator) where.creator = creator;
    const data = await map.findAll({
      attributes: ["id", "creator", "mapName", "mapData", "time"],
      where: {
        ...where,
        delFlag: false,
      },
      order: [["id", "DESC"]],
    });
    DTO.data(res)(data);
  } catch (error) {
    console.log(error);
    DTO.error(res)("查询地图错误");
  }
});

/**
 * list
 */
router.get("/page", async (req, res) => {
  try {
    const {mapName, creator} = req.query;
    const where: GObj = {delFlag: false};
    if (mapName) where.mapName = mapName;
    if (creator) where.creator = creator;
    getPageFn(req, res)(map, ["id", "creator", "mapName", "mapData", "time"], where, [
      ["id", "DESC"],
    ]);
  } catch (error) {
    console.log(error);
    DTO.error(res)("查询地图错误");
  }
});

/**
 * detail
 */
router.get("/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const data = await map.findOne({
      attributes: ["id", "creator", "mapName", "mapData", "time"],
      where: {
        id,
        delFlag: false,
      },
    });
    if (data) return DTO.data(res)(data);
    return DTO.error(res)("地图不存在哦");
  } catch (error) {
    console.log(error);
    DTO.error(res)("查询地图错误");
  }
});
export default router;
