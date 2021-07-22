import {useRouter} from "../../router";
import {DTO} from "../../types";
import {validType} from "../../../util/util";
import user, {
  getUserInfo,
  getCountByName,
  updateToken,
  getInfoByToken,
} from "../../../schema/models/user";
const router = useRouter();
/**
 * 注册
 */
router.post("/register", async (req, res) => {
  const valid: any = await validType(req.body, {
    name: String,
    password: String,
  });
  if (valid.f) {
    const amount = await getCountByName(valid.resData.name);
    if (amount) return DTO.error(res)("该用户名已注册");
    try {
      await user.create(valid.resData);
      return DTO.data(res)(true);
    } catch {
      return DTO.error(res)("注册失败");
    }
  }
  return DTO.error(res)(valid.err);
});

/**
 * 账号密码登录获取token
 */
router.post("/login", async (req, res) => {
  const valid: any = await validType(req.body, {
    name: String,
    password: String,
  });
  if (valid.f) {
    try {
      const data: any = await getUserInfo({
        name: valid.resData.name,
        password: valid.resData.password,
      });
      if (data) {
        await updateToken(data.id);
        const userInfo: any = await getUserInfo({
          id: data.id,
        });
        return DTO.data(res)(userInfo);
      }
      return DTO.error(res)("用户名或密码错误");
    } catch {
      return DTO.error(res)("登录失败");
    }
  }
  return DTO.error(res)(valid.err);
});

/**
 * token登录获取用户信息
 */

router.post("/token", async (req, res) => {
  const data: any = await getInfoByToken(req);
  if (data) return DTO.data(res)(data);
  return DTO.noAuth(res)();
});

/**
 * 修改用户信息
 * @param id
 * @returns
 */
router.post("/update", async (req, res) => {
  try {
    const data: any = await getInfoByToken(req);
    if (data) {
      await user.update(req.body, {
        where: {
          id: data.id,
          delFlag: false,
        },
      });
      return DTO.data(res)(true);
    }
    return DTO.noAuth(res)();
  } catch {
    return DTO.error(res)("修改信息出错啦");
  }
});
export default router;
