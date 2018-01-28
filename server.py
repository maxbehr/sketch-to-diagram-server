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

INPUT_PATH = "static/img/drawn_image.png"
OUTPUT_PATH = "static/output/result.png"


@app.route('/')
def server_index():
    return render_template('index.html')


@app.route('/detect-diagram', methods=['POST'])
def detect_diagram():
    """
    Tries to detect an UML diagram on the given image.
    :return:
    """
    handle_payload()

    #   Detect all shapes
    shape_detector = ShapeDetector(INPUT_PATH)
    shape_detector.find_shapes()

    #   Detect type of primitives
    diagram_converter = DiagramTypeDetector.find_converter(shape_detector)

    #   Convert shapes to diagram
    generic_entities = diagram_converter.convert()

    #   Draw entities on image
    img = shape_detector.image
    img = util.draw_entities_on_image(img, generic_entities)

    save_result_image(img)

    return '', 200


def handle_payload():
    """
    Saves the given base64 image as image file.
    :return:
    """
    # Get base64 image
    payload = request.form.get('payload')
    image_data = str.encode(payload)

    with open(INPUT_PATH, "wb") as fh:
        fh.write(base64.decodebytes(image_data))


def save_result_image(img):
    """
    Saves the result image as image file.
    :param img:
    :return:
    """
    #   Save result
    im = Image.fromarray(img)
    im.save(OUTPUT_PATH)
