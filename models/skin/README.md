# Corvea Skin Vision Model

This folder contains the health-focused computer-vision model used by Corvea.

Expected model files:

- model.json
- one or more .bin weight files
- labels.json

The model is intended to identify observable visual characteristics for educational purposes.

It must not be interpreted as a medical diagnosis.

Model input:
224 × 224 RGB image

Model output:
Probability scores for supported visual-characteristic classes.
