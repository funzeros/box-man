import like from "../../../schema/models/like";
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
      const [likeIns, created] = await like.findOrCreate({
        where: {
          userId,
          mapId,
        },
        defaults: {userId, mapId},
      });
      if (!created) {
        like.destroy({
          where: {
            id: likeIns.getDataValue("id"),
          },
        });
      }
      return DTO.data(res)(true, created ? "点赞成功" : "取消点赞成功");
    }
    DTO.noAuth(res)();
  } catch (error) {
    DTO.sysError(res)(error);
  }
});
export default router;
