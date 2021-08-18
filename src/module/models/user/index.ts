import {useRouter} from "../../router";
import {DTO} from "../../types";
import {validType} from "../../../util/util";
import user, {getUserInfo, updateToken, getInfoByToken, getAllUserInfo} from "../../../schema/models/user";
const router = useRouter();
/**
 * 注册
 */
router.post("/register", async (req, res) => {
  try {
    const valid: any = await validType(req.body, {
      name: String,
      password: String,
    });
    if (valid.f) {
      const [, created] = await user.findOrCreate({
        where: {name: valid.resData.name},
        defaults: valid.resData,
      });
      if (created) return DTO.data(res)(true);
      return DTO.error(res)("该用户名已注册");
    }
    return DTO.error(res)(valid.err);
  } catch (error) {
    DTO.sysError(res)(error);
  }
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
      const data = await getUserInfo({
        name: valid.resData.name,
        password: valid.resData.password,
      });
      if (data) {
        await updateToken(data.getDataValue("id"));
        const userInfo = await getUserInfo({
          id: data.getDataValue("id"),
        });
        return DTO.data(res)(userInfo);
      }
      return DTO.error(res)("用户名或密码错误");
    } catch (error) {
      return DTO.sysError(res)(error);
    }
  }
  return DTO.error(res)(valid.err);
});

/**
 * token登录获取用户信息
 */

router.post("/token", async (req, res) => {
  const data = await getInfoByToken(req);
  if (data) return DTO.data(res)(data);
  return DTO.noAuth(res)();
});

/**
 * 修改密码
 */
router.post("/changePsw", async (req, res) => {
  try {
    const data = await getAllUserInfo(req);
    if (data) {
      const password = data.getDataValue("password");
      if (req.body.oldPassword !== password) return DTO.error(res)("原密码错误");
      await user.update(req.body, {
        where: {
          id: data.getDataValue("id"),
          delFlag: false,
        },
      });
      return DTO.data(res)(true);
    }
    return DTO.noAuth(res)();
  } catch (error) {
    return DTO.sysError(res)(error);
  }
})

/**
 * 修改用户信息
 * @param id
 * @returns
 */
router.post("/update", async (req, res) => {
  try {
    const data = await getInfoByToken(req);
    if (data) {
      await user.update(req.body, {
        where: {
          id: data.getDataValue("id"),
          delFlag: false,
        },
      });
      return DTO.data(res)(true);
    }
    return DTO.noAuth(res)();
  } catch (error) {
    return DTO.sysError(res)(error);
  }
});

/**
 * 减少或者增加金币
 */
router.post("/coin", async (req, res) => {
  try {
    const userInfo = await getInfoByToken(req);
    console.log(req.body);
    if (userInfo) {
      const valid = await validType(req.body, {
        coin: Number,
      });
      if (valid.f) {
        let newCoin = valid.resData.coin;
        const oldCoin = userInfo.getDataValue("coin");
        newCoin += oldCoin;
        if (newCoin >= 0) {
          userInfo.setDataValue("coin", newCoin);
          await userInfo.save();
          return DTO.data(res)(true);
        }
        return DTO.error(res)("金币不够啦");
      }
      return DTO.error(res)(valid.err);
    }
    return DTO.noAuth(res)();
  } catch (error) {
    console.log(error);
    return DTO.sysError(res)(error);
  }
});
export default router;
