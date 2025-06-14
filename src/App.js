import React, { useState } from 'react';
import { Container, Typography, Box, Link, Paper, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TypeButton from './components/TypeButton';
import CoverageTable from './components/CoverageTable';
import { typeData } from './data/typeData';
import './App.css';

const theme = createTheme({
  typography: {
    fontFamily: '"M PLUS Rounded 1c", sans-serif',
  },
});

function App() {
  const [selectedTypes, setSelectedTypes] = useState([]);

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
      </Container>
    </ThemeProvider>
  );
}

export default App;