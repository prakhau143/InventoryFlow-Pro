"""
Product media upload — Cloudinary (production) + local disk (dev fallback).

Render's filesystem is ephemeral: every deploy wipes /app/uploads.
When CLOUDINARY_CLOUD_NAME env var is set, files go to Cloudinary and
the permanent HTTPS URL is stored in the DB.
Without Cloudinary vars (local Docker), files are saved to disk as before.
"""
import os
import uuid

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductOut

router = APIRouter(prefix="/products", tags=["Product Media"])

# ── Cloudinary config (optional — only used when env vars are present) ──
_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
_USE_CLOUDINARY = bool(_CLOUD_NAME)

if _USE_CLOUDINARY:
    cloudinary.config(
        cloud_name=_CLOUD_NAME,
        api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET", ""),
        secure=True,
    )

# ── Local fallback config ──
_LOCAL_UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/app/uploads")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg", "video/quicktime"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024   # 10 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB


# ── Helpers ────────────────────────────────────────────────────────────────

def _upload_to_cloudinary(data: bytes, resource_type: str, folder: str) -> str:
    """Upload bytes to Cloudinary and return the permanent secure URL."""
    result = cloudinary.uploader.upload(
        data,
        folder=f"inventoryflow/{folder}",
        resource_type=resource_type,
        use_filename=False,
        unique_filename=True,
    )
    return result["secure_url"]


def _save_locally(data: bytes, subfolder: str, original_filename: str) -> str:
    """Save bytes to local disk and return the relative URL path."""
    dest = os.path.join(_LOCAL_UPLOAD_DIR, subfolder)
    os.makedirs(dest, exist_ok=True)
    ext = os.path.splitext(original_filename or "")[1].lower() or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(dest, filename), "wb") as f:
        f.write(data)
    return f"/uploads/{subfolder}/{filename}"


def _store_media(upload: UploadFile, resource_type: str, subfolder: str, max_size: int) -> str:
    """Read upload, validate size, then store via Cloudinary or local disk."""
    data = upload.file.read()
    if len(data) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max {max_size // (1024 * 1024)} MB.",
        )
    if _USE_CLOUDINARY:
        return _upload_to_cloudinary(data, resource_type, subfolder)
    return _save_locally(data, subfolder, upload.filename or "upload")


def _delete_media(url: str | None):
    """Delete a file from Cloudinary or local disk."""
    if not url:
        return
    if url.startswith("https://res.cloudinary.com") and _USE_CLOUDINARY:
        # Extract public_id from Cloudinary URL
        # URL format: https://res.cloudinary.com/{cloud}/image|video/upload/v{ver}/{folder}/{id}.{ext}
        try:
            # public_id = everything after /upload/v{version}/ up to (not incl.) extension
            parts = url.split("/upload/")
            if len(parts) == 2:
                after = parts[1]
                # strip version prefix v12345/
                if after.startswith("v") and "/" in after:
                    after = after.split("/", 1)[1]
                public_id = os.path.splitext(after)[0]
                resource_type = "video" if "/video/" in url else "image"
                cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        except Exception:
            pass  # non-fatal: stale entry in Cloudinary is harmless
    elif url.startswith("/uploads/"):
        path = os.path.join("/app", url.lstrip("/"))
        try:
            if os.path.exists(path):
                os.remove(path)
        except OSError:
            pass


# ── Routes ─────────────────────────────────────────────────────────────────

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
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image type: {file.content_type}. Use JPEG, PNG, WebP, or GIF.",
        )
    _delete_media(product.image_url)
    product.image_url = _store_media(file, "image", "images", MAX_IMAGE_SIZE)
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
        raise HTTPException(
            status_code=400,
            detail=f"Invalid video type: {file.content_type}. Use MP4, WebM, or OGG.",
        )
    _delete_media(product.video_url)
    product.video_url = _store_media(file, "video", "videos", MAX_VIDEO_SIZE)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}/media", response_model=ProductOut)
def delete_product_media(
    product_id: int,
    media_type: str = "image",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if media_type == "image":
        _delete_media(product.image_url)
        product.image_url = None
    elif media_type == "video":
        _delete_media(product.video_url)
        product.video_url = None
    else:
        raise HTTPException(status_code=400, detail="media_type must be 'image' or 'video'")
    db.commit()
    db.refresh(product)
    return product
