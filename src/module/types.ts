import {Response} from "express";

export class DTOWrap {
  constructor(code: number, data?: any, msg?: string) {
    this.code = code;
    this.data = data;
    this.msg = msg;
  }
  code: number;
  data?: any;
  msg?: string;
}

export const DTO = {
  error: (res: Response) => (msg: string, data?: any) => res.json(new DTOWrap(1, data, msg)),
  data: (res: Response) => (data: any, msg?: string) => res.json(new DTOWrap(0, data, msg)),
  noAuth: (res: Response) => (msg?: string, data?: any) =>
    res.status(401).json(new DTOWrap(1, data, msg || "身份认证失效请重新登录")),
  page: (res: Response) => (arg: any, msg?: string) => {
    const {count, rows, current, size} = arg;
    const data = {
      total: count,
      records: rows,
      size,
      current,
    };
    return res.json(new DTOWrap(0, data, msg));
  },
  sysError: (res: Response) => (msg: string, data?: any) =>
    res.status(500).json(new DTOWrap(1, data, msg)),
};
