### 注意事项

- 使用 `yarn` 安装依赖
- 复制`.env`命名为`.env.local` 配置环境变量，注意需要手动建库`boxman` 不需要手动建表
  本地请建 名称`boxman` / 字符集`utf8mb4` / 排序规则 `utf8mb4_unicode_ci`
- `yarn start` 运行项目
- 开发环境下可使用 `yarn dev` 运行，代码热更新
- `yarn build` 打包成 js
- `yarn serve` 运行打包出来的
- `yarn pm` pm2 运行 \ `yarn pmr` pm2 重启\ `yarn pms` pm2 停止\ `yarn pmd` pm2 关闭并删除，执行`serve`和`pm`之前必须执行`yarn build`
- 出现格式化错乱或 `eslint` 报错等首先保证安装了推荐依赖，本项目行尾序列为 `LF` ，若您的项目是`CRLF`，请执行`yarn fix`后重新`clone`项目

### 接口

- **baseurl** `http://47.103.218.109:10052`
- **列表** `get` `/api/map/list`
  - **query** `creator`
  - **query** `mapName`
- **新增** `post` `/api/map/add`
  - **data** `creator` _string_ _非必填_
  - **data** `mapName` _string_ _非必填_
  - **data** `mapData` _array_ _必填_
- **详情** `get` `/api/map/:id`
- **分页** `get` `/api/map/page`
  - **query** `current`
  - **query** `size`
  - **query** `creator`
  - **query** `mapName`
- **注册** `post` `/api/user/register`
  - **data** `name` _最大长度 32_
  - **data** `password` _最大长度 32_
- **登录** `post` `/api/user/login`
  - **data** `name` _最大长度 32_
  - **data** `password` _最大长度 32_
- **token** `post` `/api/user/token`
  - **Header** `Authorization` _Bearer 0b2be3b4-a8ad-40d2-9162-afe4a5b08177_
    > Authorization 格式：Bearer 空格 {token}
- **点赞/取消点赞** `get` `/api/like/:id`
