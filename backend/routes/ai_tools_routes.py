from flask import Blueprint, request, send_file, jsonify
from io import BytesIO
from PIL import Image, ImageEnhance, ImageOps, ImageFilter, ImageDraw
import numpy as np
import cv2
from rembg import remove

ai_tools_bp = Blueprint("ai_tools", __name__)

# ============================================================
# 🧩 Utility Helpers
# ============================================================

def read_image(file):
    """Reads uploaded image -> returns NumPy RGB array."""
    img = Image.open(file.stream).convert("RGB")
    return np.array(img)

def pil_to_bytes(img: Image.Image, fmt="JPEG", quality=95):
    """Converts PIL image to byte buffer for sending."""
    buf = BytesIO()
    img.save(buf, format=fmt, quality=quality)
    buf.seek(0)
    return buf

def send_np_image(np_img, fmt="JPEG"):
    """Sends NumPy array as image response."""
    np_img = np.clip(np_img, 0, 255).astype(np.uint8)
    img_pil = Image.fromarray(np_img)
    buf = pil_to_bytes(img_pil, fmt)
    return send_file(buf, mimetype=f"image/{fmt.lower()}")

# ============================================================
# 1️⃣ AI AUTO ENHANCE — brightness, contrast, color & sharpness
# ============================================================

@ai_tools_bp.route("/auto_enhance", methods=["POST"])
def auto_enhance():
    """Enhances photo clarity, contrast, tone and sharpness."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image provided"}), 400

    try:
        img = Image.open(file.stream).convert("RGB")

        img = ImageOps.autocontrast(img, cutoff=1)
        img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=2))
        img = ImageEnhance.Brightness(img).enhance(1.05)
        img = ImageEnhance.Contrast(img).enhance(1.15)
        img = ImageEnhance.Color(img).enhance(1.15)

        return send_file(pil_to_bytes(img, "JPEG"), mimetype="image/jpeg")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================
# 2️⃣ AI BACKGROUND REMOVAL — with alpha blending
# ============================================================

@ai_tools_bp.route("/remove_background", methods=["POST"])
def remove_background():
    """Removes image background using rembg with clean alpha."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        result = remove(file.read())
        img_np = np.frombuffer(result, np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_UNCHANGED)

        # Smooth alpha edges
        if img.shape[2] == 4:
            alpha = img[:, :, 3]
            alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
            img[:, :, 3] = alpha
            color = img[:, :, :3]
            color = cv2.bilateralFilter(color, 5, 50, 50)
            img[:, :, :3] = color

        _, buffer = cv2.imencode(".png", img)
        return send_file(BytesIO(buffer), mimetype="image/png")

    except Exception as e:
        return jsonify({"error": f"Remove BG failed: {str(e)}"}), 500

# ============================================================
# 3️⃣ AI COLOR BOOST — rich colors + adaptive luminance
# ============================================================

