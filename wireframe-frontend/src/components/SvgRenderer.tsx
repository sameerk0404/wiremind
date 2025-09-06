





import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';

interface SvgRendererProps {
  svgCode: string;
}

const SvgRenderer = ({ svgCode }: SvgRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && svgCode) {
      containerRef.current.innerHTML = svgCode;
      
      // Find all SVG elements and optimize for crisp rendering
      const svgElements = containerRef.current.querySelectorAll('svg');
      svgElements.forEach(svg => {
        // Ensure crisp rendering
        svg.style.shapeRendering = 'geometricPrecision';
        svg.style.textRendering = 'geometricPrecision';
        svg.style.imageRendering = 'crisp-edges';
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.style.maxWidth = '100%';
        
        // Ensure proper viewBox for scaling
        if (!svg.getAttribute('viewBox') && svg.getAttribute('width') && svg.getAttribute('height')) {
          const width = svg.getAttribute('width');
          const height = svg.getAttribute('height');
          svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
      });
    }
  }, [svgCode]);

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        minHeight: '500px',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'auto',
        p: 3,
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        '& svg': {
          maxWidth: '100%',
          height: 'auto',
          border: 'none'
        }
      }}
    />
  );
};

export default SvgRenderer;