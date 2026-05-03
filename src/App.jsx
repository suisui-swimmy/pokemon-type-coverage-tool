import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Box, Link, Paper, Button, IconButton, Tooltip } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TypeButton from './components/TypeButton';
import CoverageTable from './components/CoverageTable';
import ExclusionSettingsDialog from './components/ExclusionSettingsDialog';
import { typeData } from './data/typeData';
import { getAllDefenseTypeKeys, getDefenseTypeKey } from './utils/defenseTypeKey';
import infoIconUrl from './assets/info-icon.svg';
import settingsGearIconUrl from './assets/settings-gear-icon.svg';
import './App.css';

const EXCLUDED_DEFENSE_TYPES_STORAGE_KEY = 'pokemon-type-coverage-tool.excluded-defense-types';
const GENERATION_9_EXCLUDED_DEFENSE_TYPES = [
  ['無', '氷'],
  ['氷', '毒'],
  ['無', '虫'],
  ['無', '岩'],
  ['岩', '霊'],
  ['虫', '竜'],
  ['無', '鋼'],
  ['炎', '妖'],
  ['地', '妖'],
  ['竜', '妖'],
].map(([type1, type2]) => getDefenseTypeKey(type1, type2));

const theme = createTheme({
  typography: {
    fontFamily: '"M PLUS Rounded 1c", sans-serif',
  },
});

function App() {
  const [selectedTypes, setSelectedTypes] = useState([]);
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

  const excludedDefenseTypeKeySet = useMemo(
    () => new Set(excludedDefenseTypeKeys),
    [excludedDefenseTypeKeys]
  );

  useEffect(() => {
    window.localStorage.setItem(
      EXCLUDED_DEFENSE_TYPES_STORAGE_KEY,
      JSON.stringify(excludedDefenseTypeKeys)
    );
  }, [excludedDefenseTypeKeys]);

  const handleTypeClick = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleReset = () => {
    setSelectedTypes([]);
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

  const handleExcludeAllDefenseTypes = () => {
    setExcludedDefenseTypeKeys(getAllDefenseTypeKeys());
  };

  const handleApplyGeneration9Preset = () => {
    setExcludedDefenseTypeKeys(GENERATION_9_EXCLUDED_DEFENSE_TYPES);
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
                href="https://github.com/suisui-swimmy/pokemon-type-coverage-tool/blob/main/README.md"
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
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

          {selectedTypes.length > 0 && (
            <Box sx={{ my: 2 }}>
              <Typography variant="h5">
                <span style={{ fontSize: '24px' }}>▍選択したタイプ: </span>
                {selectedTypes.map((type) => (
                  <span
                    key={type}
                    style={{
                      backgroundColor: typeData[type].color,
                      color: typeData[type].textColor,
                      padding: '5px',
                      marginRight: '10px',
                      display: 'inline-block',
                      fontSize: '20px'
                    }}
                  >
                    {type}
                  </span>
                ))}
              </Typography>
            </Box>
          )}

          <CoverageTable
            selectedTypes={selectedTypes}
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
          onApplyGeneration9Preset={handleApplyGeneration9Preset}
          onClose={() => setIsSettingsOpen(false)}
          onExcludeAll={handleExcludeAllDefenseTypes}
          onReset={handleResetExcludedDefenseTypes}
          onToggle={handleToggleExcludedDefenseType}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
