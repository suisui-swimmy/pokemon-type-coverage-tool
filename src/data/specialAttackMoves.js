import { typeData } from './typeData';
import { typeEffectiveness } from './typeEffectiveness';

export const specialAttackMoves = {
  freezeDry: {
    label: 'フリーズドライ',
    shortLabel: 'フリドラ',
    color: typeData.氷.color,
    textColor: typeData.氷.textColor,
    borderColor: '#5bb7c0',
    sourceTypes: ['氷'],
  },
  flyingPress: {
    label: 'フライングプレス',
    shortLabel: 'フラプレ',
    color: typeData.闘.color,
    textColor: '#ffffff',
    borderColor: '#8f4d78',
    sourceTypes: ['闘', '飛'],
  },
};

export const specialAttackMoveIds = Object.keys(specialAttackMoves);

const flyingPressEffectiveness = {
  無: 2,
  炎: 1,
  水: 1,
  電: 0.5,
  草: 2,
  氷: 2,
  闘: 2,
  毒: 0.5,
  地: 1,
  飛: 0.5,
  超: 0.5,
  虫: 1,
  岩: 1,
  霊: 0,
  竜: 1,
  悪: 2,
  鋼: 1,
  妖: 0.5,
};

export const getSpecialAttackMoveSingleTypeEffectiveness = (moveId, defenseType) => {
  if (moveId === 'freezeDry') {
    return defenseType === '水' ? 2 : typeEffectiveness[defenseType].氷;
  }

  if (moveId === 'flyingPress') {
    return flyingPressEffectiveness[defenseType];
  }

  return undefined;
};
