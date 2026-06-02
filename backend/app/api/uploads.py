import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductOut

router = APIRouter(prefix="/products", tags=["Product Media"])

UPLOAD_DIR = "/app/uploads"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg", "video/quicktime"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024   # 10 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB


def _save_file(upload: UploadFile, subfolder: str, max_size: int) -> str:
    os.makedirs(os.path.join(UPLOAD_DIR, subfolder), exist_ok=True)
    data = upload.file.read()
    if len(data) > max_size:
        raise HTTPException(status_code=413, detail=f"File too large. Max {max_size // (1024*1024)} MB.")
    ext = os.path.splitext(upload.filename or "")[1].lower() or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, subfolder, filename)
    with open(path, "wb") as f:
        f.write(data)
    return f"/uploads/{subfolder}/{filename}"


@router.post("/{product_id}/upload-image", response_model=ProductOut)
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid image type: {file.content_type}. Use JPEG, PNG, WebP, or GIF.")
    # Delete old image if exists
    _delete_old_file(product.image_url)
    product.image_url = _save_file(file, "images", MAX_IMAGE_SIZE)
    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/upload-video", response_model=ProductOut)
def upload_product_video(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid video type: {file.content_type}. Use MP4, WebM, or OGG.")
    _delete_old_file(product.video_url)
    product.video_url = _save_file(file, "videos", MAX_VIDEO_SIZE)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}/media", response_model=ProductOut)
def delete_product_media(
    product_id: int,
    media_type: str = "image",   # "image" or "video"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if media_type == "image":
        _delete_old_file(product.image_url)
        product.image_url = None
    elif media_type == "video":
        _delete_old_file(product.video_url)
        product.video_url = None
    else:
        raise HTTPException(status_code=400, detail="media_type must be 'image' or 'video'")
    db.commit()
    db.refresh(product)
    return product


def _delete_old_file(url: str):
    if url and url.startswith("/uploads/"):
        path = os.path.join("/app", url.lstrip("/"))
        if os.path.exists(path):
            try:
                os.remove(path)
            except OSError:
                pass
