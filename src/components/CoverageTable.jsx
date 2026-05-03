import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { typeData } from '../data/typeData';
import { typeEffectiveness } from '../data/typeEffectiveness';
import { getDefenseTypeKey } from '../utils/defenseTypeKey';
import TypeTag from './TypeTag';

const CoverageTable = ({ selectedTypes, excludedDefenseTypeKeys }) => {
  const types = Object.keys(typeData);

  const isExcludedDefenseType = (defenseType1, defenseType2) => (
    excludedDefenseTypeKeys.has(getDefenseTypeKey(defenseType1, defenseType2))
  );

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

  const renderTypeTag = (type) => <TypeTag type={type} />;

  const findTypesByEffectiveness = () => {
    const typeGroups = { 0.25: [], 0.5: [], 1: [] };
    
    types.forEach(defenseType1 => {
      types.forEach(defenseType2 => {
        if (
          types.indexOf(defenseType1) <= types.indexOf(defenseType2) &&
          !isExcludedDefenseType(defenseType1, defenseType2)
        ) {
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
        .sort(([typeA, countA], [typeB, countB]) => countB - countA || types.indexOf(typeA) - types.indexOf(typeB)),
      2: Array.from(summary[2].entries())
        .sort(([typeA, countA], [typeB, countB]) => countB - countA || types.indexOf(typeA) - types.indexOf(typeB))
    };
  };

  const renderTypeSummary = (effectiveness, typesList) => {
    const summary = calculateTypeEffectivenessSummary(typesList);
    const availableMultipliers = [4, 2].filter(multiplier => summary[multiplier].length > 0);

    if (availableMultipliers.length === 0) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Table
          size="small"
          sx={{
            width: '100%',
            tableLayout: 'fixed',
            backgroundColor: 'white',
            borderCollapse: 'collapse',
            '& th, & td': {
              border: '1px solid #d8d8d8',
              padding: '10px 12px',
              verticalAlign: 'middle',
            },
            '& th': {
              backgroundColor: '#333',
              color: 'white',
              fontSize: '18px',
              fontWeight: 400,
              textAlign: 'center',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell component="th" colSpan={2}>
                {effectiveness}倍のタイプに対し有効なタイプの合計
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableMultipliers.map(multiplier => (
              <TableRow key={multiplier}>
                <TableCell sx={{ width: 96, textAlign: 'center', fontSize: '20px', whiteSpace: 'nowrap' }}>
                  {multiplier}倍
                </TableCell>
                <TableCell sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    {summary[multiplier].map(([type, count]) => (
                      <Box
                        key={type}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                        }}
                      >
                        {renderTypeTag(type)}
                        <Typography component="span" sx={{ fontSize: '20px', whiteSpace: 'nowrap' }}>
                          × {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

  const renderDefenseTypePair = (typePair) => {
    const typeList = Array.isArray(typePair) ? typePair : [typePair];

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
        {typeList.map(type => (
          <Box key={type}>
            {renderTypeTag(type)}
          </Box>
        ))}
      </Box>
    );
  };

  const renderMultiplierAttackGroup = (multiplier, attackTypes) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        flexWrap: 'wrap',
        minWidth: 0,
      }}
    >
      <Typography sx={{ fontSize: '20px', whiteSpace: 'nowrap' }}>
        {multiplier}倍:
      </Typography>
      {attackTypes.map(type => (
        <Box key={type}>
          {renderTypeTag(type)}
        </Box>
      ))}
    </Box>
  );

  const renderEffectiveAttackTypes = (defenseType1, defenseType2 = null) => {
    const effectiveness = getEffectivenessForType(defenseType1, defenseType2);
    const availableMultipliers = [4, 2].filter(multiplier => effectiveness[multiplier]?.length);

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: availableMultipliers.length > 1 ? { xs: '1fr', sm: '1fr 1fr' } : '1fr',
          alignItems: 'stretch',
          minWidth: 0,
        }}
      >
        {availableMultipliers.map((multiplier, index) => (
          <Box
            key={multiplier}
            sx={{
              minWidth: 0,
              py: 0.5,
              pl: index === 0 ? 0 : { xs: 0, sm: 1.5 },
              pr: index === 0 && availableMultipliers.length > 1 ? { xs: 0, sm: 1.5 } : 0,
              borderLeft: index === 0 ? 0 : { xs: 0, sm: '1px solid #d8d8d8' },
            }}
          >
            {renderMultiplierAttackGroup(multiplier, effectiveness[multiplier])}
          </Box>
        ))}
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
              {renderTypeSummary(effectiveness, sortedTypesList)}
              <Box sx={{ mt: 2 }}>
                <Table
                  size="small"
                  sx={{
                    width: '100%',
                    tableLayout: 'fixed',
                    backgroundColor: 'white',
                    borderCollapse: 'collapse',
                    '& th, & td': {
                      border: '1px solid #d8d8d8',
                      padding: '10px 12px',
                      verticalAlign: 'middle',
                    },
                    '& th': {
                      backgroundColor: '#222',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 400,
                      textAlign: 'center',
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell component="th" sx={{ width: 220 }}>
                        {effectiveness}倍のタイプ
                      </TableCell>
                      <TableCell component="th">
                        有効なタイプ
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedTypesList.map((typePair) => {
                      const [type1, type2] = Array.isArray(typePair) ? typePair : [typePair, null];
                      const rowKey = type2 ? `${type1}-${type2}` : type1;

                      return (
                        <TableRow key={rowKey}>
                          <TableCell>
                            {renderDefenseTypePair(typePair)}
                          </TableCell>
                          <TableCell>
                            {renderEffectiveAttackTypes(type1, type2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
