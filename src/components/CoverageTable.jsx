import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { typeData } from '../data/typeData';
import { typeEffectiveness } from '../data/typeEffectiveness';
import { getDefenseTypeKey } from '../utils/defenseTypeKey';
import TypeTag from './TypeTag';

const SECTION_STYLES = {
  0.25: {
    accent: '#6f73c8',
    surface: 'rgba(0, 0, 255, 0.4)',
    header: '#28456f',
    badgeBg: 'rgba(255, 255, 255, 0.45)',
    badgeText: '#20395f',
  },
  0.5: {
    accent: '#8a9fe8',
    surface: 'rgba(0, 0, 255, 0.2)',
    header: '#1f6872',
    badgeBg: 'rgba(255, 255, 255, 0.48)',
    badgeText: '#164d54',
  },
  1: {
    accent: '#b8b8b8',
    surface: '#f2f2f2',
    header: '#4e5358',
    badgeBg: '#dedede',
    badgeText: '#34383c',
  },
};

const CoverageTable = ({ selectedTypes, excludedDefenseTypeKeys }) => {
  const types = Object.keys(typeData);

  const getSectionStyle = (effectiveness) => SECTION_STYLES[effectiveness] || SECTION_STYLES[1];

  const isExcludedDefenseType = (defenseType1, defenseType2) => (
    excludedDefenseTypeKeys.has(getDefenseTypeKey(defenseType1, defenseType2))
  );

  const calculateMaxEffectiveness = (defenseType1, defenseType2, attackTypes) => {
    if (types.indexOf(defenseType1) > types.indexOf(defenseType2)) {
      return null;
    }

    if (isExcludedDefenseType(defenseType1, defenseType2)) {
      return 'excluded';
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
    if (value === 'excluded') return '×';
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

    if (value === 'excluded') return {
      ...baseStyle,
      backgroundColor: '#3f3f46',
      color: '#fff',
      fontSize: '20px',
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

  const renderTypeSummary = (effectiveness, typesList, sectionStyle) => {
    const summary = calculateTypeEffectivenessSummary(typesList);
    const availableMultipliers = [4, 2].filter(multiplier => summary[multiplier].length > 0);

    if (availableMultipliers.length === 0) return null;

    const renderSummaryEntries = (entries) => (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        {entries.map(([type, count]) => (
          <Box
            key={type}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            {renderTypeTag(type)}
            <Typography
              component="span"
              sx={{
                width: 44,
                display: 'inline-block',
                fontSize: '20px',
                whiteSpace: 'nowrap',
              }}
            >
              × {count}
            </Typography>
          </Box>
        ))}
      </Box>
    );
    
    return (
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: { xs: 'grid', sm: 'none' },
            backgroundColor: 'white',
            border: '1px solid #d8d8d8',
          }}
        >
          <Box
            sx={{
              backgroundColor: sectionStyle.accent,
              color: '#111',
              fontSize: '18px',
              fontWeight: 400,
              textAlign: 'center',
              py: 1,
              px: 1.25,
            }}
          >
            {effectiveness}倍のタイプに対し有効なタイプの合計
          </Box>
          <Box sx={{ display: 'grid' }}>
            {availableMultipliers.map(multiplier => (
              <Box
                key={multiplier}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '58px 1fr',
                  alignItems: 'start',
                  px: 1.25,
                  py: 1.5,
                  gap: 0.75,
                  minWidth: 0,
                  borderTop: '1px solid #d8d8d8',
                }}
              >
                <Typography sx={{ fontSize: '20px', whiteSpace: 'nowrap', lineHeight: '37px' }}>
                  {multiplier}倍
                </Typography>
                {renderSummaryEntries(summary[multiplier])}
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
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
                backgroundColor: sectionStyle.accent,
                color: '#111',
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
                  {renderSummaryEntries(summary[multiplier])}
                </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
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
        display: 'grid',
        gridTemplateColumns: '58px 1fr',
        alignItems: 'start',
        gap: 0.75,
        minWidth: 0,
      }}
    >
      <Typography sx={{ fontSize: '20px', whiteSpace: 'nowrap', lineHeight: '37px' }}>
        {multiplier}倍:
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, minWidth: 0 }}>
        {attackTypes.map(type => (
          <Box key={type}>
            {renderTypeTag(type)}
          </Box>
        ))}
      </Box>
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
          position: 'relative',
          ...(availableMultipliers.length > 1 && {
            '&::before': {
              content: '""',
              display: { xs: 'none', sm: 'block' },
              position: 'absolute',
              top: '-10px',
              bottom: '-10px',
              left: '50%',
              borderLeft: '1px solid #d8d8d8',
            },
          }),
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
            }}
          >
            {renderMultiplierAttackGroup(multiplier, effectiveness[multiplier])}
          </Box>
        ))}
      </Box>
    );
  };

  const renderMobileTypeDetailCard = (typePair) => {
    const [type1, type2] = Array.isArray(typePair) ? typePair : [typePair, null];
    const effectiveness = getEffectivenessForType(type1, type2);
    const availableMultipliers = [4, 2].filter(multiplier => effectiveness[multiplier]?.length);

    return (
      <Box
        key={type2 ? `${type1}-${type2}` : type1}
        sx={{
          p: 1.25,
          backgroundColor: 'white',
          border: '1px solid #d8d8d8',
          display: 'grid',
          gap: 1,
        }}
      >
        <Box sx={{ justifySelf: 'start' }}>
          {renderDefenseTypePair(typePair)}
        </Box>
        <Box sx={{ display: 'grid', gap: 0.75 }}>
          {availableMultipliers.map(multiplier => (
            <Box key={multiplier}>
              {renderMultiplierAttackGroup(multiplier, effectiveness[multiplier])}
            </Box>
          ))}
        </Box>
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
          const sectionStyle = getSectionStyle(effectiveness);

          return (
            <Box
              key={effectiveness}
              sx={{
                mt: 3,
                p: { xs: 1.5, sm: 2 },
                border: `3px solid ${sectionStyle.accent}`,
                backgroundColor: sectionStyle.surface,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#111' }}>
                  {effectiveness}倍のタイプ
                </Typography>
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: '4px',
                    backgroundColor: sectionStyle.badgeBg,
                    color: '#111',
                    fontSize: '14px',
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  {sortedTypesList.length}件
                </Box>
              </Box>
              {renderTypeSummary(effectiveness, sortedTypesList, sectionStyle)}
              <Box sx={{ mt: 2, display: { xs: 'none', sm: 'block' } }}>
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
                      backgroundColor: sectionStyle.accent,
                      color: '#111',
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
              <Box
                sx={{
                  mt: 2,
                  display: { xs: 'grid', sm: 'none' },
                  gap: 1,
                }}
              >
                {sortedTypesList.map(typePair => renderMobileTypeDetailCard(typePair))}
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
                  backgroundColor: '#f8f9fa',
                  position: 'sticky',
                  left: 0,
                  zIndex: 4,
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
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
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
