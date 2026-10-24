"""Create consistent, identity-safe sports portraits from the supplied ID photos."""

from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from rembg import new_session, remove


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/images/sports-2026-27"
OUTPUT = ROOT / "assets/images/sports-2026-27-clean"
OUTPUT.mkdir(parents=True, exist_ok=True)


def studio_background(size: tuple[int, int]) -> Image.Image:
    """The same restrained warm-grey treatment used by the results portraits."""
    width, height = size
    yy, xx = np.mgrid[0:height, 0:width]
    radial = np.sqrt(((xx - width * 0.48) / width) ** 2 + ((yy - height * 0.32) / height) ** 2)
    shade = np.clip(238 - radial * 18, 220, 238).astype(np.uint8)
    rgb = np.dstack((shade + 1, shade + 1, shade)).clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgb, "RGB")


def trim_scan_edge(image: Image.Image) -> Image.Image:
    """Remove thin document borders while keeping generous headroom."""
    width, height = image.size
    x_pad = max(1, round(width * 0.018))
    y_pad = max(1, round(height * 0.012))
    return image.crop((x_pad, y_pad, width - x_pad, height - y_pad))


def standardize(path: Path, session) -> Image.Image:
    source = trim_scan_edge(Image.open(path).convert("RGB"))
    segmentation_scale = max(1.0, 720 / max(source.size))
    working = source.resize(
        (round(source.width * segmentation_scale), round(source.height * segmentation_scale)),
        Image.Resampling.LANCZOS,
    )
    buffer = BytesIO()
    working.save(buffer, "PNG")
    cutout_bytes = remove(
        buffer.getvalue(),
        session=session,
        post_process_mask=True,
        alpha_matting=True,
        alpha_matting_foreground_threshold=235,
        alpha_matting_background_threshold=18,
        alpha_matting_erode_size=5,
    )
    cutout = Image.open(BytesIO(cutout_bytes)).convert("RGBA")

    rgb = ImageEnhance.Brightness(cutout.convert("RGB")).enhance(1.01)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.025)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.08)
    cutout = Image.merge("RGBA", (*rgb.split(), cutout.getchannel("A")))

    canvas_size = (600, 650)
    canvas = studio_background(canvas_size).convert("RGBA")
    available = (570, 630)
    ratio = min(available[0] / cutout.width, available[1] / cutout.height)
    subject = cutout.resize((round(cutout.width * ratio), round(cutout.height * ratio)), Image.Resampling.LANCZOS)

    shadow_alpha = subject.getchannel("A").filter(ImageFilter.GaussianBlur(8))
    shadow = Image.new("RGBA", subject.size, (36, 45, 52, 0))
    shadow.putalpha(shadow_alpha.point(lambda value: round(value * 0.16)))
    x = (canvas_size[0] - subject.width) // 2
    y = canvas_size[1] - subject.height
    canvas.alpha_composite(shadow, (x + 3, y + 4))
    canvas.alpha_composite(subject, (x, y))
    return canvas.convert("RGB")


session = new_session("u2net_human_seg")
for source_path in sorted(SOURCE.glob("*.jpeg")):
    target = OUTPUT / f"{source_path.stem}.webp"
    standardize(source_path, session).save(target, "WEBP", quality=92, method=6)
    print(target.relative_to(ROOT))
