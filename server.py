#!/usr/bin/env python
import os
import sys
import base64
from flask import Flask, request, render_template, url_for
from PIL import Image

DD_PATH = os.environ['DIAGRAM_DETECTOR_PATH']
sys.path.append(DD_PATH)

from detector import util
from detector import draw_util
from detector.detector import ShapeDetector, DiagramTypeDetector, LineDetector
from detector.converter.class_diagram_converter import ClassDiagramConverter, ClassDiagramTypes
from detector.export.class_diagram_image_exporter import ClassDiagramImageExporter

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
    img = shape_detector.image

    #   Detect type of primitives
    diagram_converter = DiagramTypeDetector.find_converter(shape_detector)

    #   Convert shapes to diagram
    diagram_converter.convert()

    # Export to image
    img = ClassDiagramImageExporter(img, diagram_converter).export()

    save_result_image(img)

    return '', 200


@app.route('/detect-lines', methods=['POST'])
def detect_lines():
    """
    Tries to detect lines in the given image.
    :return:
    """
    handle_payload()

    #   Detect all shapes
    shape_detector = ShapeDetector(INPUT_PATH)
    shape_detector.find_shapes()

    line_detector = LineDetector()
    line_detector.init_with_image(shape_detector.image)
    lines = line_detector.find_lines()
    lines = line_detector.merge_lines()
    #lines = line_detector._same_slope_lines()
    #lines = line_detector._filter_lines(lines, min_length=30)

    #lines = LineDetector.filter_by_angle(lines, min_angle=45)

    # angle_lines = []
    # for l in lines:
    #     l1, l2 = l
    #     if l1 not in angle_lines: angle_lines.append(l1)
    #     if l2 not in angle_lines: angle_lines.append(l2)

    img = draw_util.draw_labeled_lines(shape_detector.image, lines, color=(255, 0, 0), toggle_label_drawing=False)
    #img = draw_util.draw_labeled_lines(shape_detector.image, lines, color=(0, 255, 0), toggle_label_drawing=False)

    save_result_image(img)

    return '', 200


@app.route('/detect-shapes', methods=['POST'])
def detect_shapes():
    """
    Tries to detect the shapes in the given image.
    :return:
    """
    handle_payload()

    #   Detect all shapes
    shape_detector = ShapeDetector(INPUT_PATH)
    shapes = shape_detector.find_shapes()

    for s in shapes:
        s.print_info()

    img = draw_util.draw_shapes_on_image(shapes, shape_detector.image)

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
