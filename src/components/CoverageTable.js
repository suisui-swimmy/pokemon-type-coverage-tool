import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { typeData } from '../data/typeData';
import { typeEffectiveness } from '../data/typeEffectiveness';

const CoverageTable = ({ selectedTypes }) => {
  const types = Object.keys(typeData);
  const [maxItemsPerRow, setMaxItemsPerRow] = useState(5);

  useEffect(() => {
    const updateMaxItems = () => {
      const rootDiv = document.querySelector("#root > div");
      if (rootDiv) {
        const width = rootDiv.clientWidth;
        setMaxItemsPerRow(Math.floor((width - 64) / 100) || 5);
      }
    };

    updateMaxItems();
    window.addEventListener('resize', updateMaxItems);
    return () => window.removeEventListener('resize', updateMaxItems);
  }, []);

  const calculateMaxEffectiveness = (defenseType1, defenseType2, attackTypes) => {
    if (types.indexOf(defenseType1) > types.indexOf(defenseType2)) {
      return null;
    }
    
    if (!attackTypes.length) return '-';

    if (defenseType1 === defenseType2) {
      return Math.max(...attackTypes.map(attackType => 
        typeEffectiveness[defenseType1][attackType]
      ));
    }

    return Math.max(...attackTypes.map(attackType => 
      typeEffectiveness[defenseType1][attackType] * typeEffectiveness[defenseType2][attackType]
    ));
  };

  const getEffectivenessForType = (defenseType1, defenseType2) => {
    const effectiveness = {};
    
    types.forEach(attackType => {
      let multiplier = defenseType2 
        ? typeEffectiveness[defenseType1][attackType] * typeEffectiveness[defenseType2][attackType]
        : typeEffectiveness[defenseType1][attackType];
        
      if (multiplier === 2 || multiplier === 4) {
        effectiveness[multiplier] = effectiveness[multiplier] || [];
        effectiveness[multiplier].push(attackType);
      }
    });
    
    return effectiveness;
  };

  const formatEffectiveness = (value) => {
    if (value === null) return '';
    if (value === '-') return value;
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(2).replace(/\.?0+$/, '');
  };

  const getCellStyle = (value) => {
    const baseStyle = {
      width: '52px',
      height: '52px',
      maxWidth: '52px',
      maxHeight: '52px',
      minWidth: '52px',
      minHeight: '52px',
      padding: '0px',
      border: '1px solid #ddd',
      fontSize: '14px',
      textAlign: 'center',
      verticalAlign: 'middle'
    };

    if (value === null) return { 
      ...baseStyle,
      backgroundColor: '#999999'
    };

    const numValue = parseFloat(value);

    if (numValue === 4) return { 
      ...baseStyle, 
      backgroundColor: 'rgba(255, 0, 0, 0.8)',
      color: 'white'
    };
    if (numValue === 2) return { 
      ...baseStyle, 
      backgroundColor: 'rgba(255, 0, 0, 0.4)'
    };
    if (numValue === 1) return { 
      ...baseStyle, 
      backgroundColor: 'white'
    };
    if (numValue === 0.5) return { 
      ...baseStyle, 
      backgroundColor: 'rgba(0, 0, 255, 0.2)'
    };
    if (numValue === 0.25) return { 
      ...baseStyle, 
      backgroundColor: 'rgba(0, 0, 255, 0.4)'
    };
    if (numValue === 0) return { 
      ...baseStyle, 
      backgroundColor: 'rgba(0, 0, 255, 0.8)',
      color: 'white'
    };
    return { ...baseStyle, backgroundColor: 'white' };
  };

  const renderTypeTag = (type) => (
    <span
      style={{
        backgroundColor: typeData[type].color,
        color: typeData[type].textColor,
        padding: '5px',
        fontSize: '20px',
        display: 'inline-block'
      }}
    >
      {type}
    </span>
  );

  const findTypesByEffectiveness = () => {
    const typeGroups = { 0.25: [], 0.5: [], 1: [] };
    
    types.forEach(defenseType1 => {
      types.forEach(defenseType2 => {
        if (types.indexOf(defenseType1) <= types.indexOf(defenseType2)) {
          const effectiveness = calculateMaxEffectiveness(
            defenseType1,
            defenseType2,
            selectedTypes
          );
          
          if (effectiveness === 0.25 || effectiveness === 0.5 || effectiveness === 1) {
            const typePair = defenseType1 === defenseType2 
              ? defenseType1 
              : [defenseType1, defenseType2];
            typeGroups[effectiveness].push(typePair);
          }
        }
      });
    });

    return typeGroups;
  };

  const calculateTypeEffectivenessSummary = (typesList) => {
    const summary = {
      4: new Map(),
      2: new Map()
    };

    typesList.forEach(typePair => {
      const [type1, type2] = Array.isArray(typePair) ? typePair : [typePair, null];
      const effectiveness = getEffectivenessForType(type1, type2);

      [4, 2].forEach(multiplier => {
        if (effectiveness[multiplier]) {
          effectiveness[multiplier].forEach(attackType => {
            summary[multiplier].set(
              attackType,
              (summary[multiplier].get(attackType) || 0) + 1
            );
          });
        }
      });
    });

    return {
      4: Array.from(summary[4].entries())
        .sort(([, a], [, b]) => b - a || types.indexOf(a) - types.indexOf(b)),
      2: Array.from(summary[2].entries())
        .sort(([, a], [, b]) => b - a || types.indexOf(a) - types.indexOf(b))
    };
  };

  const renderTypeSummary = (typesList) => {
    const summary = calculateTypeEffectivenessSummary(typesList);
    
    return (
      <Box sx={{ mt: 2, ml: 2 }}>
        {[4, 2].map(multiplier => {
          if (summary[multiplier].length === 0) return null;
          
          const chunks = Array.from(
            { length: Math.ceil(summary[multiplier].length / maxItemsPerRow) },
            (_, i) => summary[multiplier].slice(i * maxItemsPerRow, (i + 1) * maxItemsPerRow)
          );
          
          return (
            <Box key={multiplier}>
              <Typography sx={{ fontSize: '20px', mb: 1 }}>
                {multiplier}倍のタイプ:
              </Typography>
              {chunks.map((chunk, index) => (
                <Table 
                  key={index}
                  size="small" 
                  sx={{ 
                    width: 'auto',
                    backgroundColor: 'white',
                    mb: 2,
                    '& td': {
                      border: '1px solid #ddd',
                      padding: '8px 16px',
                      textAlign: 'center'
                    }
                  }}
                >
                  <TableBody>
                    <TableRow>
                      {chunk.map(([type]) => (
                        <TableCell key={type} sx={{ minWidth: '52px' }}>
                          {renderTypeTag(type)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      {chunk.map(([type, count]) => (
                        <TableCell key={type}>
                          <Typography sx={{ fontSize: '20px' }}>
                            × {count}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              ))}
            </Box>
          );
        })}
      </Box>
    );
  };

  const sortTypesByEffectiveness = (typesList) => {
    return typesList.sort((a, b) => {
      const getEffectivenessScore = (typePair) => {
        const [type1, type2] = Array.isArray(typePair) ? typePair : [typePair, null];
        const effectiveness = getEffectivenessForType(type1, type2);
        
        return (effectiveness[4]?.length || 0) * 2 + (effectiveness[2]?.length || 0);
      };

      return getEffectivenessScore(b) - getEffectivenessScore(a);
    });
  };

  const renderWeaknessInfo = (defenseType1, defenseType2 = null) => {
    const effectiveness = getEffectivenessForType(defenseType1, defenseType2);
    return (
      <Box sx={{ ml: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        {[4, 2].map(multiplier => {
          if (!effectiveness[multiplier]?.length) return null;
          return (
            <Box key={multiplier} sx={{ display: 'inline-flex', alignItems: 'center', mr: 2 }}>
              <Typography sx={{ mr: 1, fontSize: '20px', whiteSpace: 'nowrap' }}>
                {multiplier}倍:
              </Typography>
              {effectiveness[multiplier].map(type => (
                <Box key={type} sx={{ mr: 0.5 }}>
                  {renderTypeTag(type)}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderTypesList = () => {
    if (selectedTypes.length === 0) return null;

    const typeGroups = findTypesByEffectiveness();
    
    return (
      <Box sx={{ mt: 2 }}>
        {[0.25, 0.5, 1].map(effectiveness => {
          const typesList = typeGroups[effectiveness];
          if (typesList.length === 0) return null;

          const sortedTypesList = sortTypesByEffectiveness(typesList);

          return (
            <Box key={effectiveness}>
              <Typography variant="h5" sx={{ mt: 1, fontSize: '24px' }}>
                ▍{effectiveness}倍のタイプ:
              </Typography>
              <Box sx={{ ml: 2, mt: 1 }}>
                {sortedTypesList.map((typePair, index) => {
                  if (Array.isArray(typePair)) {
                    const [type1, type2] = typePair;
                    return (
                      <Box key={`${type1}-${type2}`} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {renderTypeTag(type1)}
                          {renderTypeTag(type2)}
                        </Box>
                        {renderWeaknessInfo(type1, type2)}
                      </Box>
                    );
                  }
                  return (
                    <Box key={typePair} sx={{ mb: 2 }}>
                      <Box>
                        {renderTypeTag(typePair)}
                      </Box>
                      {renderWeaknessInfo(typePair)}
                    </Box>
                  );
                })}
                {renderTypeSummary(sortedTypesList)}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 3,
          width: '100%',
          overflowX: 'auto',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          '& .MuiPaper-root': {
            boxShadow: 'none',
            backgroundColor: 'transparent'
          }
        }}
      >
        <Table 
          size="small" 
          sx={{ 
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            width: 'max-content',
            margin: '0 auto',
            backgroundColor: 'white'
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell 
                style={{
                  ...getCellStyle('-'),
                  backgroundColor: '#f8f9fa'
                }}
              />
              {types.map(type => (
                <TableCell 
                  key={type} 
                  style={{
                    ...getCellStyle('-'),
                    backgroundColor: typeData[type].color,
                    color: typeData[type].textColor,
                  }}
                >
                  {type}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {types.map(defenseType1 => (
              <TableRow key={defenseType1}>
                <TableCell
                  style={{
                    ...getCellStyle('-'),
                    backgroundColor: typeData[defenseType1].color,
                    color: typeData[defenseType1].textColor,
                  }}
                >
                  {defenseType1}
                </TableCell>
                {types.map(defenseType2 => {
                  const effectiveness = calculateMaxEffectiveness(
                    defenseType1, 
                    defenseType2, 
                    selectedTypes
                  );
                  return (
                    <TableCell
                      key={defenseType2}
                      style={getCellStyle(effectiveness)}
                    >
                      {formatEffectiveness(effectiveness)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {renderTypesList()}
    </>
  );
};

export default CoverageTable;