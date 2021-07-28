import collectModel from "../../../schema/models/collect";
import mapModel from "../../../schema/models/map";
import {getInfoByToken} from "../../../schema/models/user";
import {useRouter} from "../../router";
import {DTO} from "../../types";

const router = useRouter();

router.get("/:id", async (req, res) => {
  try {
    const userInfo = await getInfoByToken(req);
    if (userInfo) {
      const userId = userInfo.getDataValue("id");
      const mapId = req.params.id;
      const [collectIns, created] = await collectModel.findOrCreate({
        where: {
          userId,
          mapId,
        },
        defaults: {userId, mapId},
      });
      if (!created) {
        await collectIns.destroy();
      }
      const praiseNumber = await collectModel.count({
        where: {
          mapId,
          delFlag: false,
        },
      });
      await mapModel.update(
        {praiseNumber},
        {
          where: {
            id: mapId,
          },
        }
      );
      return DTO.data(res)(created, created ? "收藏成功" : "取消收藏成功");
    }
    DTO.noAuth(res)();
  } catch (error) {
    DTO.sysError(res)(error);
  }
});

export default router;
