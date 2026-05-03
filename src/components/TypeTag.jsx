import React from 'react';
import { Box } from '@mui/material';
import { typeData } from '../data/typeData';

const TypeTag = ({ type }) => (
  <Box
    component="span"
    sx={{
      width: 30,
      height: 37,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: typeData[type].color,
      color: typeData[type].textColor,
      fontSize: '20px',
      lineHeight: 1,
      boxSizing: 'border-box',
      flex: '0 0 auto',
    }}
  >
    {type}
  </Box>
);

export default TypeTag;
