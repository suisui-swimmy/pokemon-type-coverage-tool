import React from 'react';
import { Box } from '@mui/material';
import { specialAttackMoves } from '../data/specialAttackMoves';

const SpecialMoveTag = ({ moveId }) => {
  const move = specialAttackMoves[moveId];

  return (
    <Box
      component="span"
      sx={{
        minHeight: 37,
        px: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: move.color,
        color: move.textColor,
        border: `2px solid ${move.borderColor}`,
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: 1.1,
        boxSizing: 'border-box',
        flex: '0 0 auto',
        whiteSpace: 'nowrap',
      }}
    >
      {move.label}
    </Box>
  );
};

export default SpecialMoveTag;
