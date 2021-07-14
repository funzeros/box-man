import express from "express";
import expressWs from "express-ws";
import bodyParser from "body-parser"; //用于req.body获取值的
import moduleRouter from "./module/index";
import {not_found_handler, error_handler_middleware, allowCrossDomain} from "./util/middle";
import {connectDB} from "./schema/index";
import {loadEnv} from "./util/env";
import path from "path";
const {PREFIX, PORT} = loadEnv();
// 初始化连接数据库
connectDB();
// express
const appBase = express();
// websocket
const wsInstance = expressWs(appBase);
const {app} = wsInstance;

app.use(allowCrossDomain);
// 前置中间件
app.use(bodyParser.json());
// 创建 application/x-www-form-urlencoded 编码解析
app.use(bodyParser.urlencoded({extended: false}));
app.use("/html", express.static(path.join(__dirname, "static")));
// app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 加载模块
Object.entries(moduleRouter).forEach(([name, module]) => {
  app.use(PREFIX + "/" + name, module);
});

// 后置中间件
app.use(not_found_handler); // 先判断此异常
app.use(error_handler_middleware); // 最后判断此异常
app.listen(PORT, () => {
  console.log(`服务已启动--> http://127.0.0.1:${PORT}`);
});
