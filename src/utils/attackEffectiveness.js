import { typeData } from '../data/typeData';
import { typeEffectiveness } from '../data/typeEffectiveness';
import {
  getSpecialAttackMoveSingleTypeEffectiveness,
  specialAttackMoves,
} from '../data/specialAttackMoves';

export const isTypeAttack = (attackKey) => Boolean(typeData[attackKey]);

export const isSpecialAttackMove = (attackKey) => Boolean(specialAttackMoves[attackKey]);

export const getSingleTypeAttackEffectiveness = (defenseType, attackKey) => {
  if (isTypeAttack(attackKey)) {
    return typeEffectiveness[defenseType][attackKey];
  }

  return getSpecialAttackMoveSingleTypeEffectiveness(attackKey, defenseType);
};

export const getAttackEffectiveness = (defenseType1, defenseType2, attackKey) => {
  const firstMultiplier = getSingleTypeAttackEffectiveness(defenseType1, attackKey);
  const secondMultiplier = defenseType2 && defenseType2 !== defenseType1
    ? getSingleTypeAttackEffectiveness(defenseType2, attackKey)
    : 1;

  return firstMultiplier * secondMultiplier;
};
