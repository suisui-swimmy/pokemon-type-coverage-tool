import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { typeData } from '../data/typeData';
import { specialAttackMoveIds } from '../data/specialAttackMoves';
import { getAttackEffectiveness, isTypeAttack } from '../utils/attackEffectiveness';
import { getDefenseTypeKey } from '../utils/defenseTypeKey';
import { getYakkunTypeSearchUrl } from '../utils/yakkunTypeSearch';
import TypeTag from './TypeTag';
import SpecialMoveTag from './SpecialMoveTag';

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

const CoverageTable = ({
  selectedTypes,
  selectedSpecialMoves = [],
  availableSpecialMoveIds = specialAttackMoveIds,
  excludedDefenseTypeKeys,
}) => {
  const types = Object.keys(typeData);
  const attackOptions = [...types, ...availableSpecialMoveIds];
  const selectedAttackKeys = [...selectedTypes, ...selectedSpecialMoves];

  const getSectionStyle = (effectiveness) => SECTION_STYLES[effectiveness] || SECTION_STYLES[1];

  const isExcludedDefenseType = (defenseType1, defenseType2) => (
    excludedDefenseTypeKeys.has(getDefenseTypeKey(defenseType1, defenseType2))
  );

  const calculateMaxEffectiveness = (defenseType1, defenseType2, attackKeys) => {
    if (types.indexOf(defenseType1) > types.indexOf(defenseType2)) {
      return null;
    }

    if (isExcludedDefenseType(defenseType1, defenseType2)) {
      return 'excluded';
    }
    
    if (!attackKeys.length) return '-';

    return Math.max(...attackKeys.map(attackKey => (
      getAttackEffectiveness(defenseType1, defenseType2, attackKey)
    )));
  };

  const getEffectivenessForType = (defenseType1, defenseType2) => {
    const effectiveness = {};
    
    attackOptions.forEach(attackType => {
      const multiplier = getAttackEffectiveness(defenseType1, defenseType2, attackType);
        
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

  const renderAttackTag = (attackType) => (
    isTypeAttack(attackType)
      ? <TypeTag type={attackType} />
      : <SpecialMoveTag moveId={attackType} />
  );

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
            selectedAttackKeys
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
        .sort(([typeA, countA], [typeB, countB]) => countB - countA || attackOptions.indexOf(typeA) - attackOptions.indexOf(typeB)),
      2: Array.from(summary[2].entries())
        .sort(([typeA, countA], [typeB, countB]) => countB - countA || attackOptions.indexOf(typeA) - attackOptions.indexOf(typeB))
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
            {renderAttackTag(type)}
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
            display: { xs: 'block', sm: 'none' },
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
            {effectiveness}倍のタイプに対し有効な攻撃の合計
          </Box>
          <Table
            size="small"
            sx={{
              width: '100%',
              tableLayout: 'fixed',
              borderCollapse: 'collapse',
              '& td': {
                border: '1px solid #d8d8d8',
                padding: '10px 8px',
                verticalAlign: 'middle',
              },
            }}
          >
            <colgroup>
              <col style={{ width: '76px' }} />
              <col />
            </colgroup>
            <TableBody>
              {availableMultipliers.map(multiplier => (
                <TableRow key={multiplier}>
                  <TableCell
                    sx={{
                      textAlign: 'center',
                      fontSize: '20px',
                      whiteSpace: 'nowrap',
                    }}
                  >
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
            <colgroup>
              <col style={{ width: '160px' }} />
              <col />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell component="th" colSpan={2}>
                  {effectiveness}倍のタイプに対し有効な攻撃の合計
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableMultipliers.map(multiplier => (
                <TableRow key={multiplier}>
                  <TableCell sx={{ textAlign: 'center', fontSize: '20px', whiteSpace: 'nowrap' }}>
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
    const typeTags = typeList.map(type => (
      <Box key={type}>
        <TypeTag type={type} />
      </Box>
    ));

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          component="a"
          href={getYakkunTypeSearchUrl(typeList)}
          target="_blank"
          rel="noopener noreferrer"
          title={`ポケモン徹底攻略で${typeList.map(type => typeData[type].name).join('・')}タイプのポケモン一覧を開く`}
          aria-label={`ポケモン徹底攻略で${typeList.map(type => typeData[type].name).join('・')}タイプのポケモン一覧を開く`}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            color: 'inherit',
            textDecoration: 'none',
            '&:focus-visible': {
              outline: '3px solid #1a73e8',
              outlineOffset: '3px',
            },
          }}
        >
          {typeTags}
        </Box>
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
            {renderAttackTag(type)}
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

  const renderMobileTypesTable = (effectiveness, sortedTypesList, sectionStyle) => (
    <Table
      size="small"
      sx={{
        width: '100%',
        tableLayout: 'fixed',
        backgroundColor: 'white',
        borderCollapse: 'collapse',
        '& th, & td': {
          border: '1px solid #d8d8d8',
          padding: '10px 8px',
          verticalAlign: 'top',
        },
        '& th': {
          backgroundColor: sectionStyle.accent,
          color: '#111',
          fontSize: '18px',
          fontWeight: 400,
          textAlign: 'center',
        },
        '& tbody td:first-of-type': {
          verticalAlign: 'middle',
        },
      }}
    >
      <colgroup>
        <col style={{ width: '76px' }} />
        <col />
      </colgroup>
      <TableHead>
        <TableRow>
          <TableCell component="th" colSpan={2}>
            {effectiveness}倍のタイプ一覧
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedTypesList.map((typePair) => {
          const [type1, type2] = Array.isArray(typePair) ? typePair : [typePair, null];
          const rowKey = type2 ? `${type1}-${type2}` : type1;

          return (
            <TableRow key={rowKey}>
              <TableCell
                sx={{
                  width: 76,
                  padding: '8px 4px',
                }}
              >
                {renderDefenseTypePair(typePair)}
              </TableCell>
              <TableCell sx={{ minWidth: 0 }}>
                {renderEffectiveAttackTypes(type1, type2)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const renderTypesList = () => {
    if (selectedAttackKeys.length === 0) return null;

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
                  <colgroup>
                    <col style={{ width: '160px' }} />
                    <col />
                  </colgroup>
                  <TableHead>
                    <TableRow>
                      <TableCell component="th">
                        {effectiveness}倍のタイプ
                      </TableCell>
                      <TableCell component="th">
                        有効な攻撃
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
                  display: { xs: 'block', sm: 'none' },
                }}
              >
                {renderMobileTypesTable(effectiveness, sortedTypesList, sectionStyle)}
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
                    selectedAttackKeys
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
