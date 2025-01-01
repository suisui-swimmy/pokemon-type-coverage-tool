import React from 'react';
import { Button } from '@mui/material';
import { typeData } from '../data/typeData';

const TypeButton = ({ type, isSelected, onClick }) => {
  const { color, textColor } = typeData[type];

  return (
    <Button
      variant={isSelected ? "contained" : "outlined"}
      sx={{
        backgroundColor: isSelected ? color : 'transparent',
        color: isSelected ? textColor : color,
        border: `2px solid ${color}`,
        margin: '2px',
        minWidth: '52px',
        minHeight: '52px',
        width: '52px',
        height: '52px',
        borderRadius: '10px',
        '&:hover': {
          backgroundColor: isSelected ? color : 'rgba(0, 0, 0, 0.04)',
        },
      }}
      onClick={() => onClick(type)}
    >
      {type}
    </Button>
  );
};

export default TypeButton;