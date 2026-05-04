import React from 'react';
import { Button } from '@mui/material';
import { specialAttackMoves } from '../data/specialAttackMoves';
import { typeData } from '../data/typeData';

const getSelectedBackground = (moveId, move) => {
  if (moveId === 'flyingPress') {
    return `linear-gradient(135deg, ${typeData.闘.color} 0 50%, ${typeData.飛.color} 50% 100%)`;
  }

  return move.color;
};

const SpecialMoveButton = ({ moveId, isSelected, onClick }) => {
  const move = specialAttackMoves[moveId];
  const selectedBackground = getSelectedBackground(moveId, move);

  return (
    <Button
      variant={isSelected ? 'contained' : 'outlined'}
      aria-pressed={isSelected}
      sx={{
        minHeight: '44px',
        px: 1.75,
        borderRadius: '10px',
        border: `2px solid ${move.borderColor}`,
        background: isSelected ? selectedBackground : 'white',
        color: isSelected ? move.textColor : move.borderColor,
        fontWeight: 700,
        boxShadow: isSelected ? '0 2px 6px rgba(0, 0, 0, 0.24)' : 'none',
        '&:hover': {
          background: isSelected ? selectedBackground : 'rgba(0, 0, 0, 0.04)',
          border: `2px solid ${move.borderColor}`,
        },
      }}
      onClick={() => onClick(moveId)}
    >
      {move.label}
    </Button>
  );
};

export default SpecialMoveButton;
