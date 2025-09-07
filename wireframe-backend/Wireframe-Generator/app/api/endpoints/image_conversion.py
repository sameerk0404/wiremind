from fastapi import APIRouter, HTTPException, File, UploadFile
from typing import List, Optional
from ...utils.image_processor import process_image_to_wireframe, detect_ui_elements

router = APIRouter()

@router.post("/image-to-wireframe")
async def convert_image_to_wireframe(
    file: UploadFile = File(...),
    detect_elements: bool = True
):
    """
    Convert an uploaded image to a wireframe SVG
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        content = await file.read()
        
        # Convert image to wireframe SVG
        svg_code = process_image_to_wireframe(content)
        
        # Detect UI elements if requested
        elements = None
        if detect_elements:
            elements = detect_ui_elements(content)
        
        return {
            "svg_code": svg_code,
            "elements": elements,
            "message": "Image successfully converted to wireframe"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
