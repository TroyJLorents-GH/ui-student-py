/**
 * Shared DataGrid Pro styles and toolbar used across all dashboard pages.
 * Import these instead of duplicating the maroon-header styling.
 */
import React, { useState, useRef } from 'react';
import {
  gridDensitySelector,
  ToolbarButton,
  useGridApiContext,
  useGridSelector,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid-pro';
import {
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';

// Density options for the toolbar menu
const DENSITY_OPTIONS = [
  { label: 'Compact density', value: 'compact' },
  { label: 'Standard density', value: 'standard' },
  { label: 'Comfortable density', value: 'comfortable' },
];

/**
 * Custom DataGrid toolbar with Columns, Filters, Export, Quick Search, and Density selector.
 */
export function CustomToolbar() {
  const apiRef = useGridApiContext();
  const density = useGridSelector(apiRef, gridDensitySelector);
  const [densityMenuOpen, setDensityMenuOpen] = useState(false);
  const densityMenuTriggerRef = useRef(null);

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarExport />
      <GridToolbarQuickFilter />

      <Tooltip title="Adjust row density">
        <ToolbarButton
          ref={densityMenuTriggerRef}
          id="density-menu-trigger"
          aria-controls="density-menu"
          aria-haspopup="true"
          aria-expanded={densityMenuOpen ? 'true' : undefined}
          onClick={() => setDensityMenuOpen(true)}
        >
          <SettingsIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>

      <Menu
        id="density-menu"
        anchorEl={densityMenuTriggerRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={densityMenuOpen}
        onClose={() => setDensityMenuOpen(false)}
        slotProps={{
          list: {
            'aria-labelledby': 'density-menu-trigger',
          },
        }}
      >
        {DENSITY_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              apiRef.current.setDensity(option.value);
              setDensityMenuOpen(false);
            }}
          >
            <ListItemIcon>
              {density === option.value && <CheckIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </GridToolbarContainer>
  );
}

/**
 * Returns theme-aware sx styles for DataGridPro with maroon headers and striped rows.
 * @param {object} theme - MUI theme object from useTheme()
 */
export function getDataGridSx(theme) {
  const primary = theme.palette.primary.main;
  const primaryDark = theme.palette.primary.dark;
  const white = theme.palette.primary.contrastText;

  return {
    '& .MuiDataGrid-toolbar': { justifyContent: 'flex-start' },
    '& .MuiDataGrid-cell': { textAlign: 'center' },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 'bold',
      fontSize: '1.1em',
      color: white,
    },
    '& .MuiDataGrid-columnHeaders': {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: primary,
      '& .MuiDataGrid-columnHeader': {
        backgroundColor: primary,
        '&:hover': { backgroundColor: primaryDark },
      },
      '& .MuiDataGrid-iconSeparator': { color: white },
      '& .MuiDataGrid-menuIcon': { color: white },
      '& .MuiDataGrid-sortIcon': { color: white },
      '& .MuiDataGrid-filterIcon': { color: white },
      '& .MuiInputBase-root': {
        color: white,
        '& input': {
          color: white,
          '&::placeholder': { color: 'rgba(255, 255, 255, 0.7)', opacity: 1 },
        },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.8)' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: white },
      },
      '& .MuiSelect-icon': { color: white },
      '& .MuiDataGrid-columnHeaderTitleContainer': {
        '& .MuiSvgIcon-root': { color: white },
      },
      '& .MuiDataGrid-filterIcon svg': { color: white },
      '& .MuiFormLabel-root, & .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.85)' },
      '& .MuiIconButton-root': { color: 'rgba(255, 255, 255, 0.75)' },
    },
    '& .even-row': {
      backgroundColor: '#f5f5f5',
      '&:hover': { backgroundColor: '#e8e8e8' },
    },
    '& .odd-row': {
      backgroundColor: '#ffffff',
      '&:hover': { backgroundColor: '#f0f0f0' },
    },
  };
}
