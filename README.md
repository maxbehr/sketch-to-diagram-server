# sketch-to-diagram-server

This project sends your diagram sketches to the diagram-detection module. Your sketch will be analyzed and the result image is presented next to your drawing.

## Installation
1. Make sure you have the [diagram-detector](https://github.com/maxbehr/diagram-detection) installed
1. Clone this repository
1. Install dependencies via `pipenv install`
1. Start server with ```python -m flask run```
1. Draw!

## Configuration
Add the environment variable ```DIAGRAM_DETECTOR_PATH``` that points to your diagram detection module.