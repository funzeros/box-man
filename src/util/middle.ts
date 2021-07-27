import {NextFunction, Request, Response} from "express";
import {DTO} from "../module/types";
// 中间件
const error_handler_middleware = (err: any, req: Request, res: Response): void => {
  if (err) {
    const {message} = err;
    res.status(500);
    DTO.error(res)(`${message || "服务器异常"}`);
  }
};
// 404处理
const not_found_handler = (req: Request, res: Response): void => {
  DTO.error(res)("api不存在");
};

const allowCrossDomain = (req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Headers", "*"); //自定义中间件，设置跨域需要的响应头。
  res.header("Access-Control-Allow-Origin", "*"); //自定义中间件，设置跨域需要的响应头。
  next();
};
export {error_handler_middleware, not_found_handler, allowCrossDomain};
