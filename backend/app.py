from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PIL import Image, ImageEnhance, ImageOps
import io, os

from routes.ai_tools_routes import ai_tools_bp




app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


app.register_blueprint(ai_tools_bp)


@app.route('/')
def index():
    return jsonify({"status": "Photo Editor backend running"})

@app.route('/edit_image', methods=['POST'])
def edit_image():
    if 'image' not in request.files:
        return jsonify({"error": "no image provided"}), 400

    file = request.files['image']
    img = Image.open(file.stream).convert('RGB')

    # Parameters from frontend
    brightness = float(request.form.get('brightness', 1.0))
    contrast = float(request.form.get('contrast', 1.0))
    saturation = float(request.form.get('saturation', 1.0))
    sharpness = float(request.form.get('sharpness', 1.0))
    rotate = float(request.form.get('rotate', 0))
    flip = request.form.get('flip', 'false').lower() == 'true'

    # Apply edits
    if rotate != 0:
        img = img.rotate(-rotate, expand=True)

    if flip:
        img = ImageOps.mirror(img)

    if brightness != 1.0:
        img = ImageEnhance.Brightness(img).enhance(brightness)

    if contrast != 1.0:
        img = ImageEnhance.Contrast(img).enhance(contrast)

    if saturation != 1.0:
        img = ImageEnhance.Color(img).enhance(saturation)

    if sharpness != 1.0:
        img = ImageEnhance.Sharpness(img).enhance(sharpness)

    # Send back processed image
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=90)
    buf.seek(0)
    return send_file(buf, mimetype='image/jpeg')

# ✨ AI Auto Enhance endpoint
@app.route('/auto_enhance', methods=['POST'])
def auto_enhance():
    if 'image' not in request.files:
        return jsonify({"error": "no image provided"}), 400

    file = request.files['image']
    img = Image.open(file.stream).convert('RGB')

    # --- Auto Enhancement Logic ---
    # 1️⃣ Auto contrast + brightness balancing
    img = ImageOps.autocontrast(img, cutoff=1)  # removes dull grays
    enhancer_bright = ImageEnhance.Brightness(img)
    img = enhancer_bright.enhance(1.1)

    enhancer_contrast = ImageEnhance.Contrast(img)
    img = enhancer_contrast.enhance(1.15)

    enhancer_color = ImageEnhance.Color(img)
    img = enhancer_color.enhance(1.1)

    # 2️⃣ (Optional future tweak) AI-based sharpening or tone adjustments

    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=90)
    buf.seek(0)
    return send_file(buf, mimetype='image/jpeg')


if __name__ == "__main__":
    from flask_cors import CORS
    CORS(app)
    app.run(host="0.0.0.0", port=10000)

