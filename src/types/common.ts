export interface GObj<T = any> {
  [key: string]: T;
  [key: number]: T;
}
