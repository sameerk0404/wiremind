from PIL import Image, ImageOps, ImageFilter, ImageDraw
from io import BytesIO
import asyncio
import base64
from typing import List, Tuple

def get_edge_points(img: Image.Image, threshold: int = 128) -> List[Tuple[int, int]]:
    """Extract edge points from the image using Sobel edge detection."""
    # Convert to grayscale and apply edge detection
    img = ImageOps.grayscale(img)
    edges = img.filter(ImageFilter.FIND_EDGES)
    
    # Get edge points
    width, height = edges.size
    edge_points = []
    pixels = edges.load()
    
    for y in range(height):
        for x in range(width):
            if pixels[x, y] > threshold:
                edge_points.append((x, y))
                
    return edge_points

def points_to_path(points: List[Tuple[int, int]], simplify_distance: int = 5) -> str:
    """Convert points to SVG path data with simplification."""
    if not points:
        return ""
        
    # Simple point reduction
    simplified = [points[0]]
    for point in points[1:]:
        last = simplified[-1]
        if abs(point[0] - last[0]) > simplify_distance or abs(point[1] - last[1]) > simplify_distance:
            simplified.append(point)
            
    # Create path data
    path = f"M {simplified[0][0]} {simplified[0][1]}"
    for x, y in simplified[1:]:
        path += f" L {x} {y}"
    
    return path

async def image_to_svg(image_path: str) -> str:
    """
    Convert an image to a wireframe SVG representation using PIL.
    """
    # Open and process image
    img = Image.open(image_path)
    
    # Resize if image is too large
    max_size = 800
    if max(img.size) > max_size:
        ratio = max_size / max(img.size)
        img = img.resize((int(img.size[0] * ratio), int(img.size[1] * ratio)))
    
    # Get edge points
    edge_points = get_edge_points(img)
    
    # Create SVG
    width, height = img.size
    svg = f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">'
    svg += '<rect width="100%" height="100%" fill="white"/>'
    
    # Add edges as path
    path_data = points_to_path(edge_points)
    if path_data:
        svg += f'<path d="{path_data}" stroke="black" fill="none" stroke-width="1"/>'
    
    svg += '</svg>'
    
    return svg
