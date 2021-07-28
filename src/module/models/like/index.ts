import likeModel from "../../../schema/models/like";
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
      const [likeIns, created] = await likeModel.findOrCreate({
        where: {
          userId,
          mapId,
        },
        defaults: {userId, mapId},
      });
      if (!created) {
        await likeIns.destroy();
      }
      const praiseNumber = await likeModel.count({
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
      return DTO.data(res)(created, created ? "点赞成功" : "取消点赞成功");
    }
    DTO.noAuth(res)();
  } catch (error) {
    DTO.sysError(res)(error);
  }
});
export default router;
