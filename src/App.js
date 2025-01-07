import React, { useState, useCallback } from 'react';
import { Container, Typography, Box, Link, Paper, Button, IconButton, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TypeButton from './components/TypeButton';
import CoverageTable from './components/CoverageTable';
import { typeData } from './data/typeData';
import { typeEffectiveness } from './data/typeEffectiveness';
import './App.css';

const theme = createTheme({
  typography: {
    fontFamily: '"M PLUS Rounded 1c", sans-serif',
  },
});

function App() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const calculateTypeSummary = useCallback(() => {
    if (selectedTypes.length === 0) return { 4: 0, 2: 0, 1: 0, 0.5: 0, 0.25: 0, 0: 0 };

    const summary = { 4: 0, 2: 0, 1: 0, 0.5: 0, 0.25: 0, 0: 0 };
    const types = Object.keys(typeData);

    types.forEach(type1 => {
      types.forEach(type2 => {
        if (types.indexOf(type1) <= types.indexOf(type2)) {
          const effectivenesses = selectedTypes.map(attackType => {
            if (type1 === type2) {
              return typeEffectiveness[type1][attackType];
            }
            return typeEffectiveness[type1][attackType] * typeEffectiveness[type2][attackType];
          });

          const maxEffectiveness = effectivenesses.length > 0 
            ? Math.max(...effectivenesses)
            : 1;

          summary[maxEffectiveness] = (summary[maxEffectiveness] || 0) + 1;
        }
      });
    });

    return summary;
  }, [selectedTypes]);

  const formatCSVString = useCallback(() => {
    const summary = calculateTypeSummary();
    
    // 選択されたタイプのみを含む配列を作成
    const selectedTypesStr = selectedTypes.length > 0 
      ? selectedTypes.join(',') + ',' 
      : '';
    
    // 倍率の集計を追加
    const effectivenessColumns = `${summary[4]},${summary[2]},${summary[1]},${summary[0.5]},${summary[0.25]},${summary[0]}`;
    
    return `${selectedTypesStr}${effectivenessColumns}`;
  }, [selectedTypes, calculateTypeSummary]);

  const handleCopyClick = async () => {
    try {
      const csvString = formatCSVString();
      await navigator.clipboard.writeText(csvString);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const summary = calculateTypeSummary();

  return (
    <ThemeProvider theme={theme}>
      <Container>
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
              width: '70%', 
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            ポケモン技範囲考察ツール
          </Typography>
          <Box sx={{ width: '20%' }} />
          <Link 
            href="https://github.com/suisui-swimmy/pokemon-type-coverage-tool/blob/main/README.md" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              color: 'primary.main', 
              textDecoration: 'none',
              width: '10%',
              textAlign: 'right',
              whiteSpace: 'nowrap',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
            }}
          >
            使い方
          </Link>
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

          <Box sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <span style={{ fontSize: '24px' }}>▍選択したタイプ: </span>
                {selectedTypes.map((type) => (
                  <span
                    key={type}
                    style={{
                      backgroundColor: typeData[type].color,
                      color: typeData[type].textColor,
                      padding: '5px',
                      display: 'inline-block',
                      fontSize: '20px'
                    }}
                  >
                    {type}
                  </span>
                ))}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                <Typography sx={{ fontSize: '20px', whiteSpace: 'nowrap' }}>
                  {formatCSVString()}
                </Typography>
                <IconButton 
                  onClick={handleCopyClick}
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <CoverageTable selectedTypes={selectedTypes} />
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          message="集計をコピーしました"
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;