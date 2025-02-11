import React, { useState, useCallback, useEffect } from 'react';
import { Container, Typography, Box, Link, Paper, Button, IconButton, Snackbar, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DeleteIcon from '@mui/icons-material/Delete';
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

const DEFAULT_SUMMARY = { 4: 0, 2: 0, 1: 0, 0.5: 0, 0.25: 0, 0: 0 };

function App() {
 const [selectedTypes, setSelectedTypes] = useState([]);
 const [snackbarOpen, setSnackbarOpen] = useState(false);
 const [dataRows, setDataRows] = useState([]);
 const [editingIndex, setEditingIndex] = useState(-1);
 const [mode, setMode] = useState('compare');

 useEffect(() => {
   const handleKeyPress = (event) => {
     if (event.shiftKey && event.key === 'Enter') {
       event.preventDefault();
       handleNewLine();
     }
   };

   window.addEventListener('keydown', handleKeyPress);
   return () => window.removeEventListener('keydown', handleKeyPress);
 }, [selectedTypes]);

 const handleTypeClick = (type) => {
   setSelectedTypes(prev => 
     prev.includes(type) 
       ? prev.filter(t => t !== type)
       : [...prev, type]
   );
 };

 const handleReset = () => {
   setSelectedTypes([]);
   setDataRows([]);
   setEditingIndex(-1);
 };

 const getTypesToCalculate = useCallback((includeCurrentRow = false) => {
   let typesToCalculate = [...selectedTypes];
   
   if (mode === 'total') {
     dataRows.forEach((row, index) => {
       if (includeCurrentRow || index !== editingIndex) {
         typesToCalculate.push(...row.types);
       }
     });
   }
   
   return Array.from(new Set(typesToCalculate));
 }, [selectedTypes, dataRows, mode, editingIndex]);

 const calculateTypeSummary = useCallback(() => {
   const typesToCalculate = getTypesToCalculate(true);
   
   if (typesToCalculate.length === 0) return DEFAULT_SUMMARY;

   const summary = { ...DEFAULT_SUMMARY };
   const types = Object.keys(typeData);

   types.forEach(type1 => {
     types.forEach(type2 => {
       if (types.indexOf(type1) <= types.indexOf(type2)) {
         const effectivenesses = typesToCalculate.map(attackType => {
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
 }, [getTypesToCalculate]);

 const formatCSVString = useCallback(() => {
   const summary = calculateTypeSummary();
   const typesToShow = mode === 'total' ? getTypesToCalculate(true) : selectedTypes;
   
   const selectedTypesStr = typesToShow.length > 0 
     ? typesToShow.join(',') + ',' 
     : '';
   
   const effectivenessColumns = `${summary[4]},${summary[2]},${summary[1]},${summary[0.5]},${summary[0.25]},${summary[0]}`;
   
   return `${selectedTypesStr}${effectivenessColumns}`;
 }, [mode, getTypesToCalculate, selectedTypes, calculateTypeSummary]);

 const handleNewLine = () => {
   if (editingIndex !== -1) {
     const updatedRows = [...dataRows];
     updatedRows[editingIndex] = {
       types: [...selectedTypes],
       csvString: formatCSVString()
     };
     setDataRows(updatedRows);
     setEditingIndex(-1);
   } else {
     const currentData = {
       types: [...selectedTypes],
       csvString: formatCSVString()
     };
     setDataRows(prev => [...prev, currentData]);
   }
   setSelectedTypes([]);
 };

 const handleDeleteRow = (index) => {
   setDataRows(prev => prev.filter((_, i) => i !== index));
   if (editingIndex === index) {
     setEditingIndex(-1);
     setSelectedTypes([]);
   }
 };

 const handleRowClick = (index) => {
   setEditingIndex(index);
   setSelectedTypes([...dataRows[index].types]);
 };

 const handleCopyClick = async () => {
   try {
     let textToCopy = '';
     if (dataRows.length > 0) {
       textToCopy = dataRows.map(row => row.csvString).join('\n');
       if (selectedTypes.length > 0) {
         textToCopy += '\n' + formatCSVString();
       }
     } else if (selectedTypes.length > 0) {
       textToCopy = formatCSVString();
     } else {
       textToCopy = '0,0,0,0,0,0';
     }
     
     await navigator.clipboard.writeText(textToCopy);
     setSnackbarOpen(true);
   } catch (err) {
     console.error('Failed to copy text: ', err);
   }
 };

 const handleSnackbarClose = () => {
   setSnackbarOpen(false);
 };

 const renderTypeTag = (type) => (
   <span
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
 );

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
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
           <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
             {Object.keys(typeData).map((type) => (
               <TypeButton
                 key={type}
                 type={type}
                 isSelected={selectedTypes.includes(type)}
                 onClick={handleTypeClick}
               />
             ))}
           </Box>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <RadioGroup
               row
               value={mode}
               onChange={(e) => setMode(e.target.value)}
             >
               <FormControlLabel 
                 value="compare" 
                 control={<Radio />} 
                 label="比較" 
                 sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }}
               />
               <FormControlLabel 
                 value="total" 
                 control={<Radio />} 
                 label="合算" 
                 sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }}
               />
             </RadioGroup>
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
         </Box>

         <Box sx={{ my: 2 }}>
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
             <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
               <Typography variant="h5" sx={{ fontSize: '24px', width: '210px', flexShrink: 0 }}>
                 ▍選択したタイプ:
               </Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                 {dataRows.map((row, index) => (
                   <Box 
                     key={index} 
                     sx={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       gap: 2,
                       bgcolor: editingIndex === index ? 'rgba(0,0,0,0.05)' : 'transparent',
                       p: 1,
                       borderRadius: 1,
                       cursor: 'pointer'
                     }}
                     onClick={() => handleRowClick(index)}
                   >
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
                       {row.types.map((type, typeIndex) => (
                         <React.Fragment key={typeIndex}>
                           {renderTypeTag(type)}
                         </React.Fragment>
                       ))}
                     </Box>
                     <Typography sx={{ fontSize: '20px', fontFamily: 'M PLUS Rounded 1c", sans-serif' }}>
                       {row.csvString}
                     </Typography>
                     <IconButton
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDeleteRow(index);
                       }}
                       size="small"
                       sx={{ 
                         backgroundColor: 'rgba(0,0,0,0.1)',
                         '&:hover': {
                           backgroundColor: 'rgba(0,0,0,0.2)',
                         }
                       }}
                     >
                       <DeleteIcon fontSize="small" />
                     </IconButton>
                   </Box>
                 ))}
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
                     {selectedTypes.map((type, index) => (
                       <React.Fragment key={index}>
                         {renderTypeTag(type)}
                       </React.Fragment>
                     ))}
                   </Box>
                   <Typography sx={{ fontSize: '20px', fontFamily: 'M PLUS Rounded 1c", sans-serif' }}>
                     {formatCSVString() || '0,0,0,0,0,0'}
                   </Typography>
                   <IconButton
                     onClick={handleNewLine}
                     size="small"
                     sx={{ 
                       backgroundColor: 'rgba(0,0,0,0.1)',
                       '&:hover': {
                         backgroundColor: 'rgba(0,0,0,0.2)',
                       }
                     }}
                     title={editingIndex !== -1 ? "更新" : "Shift + Enter"}
                   >
                     <KeyboardReturnIcon fontSize="small" />
                   </IconButton>
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
           </Box>
         </Box>

         <CoverageTable 
           selectedTypes={mode === 'total' 
             ? [...selectedTypes, ...dataRows.flatMap(row => row.types)]
             : selectedTypes
           } 
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