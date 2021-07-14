module.exports = {
  root: true,
  parser: "@typescript-eslint/parser", //定义ESLint的解析器
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ], //定义文件继承的子规范
  plugins: ["@typescript-eslint"], //定义了该eslint文件所依赖的插件
  parserOptions: {
    // 支持最新 JavaScript
    ecmaVersion: 2020,
    sourceType: "module",
  },
  env: {
    //指定代码的运行环境
    browser: true,
    node: true,
  },
  rules: {
    quotes: [1, "double"],
    // "linebreak-style": "off",
    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/explicit-module-boundary-types": "off", // ts每个函数都要显式声明返回值
  },
};
