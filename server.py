#!/usr/bin/env python
import os
import sys
import base64
from flask import Flask, request, render_template, url_for
from PIL import Image

DD_PATH = os.environ['DIAGRAM_DETECTOR_PATH']
sys.path.append(DD_PATH)

from detector import util
from detector.detector import ShapeDetector, DiagramTypeDetector, LineDetector

app = Flask(__name__)

@app.route('/')
def server_index():
    return render_template('index.html')


@app.route('/detect', methods=['POST'])
def detect_diagram():
    # Get base64 image
    payload = request.form.get('payload')
    image_data = str.encode(payload)

    img_path = "static/img/drawn_image.png"
    with open(img_path, "wb") as fh:
        fh.write(base64.decodebytes(image_data))

    analyze_image(img_path)
    return '', 200


def analyze_image(img_path):
    #   Detect all shapes
    shape_detector = ShapeDetector(img_path)
    shape_detector.find_shapes()

    #   Detect type of primitives
    diagram_converter = DiagramTypeDetector.find_converter(shape_detector)

    #   Convert shapes to diagram
    generic_entities = diagram_converter.convert()

    #   Draw entities on image
    img = shape_detector.image
    img = util.draw_entities_on_image(img, generic_entities)

    #   Save result
    im = Image.fromarray(img)
    img_path = "static/output/result.png"
    im.save(img_path)
