import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Box, Link, Paper, Button, IconButton, Tooltip } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TypeButton from './components/TypeButton';
import TypeTag from './components/TypeTag';
import SpecialMoveButton from './components/SpecialMoveButton';
import SpecialMoveTag from './components/SpecialMoveTag';
import CoverageTable from './components/CoverageTable';
import ExclusionSettingsDialog from './components/ExclusionSettingsDialog';
import { typeData } from './data/typeData';
import { specialAttackMoveIds } from './data/specialAttackMoves';
import { exclusionPresets } from './data/exclusionPresets';
import { getAllDefenseTypeKeys } from './utils/defenseTypeKey';
import infoIconUrl from './assets/info-icon.svg';
import settingsGearIconUrl from './assets/settings-gear-icon.svg';
import './App.css';

const EXCLUDED_DEFENSE_TYPES_STORAGE_KEY = 'pokemon-type-coverage-tool.excluded-defense-types';
const EXCLUDED_SPECIAL_MOVES_STORAGE_KEY = 'pokemon-type-coverage-tool.excluded-special-moves';

const theme = createTheme({
  typography: {
    fontFamily: '"LINE Seed JP", sans-serif',
  },
});

function App() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSpecialMoves, setSelectedSpecialMoves] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [excludedDefenseTypeKeys, setExcludedDefenseTypeKeys] = useState(() => {
    try {
      const savedValue = window.localStorage.getItem(EXCLUDED_DEFENSE_TYPES_STORAGE_KEY);
      const parsedValue = JSON.parse(savedValue);

      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
      return [];
    }
  });
  const [excludedSpecialMoveIds, setExcludedSpecialMoveIds] = useState(() => {
    try {
      const savedValue = window.localStorage.getItem(EXCLUDED_SPECIAL_MOVES_STORAGE_KEY);
      const parsedValue = JSON.parse(savedValue);

      return Array.isArray(parsedValue) ? parsedValue : specialAttackMoveIds;
    } catch {
      return specialAttackMoveIds;
    }
  });

  const excludedDefenseTypeKeySet = useMemo(
    () => new Set(excludedDefenseTypeKeys),
    [excludedDefenseTypeKeys]
  );
  const excludedSpecialMoveIdSet = useMemo(
    () => new Set(excludedSpecialMoveIds),
    [excludedSpecialMoveIds]
  );
  const availableSpecialMoveIds = useMemo(
    () => specialAttackMoveIds.filter((moveId) => !excludedSpecialMoveIdSet.has(moveId)),
    [excludedSpecialMoveIdSet]
  );
  const selectedAvailableSpecialMoves = useMemo(
    () => selectedSpecialMoves.filter((moveId) => !excludedSpecialMoveIdSet.has(moveId)),
    [excludedSpecialMoveIdSet, selectedSpecialMoves]
  );

  useEffect(() => {
    window.localStorage.setItem(
      EXCLUDED_DEFENSE_TYPES_STORAGE_KEY,
      JSON.stringify(excludedDefenseTypeKeys)
    );
  }, [excludedDefenseTypeKeys]);

  useEffect(() => {
    window.localStorage.setItem(
      EXCLUDED_SPECIAL_MOVES_STORAGE_KEY,
      JSON.stringify(excludedSpecialMoveIds)
    );
  }, [excludedSpecialMoveIds]);

  const handleTypeClick = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSpecialMoveClick = (moveId) => {
    setSelectedSpecialMoves(prev =>
      prev.includes(moveId)
        ? prev.filter(id => id !== moveId)
        : [...prev, moveId]
    );
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setSelectedSpecialMoves([]);
  };

  const handleToggleExcludedDefenseType = (key) => {
    setExcludedDefenseTypeKeys((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return Array.from(next);
    });
  };

  const handleResetExcludedDefenseTypes = () => {
    setExcludedDefenseTypeKeys([]);
  };

  const handleToggleExcludedSpecialMove = (moveId) => {
    const willExclude = !excludedSpecialMoveIdSet.has(moveId);

    if (willExclude) {
      setSelectedSpecialMoves((prev) => prev.filter((id) => id !== moveId));
    }

    setExcludedSpecialMoveIds((prev) => {
      const next = new Set(prev);

      if (next.has(moveId)) {
        next.delete(moveId);
      } else {
        next.add(moveId);
      }

      return Array.from(next);
    });
  };

  const handleExcludeAllDefenseTypes = () => {
    setExcludedDefenseTypeKeys(getAllDefenseTypeKeys());
  };

  const handleApplyExclusionPreset = (preset) => {
    setExcludedDefenseTypeKeys(preset.excludedDefenseTypeKeys);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth={false} disableGutters sx={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Box sx={{ 
          textAlign: 'center', 
          my: { xs: 2, sm: 2.5, md: 3 },
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'nowrap',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Typography
            variant="h4" 
            component="h1" 
            sx={{ 
              textAlign: 'left', 
              flex: '1 1 auto',
              minWidth: 0,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            ポケモン技範囲考察ツール
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 0 auto' }}>
            <Tooltip title="除外設定">
              <IconButton
                aria-label="除外設定を開く"
                onClick={() => setIsSettingsOpen(true)}
                sx={{ width: 40, height: 40 }}
              >
                <Box
                  component="img"
                  src={settingsGearIconUrl}
                  alt=""
                  sx={{ width: 24, height: 24, display: 'block' }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="使い方">
              <IconButton
                component={Link}
                href="https://github.com/suisui-swimmy/pokemon-type-coverage-tool/blob/main/README"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="使い方を開く"
                sx={{ width: 40, height: 40 }}
              >
                <Box
                  component="img"
                  src={infoIconUrl}
                  alt=""
                  sx={{ width: 24, height: 24, display: 'block' }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper sx={{ bgcolor: '#f4f6f7', p: 3 }}>
          <Box sx={{ display: 'grid', gap: 1.25, mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              {Object.keys(typeData).map((type) => (
                <TypeButton
                  key={type}
                  type={type}
                  isSelected={selectedTypes.includes(type)}
                  onClick={handleTypeClick}
                />
              ))}
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#808080',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#606060',
                  },
                }}
                onClick={handleReset}
              >
                リセット
              </Button>
            </Box>
            {availableSpecialMoveIds.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#333' }}>
                  特別技
                </Typography>
                {availableSpecialMoveIds.map((moveId) => (
                  <SpecialMoveButton
                    key={moveId}
                    moveId={moveId}
                    isSelected={selectedAvailableSpecialMoves.includes(moveId)}
                    onClick={handleSpecialMoveClick}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ my: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h5" component="span" sx={{ fontSize: '24px' }}>
              ▍選択した攻撃:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
              {selectedTypes.map((type) => (
                <TypeTag key={type} type={type} />
              ))}
              {selectedAvailableSpecialMoves.map((moveId) => (
                <SpecialMoveTag key={moveId} moveId={moveId} />
              ))}
            </Box>
          </Box>

          <CoverageTable
            selectedTypes={selectedTypes}
            selectedSpecialMoves={selectedAvailableSpecialMoves}
            availableSpecialMoveIds={availableSpecialMoveIds}
            excludedDefenseTypeKeys={excludedDefenseTypeKeySet}
          />
        </Paper>

        <Box 
          component="footer" 
          sx={{ 
            bgcolor: 'black', 
            color: 'white', 
            py: 2, 
            mt: 3, 
            textAlign: 'center' 
          }}
        >
          <Typography variant="body2">
            © 2024 suisui-swimmy
          </Typography>
        </Box>
        <ExclusionSettingsDialog
          open={isSettingsOpen}
          excludedDefenseTypeKeys={excludedDefenseTypeKeySet}
          excludedSpecialMoveIds={excludedSpecialMoveIdSet}
          onApplyPreset={handleApplyExclusionPreset}
          onClose={() => setIsSettingsOpen(false)}
          onExcludeAll={handleExcludeAllDefenseTypes}
          presets={exclusionPresets}
          onReset={handleResetExcludedDefenseTypes}
          onToggleSpecialMove={handleToggleExcludedSpecialMove}
          onToggle={handleToggleExcludedDefenseType}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
