import {useRouter} from "../../router";
import {DTO} from "../../types";
import versionModel from "../../../schema/models/version";
import {getInfoByToken} from "../../../schema/models/user";

const router = useRouter();
router.post("/add", async (req, res) => {
  try {
    if (!req.body.versionId) return DTO.error(res)("versionId不能为空");
    const userInfo = await getInfoByToken(req);
    if (userInfo) {
      if (userInfo.getDataValue("auth") === 1) {
        await versionModel.create({versionId: req.body.versionId});
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
router.get("/latest", async (req, res) => {
  try {
    const data = await versionModel.findOne({
      attributes: ["versionId", "publishTime"],
      order: [["id", "DESC"]],
    });
    if (data) return DTO.data(res)(data);
    return DTO.error(res)("暂无版本");
  } catch (error) {
    console.log(error);
    DTO.sysError(res)(error);
  }
});
export default router;
