import { typeData } from '../data/typeData';

const typeOrder = Object.keys(typeData);

export const getDefenseTypeKey = (type1, type2) => {
  const firstIndex = typeOrder.indexOf(type1);
  const secondIndex = typeOrder.indexOf(type2);

  return firstIndex <= secondIndex ? `${type1}-${type2}` : `${type2}-${type1}`;
};

export const getAllDefenseTypeKeys = () => (
  typeOrder.flatMap((type1, rowIndex) => (
    typeOrder
      .slice(rowIndex)
      .map((type2) => getDefenseTypeKey(type1, type2))
  ))
);
