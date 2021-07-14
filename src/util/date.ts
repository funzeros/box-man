export class GTime {
  static formatZero = (num: number, len = 2) => {
    const str = `${num}`;
    if (str.length < len) {
      return (new Array(len).join("0") + str).substring(str.length - 1);
    }
    return str;
  };
  static getDigitTime() {
    const now = new Date();
    return `${this.formatZero(now.getHours(), 2)}:${this.formatZero(
      now.getMinutes(),
      2
    )}:${this.formatZero(now.getSeconds(), 2)}`;
  }
}