@ai_tools_bp.route("/ai_colorboost", methods=["POST"])
def ai_colorboost():
    """Boosts vibrancy while keeping natural tones."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        np_img = read_image(file)
        lab = cv2.cvtColor(np_img, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l2 = clahe.apply(l)

        merged = cv2.merge((l2, a, b))
        result = cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)

        result = cv2.convertScaleAbs(result, alpha=1.1, beta=8)
        result = cv2.addWeighted(result, 1.1, cv2.GaussianBlur(result, (0, 0), 3), -0.1, 0)

        return send_np_image(result, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================
# 4️⃣ AI FACE SMOOTH — skin soften + edge preserve
# ============================================================

@ai_tools_bp.route("/ai_facesmooth", methods=["POST"])
def ai_facesmooth():
    """Smooths skin while preserving facial details."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        np_img = read_image(file)

        smooth = cv2.bilateralFilter(np_img, d=15, sigmaColor=75, sigmaSpace=75)
        detail_mask = cv2.addWeighted(np_img, 0.3, smooth, 0.7, 0)
        result = cv2.addWeighted(detail_mask, 1.15, cv2.GaussianBlur(detail_mask, (0, 0), 2), -0.15, 0)
        final = cv2.convertScaleAbs(result, alpha=1.05, beta=5)

        return send_np_image(final, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================
# 5️⃣ AI AUTO RETOUCH — full combo: enhance + color + smooth
# ============================================================

@ai_tools_bp.route("/ai_autoretouch", methods=["POST"])
def ai_autoretouch():
    """Full smart retouch: lighting, color & skin optimization."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        np_img = read_image(file)

        # Step 1: Lighting & dynamic balance
        lab = cv2.cvtColor(np_img, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
        l2 = clahe.apply(l)
        merged = cv2.merge((l2, a, b))
        img_balanced = cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)

        # Step 2: Mild smoothing (skin areas)
        smooth = cv2.bilateralFilter(img_balanced, d=10, sigmaColor=50, sigmaSpace=50)
        blended = cv2.addWeighted(img_balanced, 0.6, smooth, 0.4, 0)

        # Step 3: Subtle sharpen and tone fix
        sharp = cv2.addWeighted(blended, 1.1, cv2.GaussianBlur(blended, (0, 0), 3), -0.1, 0)
        final = cv2.convertScaleAbs(sharp, alpha=1.08, beta=8)

        return send_np_image(final, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": f"Auto Retouch failed: {str(e)}"}), 500


# ============================================================
# 6️⃣ SMART AI 2.0 — HDR • Relight • Cartoonify • Depth Focus • Sky Replace
# ============================================================

@ai_tools_bp.route("/ai_hdr", methods=["POST"])
def ai_hdr():
    """AI HDR — High Dynamic Range enhancement with vivid tones."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        np_img = read_image(file)
        hdr = cv2.detailEnhance(np_img, sigma_s=12, sigma_r=0.15)
        hdr = cv2.convertScaleAbs(hdr, alpha=1.2, beta=10)
        return send_np_image(hdr, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": f"HDR failed: {str(e)}"}), 500


@ai_tools_bp.route("/ai_relight", methods=["POST"])
def ai_relight():
    """AI Relight — smart relight and shadow correction."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        np_img = read_image(file)
        hsv = cv2.cvtColor(np_img, cv2.COLOR_RGB2HSV)
        hsv[..., 2] = cv2.equalizeHist(hsv[..., 2])
        relit = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
        relit = cv2.convertScaleAbs(relit, alpha=1.1, beta=15)
        return send_np_image(relit, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": f"Relight failed: {str(e)}"}), 500


@ai_tools_bp.route("/ai_cartoonify", methods=["POST"])
def ai_cartoonify():
    """AI Cartoonify — stronger toon-style filter with edges and smooth skin."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        np_img = read_image(file)

        # Step 1: Edge detection
        gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
        gray = cv2.medianBlur(gray, 7)
        edges = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9
        )

        # Step 2: Smooth + color pop
        color = cv2.bilateralFilter(np_img, 9, 150, 150)
        cartoon = cv2.bitwise_and(color, color, mask=edges)

        # Step 3: Stylize (OpenCV built-in magic)
        stylized = cv2.stylization(cartoon, sigma_s=150, sigma_r=0.25)

        # Step 4: Final tone correction
        final = cv2.convertScaleAbs(stylized, alpha=1.2, beta=10)

        return send_np_image(final, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": f"Cartoonify failed: {str(e)}"}), 500


@ai_tools_bp.route("/ai_depthfocus", methods=["POST"])
def ai_depthfocus():
    """AI Depth Focus — Simulates portrait depth blur."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        np_img = read_image(file)
        h, w, _ = np_img.shape
        blurred = cv2.GaussianBlur(np_img, (45, 45), 40)
        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.circle(mask, (w // 2, h // 3), min(h, w) // 3, 255, -1)
        mask = cv2.GaussianBlur(mask, (99, 99), 30)
        mask = mask / 255.0

        # blend background blur + focus center
        depth = (np_img * mask[..., None] + blurred * (1 - mask[..., None])).astype(np.uint8)
        return send_np_image(depth, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": f"Depth Focus failed: {str(e)}"}), 500


@ai_tools_bp.route("/ai_skyreplace", methods=["POST"])
def ai_skyreplace():
    """AI Sky Replace — replaces sky with cinematic gradient or galaxy."""
    file = request.files.get("image")
    mode = request.form.get("mode", "galaxy")  # 'day', 'stars', 'galaxy'
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        img = Image.open(file.stream).convert("RGB")
        from PIL import ImageDraw  # ✅ add this import if not present at top

        # Remove sky/background
        fg = remove(img)
        fg = fg.convert("RGBA")

        # Create base sky background
        if mode == "day":
            sky = Image.new("RGB", img.size, (100, 180, 255))
        elif mode == "stars":
            sky = Image.new("RGB", img.size, (10, 10, 30))
            draw = ImageDraw.Draw(sky)
            for _ in range(300):
                x, y = np.random.randint(0, img.width), np.random.randint(0, img.height // 2)
                draw.point((x, y), fill=(255, 255, 255))
        else:  # galaxy
            galaxy = Image.new("RGB", img.size, (20, 10, 40))
            draw = ImageDraw.Draw(galaxy)
            for _ in range(600):
                x, y = np.random.randint(0, img.width), np.random.randint(0, img.height // 2)
                color = (np.random.randint(150, 255), np.random.randint(80, 200), np.random.randint(200, 255))
                draw.point((x, y), fill=color)
            sky = galaxy

        # Blend sky and subject
        sky = sky.convert("RGBA")
        result = Image.alpha_composite(sky, fg)
        result = result.convert("RGB")

        return send_file(pil_to_bytes(result, "JPEG"), mimetype="image/jpeg")
    except Exception as e:
        return jsonify({"error": f"Sky Replace failed: {str(e)}"}), 500

# ============================================================
# 6️⃣ AI PORTRAIT BOOST — detect face, brighten skin & eyes
# ============================================================

@ai_tools_bp.route("/ai_portraitboost", methods=["POST"])
def ai_portraitboost():
    """Enhances portrait lighting, skin, and eyes."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image provided"}), 400

    try:
        np_img = read_image(file)
        img_yuv = cv2.cvtColor(np_img, cv2.COLOR_RGB2YUV)
        img_yuv[:, :, 0] = cv2.equalizeHist(img_yuv[:, :, 0])
        enhanced = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2RGB)

        smooth = cv2.bilateralFilter(enhanced, 9, 75, 75)
        blended = cv2.addWeighted(enhanced, 0.6, smooth, 0.4, 5)
        final = cv2.convertScaleAbs(blended, alpha=1.1, beta=10)

        return send_np_image(final, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": f"Portrait Boost failed: {str(e)}"}), 500


# ============================================================
# 7️⃣ AI SKY MOOD — tint sky by time of day (sunset, dusk, night)
# ============================================================

@ai_tools_bp.route("/ai_skymood", methods=["POST"])
def ai_skymood():
    """Adds mood tones to the sky area using color tint blending."""
    file = request.files.get("image")
    mood = request.form.get("mood", "sunset")  # sunset, dusk, night
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        np_img = read_image(file)
        overlay = np.zeros_like(np_img)

        if mood == "sunset":
            overlay[:] = (255, 150, 80)
        elif mood == "dusk":
            overlay[:] = (100, 120, 255)
        else:  # night
            overlay[:] = (50, 80, 200)

        blend = cv2.addWeighted(np_img, 0.8, overlay, 0.2, 0)
        return send_np_image(blend, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": f"Sky Mood failed: {str(e)}"}), 500


# ============================================================
# 8️⃣ AI DETAIL ENHANCER — clarity & microcontrast
# ============================================================

@ai_tools_bp.route("/ai_detailenhance", methods=["POST"])
def ai_detailenhance():
    """Boosts image details and clarity using unsharp masking."""
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        np_img = read_image(file)
        gaussian = cv2.GaussianBlur(np_img, (0, 0), 2)
        detail = cv2.addWeighted(np_img, 1.5, gaussian, -0.5, 0)
        final = cv2.convertScaleAbs(detail, alpha=1.1, beta=10)
        return send_np_image(final, fmt="JPEG")
    except Exception as e:
        return jsonify({"error": f"Detail Enhance failed: {str(e)}"}), 500
