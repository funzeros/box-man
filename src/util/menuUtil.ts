export const menuToTree = (data: any[]) => {
  const obj: any = {};
  const newObj: any = {};
  data.forEach(m => {
    obj[m.id] = m.dataValues;
  });
  data.forEach(m => {
    if (m.parentId) {
      if (!obj[m.parentId].children) obj[m.parentId].children = [];
      const children = obj[m.parentId].children;
      children.push(m);
    } else {
      newObj[m.id] = m;
    }
  });
  return Object.values(newObj);
};
