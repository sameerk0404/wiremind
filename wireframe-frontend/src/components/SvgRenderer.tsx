





import { 
  Box, 
  IconButton, 
  Tooltip, 
  Popover,
  TextField,
  Slider,
  Select,
  MenuItem,
  Typography,
  Stack,
  Button,
  InputLabel,
  Menu
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useEffect, useRef, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import ColorLensIcon from '@mui/icons-material/ColorLens';

interface SvgRendererProps {
  svgCode: string;
}

interface EditableProperties {
  text?: string;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

interface ElementState {
  transform: string;
  style: Partial<CSSStyleDeclaration>;
  attributes: { [key: string]: string };
}

const SvgRenderer = ({ svgCode }: SvgRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const originalStates = useRef<Map<Element, ElementState>>(new Map());
  const [editingProperties, setEditingProperties] = useState<EditableProperties>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const makeElementEditable = (element: Element) => {
    if (element instanceof SVGElement) {
      element.style.cursor = 'move';
      // Store original position
      if (!originalStates.current.has(element)) {
        originalStates.current.set(element, element.getAttribute('transform') || '');
      }
    }
  };

  const handleElementClick = (event: MouseEvent) => {
    if (!isEditing) return;
    
    const target = event.target as Element;
    if (target instanceof SVGElement && target.tagName !== 'svg') {
      event.stopPropagation();
      setSelectedElement(target);
      setAnchorEl(event.currentTarget as HTMLElement);
      
      // Update editing properties based on selected element
      const properties: EditableProperties = {};
      
      if (target.tagName === 'text') {
        properties.text = target.textContent || '';
        properties.fontSize = parseInt(getComputedStyle(target).fontSize) || 16;
        properties.fill = target.getAttribute('fill') || '#000000';
      } else {
        properties.fill = target.getAttribute('fill') || 'none';
        properties.stroke = target.getAttribute('stroke') || '#000000';
        properties.strokeWidth = parseInt(target.getAttribute('stroke-width') || '1');
      }
      
      setEditingProperties(properties);
      
      // Highlight selected element
      if (selectedElement) {
        (selectedElement as SVGElement).style.outline = 'none';
      }
      (target as SVGElement).style.outline = '2px solid #2196f3';
      (target as SVGElement).style.outlineOffset = '2px';
    }
  };

  const enableDragging = (element: SVGElement) => {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;

    element.addEventListener('mousedown', (e: MouseEvent) => {
      if (!isEditing) return;
      isDragging = true;
      initialX = e.clientX;
      initialY = e.clientY;
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDragging) return;

      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      const currentTransform = element.getAttribute('transform') || '';
      element.setAttribute('transform', 
        `${currentTransform.replace(/translate\([^)]*\)/, '')} translate(${currentX} ${currentY})`
      );
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  };

  useEffect(() => {
    if (containerRef.current && svgCode) {
      containerRef.current.innerHTML = svgCode;
      originalStates.current.clear(); // Clear previous states
      
      // Find all SVG elements and optimize for crisp rendering
      const svgElements = containerRef.current.querySelectorAll('svg');
      svgElements.forEach(svg => {
        // Ensure crisp rendering
        svg.style.shapeRendering = 'geometricPrecision';
        svg.style.textRendering = 'geometricPrecision';
        svg.style.imageRendering = 'crisp-edges';
        svg.style.width = '1200px';  // Fixed width
        svg.style.height = '800px';  // Fixed height
        svg.style.display = 'block';
        svg.style.margin = '0 auto';  // Center the SVG
        
        // Set consistent viewBox
        svg.setAttribute('viewBox', '0 0 1200 800');
        // Make elements editable
        const elements = svg.querySelectorAll('*');
        elements.forEach((element) => {
          if (element instanceof SVGElement && element.tagName !== 'svg') {
            // Store original state before any modifications
            const state: ElementState = {
              transform: element.getAttribute('transform') || '',
              style: {
                fill: element.style.fill,
                stroke: element.style.stroke,
                strokeWidth: element.style.strokeWidth,
                fontSize: element.style.fontSize
              },
              attributes: {
                fill: element.getAttribute('fill') || '',
                stroke: element.getAttribute('stroke') || '',
                'stroke-width': element.getAttribute('stroke-width') || '',
                'font-size': element.getAttribute('font-size') || '',
                transform: element.getAttribute('transform') || '',
                style: element.getAttribute('style') || ''
              }
            };
            originalStates.current.set(element, state);
            
            enableDragging(element);
            element.addEventListener('click', handleElementClick);
            if (isEditing) {
              element.style.cursor = 'move';
              element.style.pointerEvents = 'all';
            }
          }
        });
      });
    }
  }, [svgCode, isEditing]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      if (containerRef.current) {
        const svg = containerRef.current.querySelector('svg');
        if (svg) {
          // Store current state as original state for future edits
          const elements = svg.querySelectorAll('*');
          originalStates.current.clear(); // Clear previous states
          elements.forEach((element) => {
            if (element instanceof SVGElement && element.tagName !== 'svg') {
              originalStates.current.set(element, {
                transform: element.getAttribute('transform') || '',
                style: { ...element.style },
                attributes: Array.from(element.attributes).reduce((acc, attr) => {
                  acc[attr.name] = attr.value;
                  return acc;
                }, {} as { [key: string]: string })
              });
              // Clear editing styles
              element.style.cursor = '';
              element.style.outline = '';
              element.style.pointerEvents = '';
            }
          });
          // Clear selection
          if (selectedElement) {
            (selectedElement as SVGElement).style.outline = '';
            setSelectedElement(null);
          }
          setAnchorEl(null);
        }
      }
    } else {
      // Enter edit mode
      const svg = containerRef.current?.querySelector('svg');
      if (svg) {
        svg.style.pointerEvents = 'all';
        const elements = svg.querySelectorAll('*');
        elements.forEach((element) => {
          if (element instanceof SVGElement && element.tagName !== 'svg') {
            // Store initial state if not already stored
            if (!originalStates.current.has(element)) {
              originalStates.current.set(element, {
                transform: element.getAttribute('transform') || '',
                style: { ...element.style },
                attributes: Array.from(element.attributes).reduce((acc, attr) => {
                  acc[attr.name] = attr.value;
                  return acc;
                }, {} as { [key: string]: string })
              });
            }
            element.style.cursor = 'move';
            element.style.pointerEvents = 'all';
          }
        });
      }
    }
    setIsEditing(!isEditing);
  };
  
  const handlePropertyChange = (property: keyof EditableProperties, value: string | number) => {
    if (!selectedElement || !(selectedElement instanceof SVGElement)) return;

    const element = selectedElement;
    const updatedProperties = { ...editingProperties };

    try {
      switch (property) {
        case 'text':
          if (element.tagName.toLowerCase() === 'text') {
            element.textContent = value as string;
            updatedProperties.text = value as string;
          }
          break;
        case 'fontSize':
          if (element.tagName.toLowerCase() === 'text') {
            element.style.fontSize = `${value}px`;
            element.setAttribute('font-size', `${value}`);
            updatedProperties.fontSize = value as number;
          }
          break;
        case 'fill':
          element.style.fill = value as string;
          element.setAttribute('fill', value as string);
          updatedProperties.fill = value as string;
          break;
        case 'stroke':
          element.style.stroke = value as string;
          element.setAttribute('stroke', value as string);
          updatedProperties.stroke = value as string;
          break;
        case 'strokeWidth':
          element.style.strokeWidth = `${value}`;
          element.setAttribute('stroke-width', value.toString());
          updatedProperties.strokeWidth = value as number;
          break;
      }

      // Force a redraw by toggling a dummy attribute
      element.setAttribute('data-updated', Date.now().toString());
      setEditingProperties(updatedProperties);
    } catch (error) {
      console.error('Error updating element properties:', error);
    }
  };

  const handleUndo = () => {
    if (selectedElement instanceof SVGElement && originalStates.current.has(selectedElement)) {
      const originalState = originalStates.current.get(selectedElement);
      if (originalState) {
        // Restore transform
        if (originalState.transform) {
          selectedElement.setAttribute('transform', originalState.transform);
        } else {
          selectedElement.removeAttribute('transform');
        }

        // Restore all original attributes
        for (const [attr, value] of Object.entries(originalState.attributes)) {
          if (value) {
            selectedElement.setAttribute(attr, value);
          } else {
            selectedElement.removeAttribute(attr);
          }
        }

        // Restore styles
        if (originalState.style.fill) selectedElement.style.fill = originalState.style.fill;
        if (originalState.style.stroke) selectedElement.style.stroke = originalState.style.stroke;
        if (originalState.style.strokeWidth) selectedElement.style.strokeWidth = originalState.style.strokeWidth;
        if (originalState.style.fontSize) selectedElement.style.fontSize = originalState.style.fontSize;

        // Update editing properties
        const updatedProperties: EditableProperties = {
          text: selectedElement.tagName.toLowerCase() === 'text' ? selectedElement.textContent || '' : undefined,
          fill: originalState.attributes.fill || selectedElement.style.fill || 'none',
          stroke: originalState.attributes.stroke || selectedElement.style.stroke || 'none',
          strokeWidth: parseInt(originalState.attributes['stroke-width'] || '1'),
          fontSize: parseInt(originalState.attributes['font-size'] || '16')
        };
        
        setEditingProperties(updatedProperties);
      }
    }
  };

  const handleDelete = () => {
    if (selectedElement && selectedElement.parentNode) {
      selectedElement.parentNode.removeChild(selectedElement);
      setSelectedElement(null);
    }
  };

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExport = (format: 'svg' | 'figma') => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    if (format === 'svg') {
      // Export as SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wireframe.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'figma') {
      // Export as Figma
      const svgData = new XMLSerializer().serializeToString(svg);
      const figmaData = {
        name: "Wireframe",
        schemaVersion: 0,
        documentVersion: 0,
        pages: [{
          id: "0:1",
          name: "Wireframe",
          type: "CANVAS",
          children: [{
            id: "1:1",
            name: "Frame",
            type: "FRAME",
            blendMode: "PASS_THROUGH",
            children: [],
            absoluteBoundingBox: {
              x: 0,
              y: 0,
              width: 1200,
              height: 800
            },
            constraints: {
              vertical: "TOP",
              horizontal: "LEFT"
            },
            clipsContent: false,
            background: [{
              type: "SOLID",
              color: { r: 1, g: 1, b: 1 }
            }],
            exportSettings: []
          }]
        }]
      };

      const blob = new Blob([JSON.stringify(figmaData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wireframe.fig';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setExportAnchorEl(null);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 1,
        boxShadow: 1,
        p: 0.5,
        display: 'flex',
        gap: 1
      }}>
        <Tooltip title="Edit Wireframe">
          <IconButton 
            onClick={() => setIsEditing(!isEditing)} 
            color={isEditing ? "primary" : "default"}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        {isEditing && (
          <>
            <Tooltip title="Undo Changes">
              <IconButton 
                onClick={handleUndo} 
                disabled={!selectedElement || !originalStates.current.has(selectedElement)}
                color="primary"
              >
                <UndoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Element">
              <IconButton 
                onClick={handleDelete} 
                disabled={!selectedElement}
                color="primary"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title="Export">
          <IconButton 
            onClick={(e) => setExportAnchorEl(e.currentTarget)}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
        >
          <MenuItem onClick={() => handleExport('svg')}>
            <FileDownloadIcon sx={{ mr: 1 }} />
            Export as SVG
          </MenuItem>
          <MenuItem onClick={() => handleExport('figma')}>
            <FileDownloadIcon sx={{ mr: 1 }} />
            Export as Figma (.fig)
          </MenuItem>
        </Menu>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Stack spacing={2}>
            {selectedElement?.tagName === 'text' && (
              <>
                <TextField
                  label="Text"
                  value={editingProperties.text || ''}
                  onChange={(e) => handlePropertyChange('text', e.target.value)}
                  fullWidth
                  size="small"
                />
                <Box>
                  <Typography variant="caption">Font Size</Typography>
                  <Slider
                    value={editingProperties.fontSize || 16}
                    onChange={(_, value) => handlePropertyChange('fontSize', value)}
                    min={8}
                    max={72}
                    step={1}
                  />
                </Box>
              </>
            )}
            
            <Box>
              <InputLabel>Fill Color</InputLabel>
              <Stack direction="row" spacing={1} alignItems="center">
                <input
                  type="color"
                  value={editingProperties.fill || '#000000'}
                  onChange={(e) => handlePropertyChange('fill', e.target.value)}
                  style={{ width: 40, height: 40 }}
                />
                <TextField
                  value={editingProperties.fill || '#000000'}
                  onChange={(e) => handlePropertyChange('fill', e.target.value)}
                  size="small"
                />
              </Stack>
            </Box>

            {selectedElement?.tagName !== 'text' && (
              <>
                <Box>
                  <InputLabel>Stroke Color</InputLabel>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <input
                      type="color"
                      value={editingProperties.stroke || '#000000'}
                      onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                      style={{ width: 40, height: 40 }}
                    />
                    <TextField
                      value={editingProperties.stroke || '#000000'}
                      onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                      size="small"
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="caption">Stroke Width</Typography>
                  <Slider
                    value={editingProperties.strokeWidth || 1}
                    onChange={(_, value) => handlePropertyChange('strokeWidth', value)}
                    min={0}
                    max={10}
                    step={0.5}
                  />
                </Box>
              </>
            )}
          </Stack>
        </Box>
      </Popover>
      <Box 
        ref={containerRef} 
        sx={{ 
          width: '100%', 
          minHeight: '500px',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          borderRadius: 2,
          overflow: 'auto',
          p: 3,
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 6px 24px rgba(99, 102, 241, 0.1)',
          },
          '& svg': {
            maxWidth: '100%',
            height: 'auto',
            border: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05))',
            transition: 'filter 0.3s ease-in-out',
            '&:hover': {
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
            },
            ...(isEditing && {
              '& *:not(svg)': {
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  outline: '2px solid rgba(99, 102, 241, 0.5)',
                  outlineOffset: '2px',
                  filter: 'brightness(1.05)',
                  cursor: 'move',
                }
              }
            })
          }
        }}
      />
    </Box>
  );
};

export default SvgRenderer;