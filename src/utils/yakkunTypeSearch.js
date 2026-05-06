const yakkunTypeNumbers = {
  無: 0,
  闘: 1,
  飛: 2,
  毒: 3,
  地: 4,
  岩: 5,
  虫: 6,
  霊: 7,
  鋼: 8,
  炎: 9,
  水: 10,
  草: 11,
  電: 12,
  超: 13,
  氷: 14,
  竜: 15,
  悪: 16,
  妖: 17,
};

export const getYakkunTypeSearchUrl = (types) => {
  if (types.length === 1) {
    return `https://yakkun.com/ch/zukan/search/?search=1&type=${yakkunTypeNumbers[types[0]]}&type_num=1`;
  }

  const typeParams = types
    .map((type) => yakkunTypeNumbers[type])
    .filter((typeNumber) => typeNumber !== undefined)
    .map((typeNumber) => `type_n[]=${typeNumber}`)
    .join('&');

  return `https://yakkun.com/ch/zukan/search/?search=1&${typeParams}`;
};
