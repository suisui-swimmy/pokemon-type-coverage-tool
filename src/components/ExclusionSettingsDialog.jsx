import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { typeData } from '../data/typeData';
import { getDefenseTypeKey } from '../utils/defenseTypeKey';

const CELL_SIZE = 44;

const ExclusionSettingsDialog = ({
  open,
  excludedDefenseTypeKeys,
  onApplyPreset,
  onClose,
  onExcludeAll,
  onReset,
  presets,
  onToggle,
}) => {
  const types = Object.keys(typeData);

  const getHeaderCellStyle = (type) => ({
    width: CELL_SIZE,
    height: CELL_SIZE,
    minWidth: CELL_SIZE,
    maxWidth: CELL_SIZE,
    padding: 0,
    border: '1px solid #ddd',
    backgroundColor: typeData[type].color,
    color: typeData[type].textColor,
    fontWeight: 400,
    textAlign: 'center',
  });

  const getCellStyle = (type1, type2, disabled, excluded) => {
    const baseStyle = {
      width: CELL_SIZE,
      height: CELL_SIZE,
      minWidth: CELL_SIZE,
      maxWidth: CELL_SIZE,
      padding: 0,
      border: '1px solid #ddd',
      fontSize: '12px',
      textAlign: 'center',
      verticalAlign: 'middle',
      userSelect: 'none',
      fontWeight: 400,
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: '#d7d7d7',
        color: '#777',
      };
    }

    if (excluded) {
      return {
        ...baseStyle,
        backgroundColor: '#3f3f46',
        color: '#fff',
        cursor: 'pointer',
      };
    }

    return {
      ...baseStyle,
      background: `linear-gradient(135deg, ${typeData[type1].color} 0 50%, ${typeData[type2].color} 50% 100%)`,
      color: '#111',
      cursor: 'pointer',
    };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>除外設定</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          現在のポケモンに存在しない防御タイプの組み合わせをクリックすると、弱点リストと追加候補集計から除外できます。
        </Typography>
        <Typography sx={{ mb: 2, fontWeight: 700 }}>
          除外中: {excludedDefenseTypeKeys.size}件
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>プリセット</Typography>
          {presets.map((preset) => (
            <Button key={preset.id} variant="outlined" onClick={() => onApplyPreset(preset)}>
              {preset.label}
            </Button>
          ))}
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table
            size="small"
            sx={{
              tableLayout: 'fixed',
              borderCollapse: 'collapse',
              width: 'max-content',
              margin: '0 auto',
              backgroundColor: 'white',
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...getHeaderCellStyle('無'), backgroundColor: '#f8f9fa', color: '#111' }} />
                {types.map((type) => (
                  <TableCell key={type} sx={getHeaderCellStyle(type)}>
                    {type}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {types.map((type1, rowIndex) => (
                <TableRow key={type1}>
                  <TableCell sx={getHeaderCellStyle(type1)}>{type1}</TableCell>
                  {types.map((type2, colIndex) => {
                    const disabled = rowIndex > colIndex;
                    const key = getDefenseTypeKey(type1, type2);
                    const excluded = excludedDefenseTypeKeys.has(key);

                    return (
                      <TableCell
                        key={type2}
                        aria-label={`${type1}${type2}を${excluded ? '集計に含める' : '集計から除外'}`}
                        onClick={() => {
                          if (!disabled) onToggle(key);
                        }}
                        sx={getCellStyle(type1, type2, disabled, excluded)}
                      >
                        <Box component="span" sx={{ display: 'block', lineHeight: 1.15 }}>
                          {disabled ? '-' : excluded ? '×' : type1 === type2 ? type1 : `${type1}${type2}`}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onExcludeAll}>
          すべて除外する
        </Button>
        <Button onClick={onReset} disabled={excludedDefenseTypeKeys.size === 0}>
          すべて含める
        </Button>
        <Button onClick={onClose} variant="contained">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExclusionSettingsDialog;
