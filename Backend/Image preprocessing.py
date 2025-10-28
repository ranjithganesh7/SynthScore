# --- Auto Rotation Correction + Denoising + Enhancement (Strong Version) ---
import cv2
import numpy as np
from google.colab import files
from matplotlib import pyplot as plt

# Upload the test image
uploaded = files.upload()
image_path = list(uploaded.keys())[0]

# Load image and convert to grayscale
image = cv2.imread(image_path)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# --- 1. Noise Reduction ---
gray = cv2.fastNlMeansDenoising(gray, h=15)

# --- 2. Edge Detection ---
edges = cv2.Canny(gray, 50, 150)

# --- 3. Use HoughLines + Angle Histogram for robust angle detection ---
lines = cv2.HoughLines(edges, 1, np.pi / 180, 120)
angles = []

if lines is not None:
    for rho, theta in lines[:, 0]:
        angle = np.degrees(theta)
        if angle > 180:
            angle -= 180
        if 45 < angle < 135:  # ignore near-verticals for upright documents
            angle -= 90
        if -45 < angle < 45:
            angles.append(angle)

if len(angles) > 0:
    median_angle = np.median(angles)
else:
    median_angle = 0

print(f"Detected tilt angle: {median_angle:.2f} degrees")

# --- 4. Rotate the image to fix the tilt ---
(h, w) = image.shape[:2]
center = (w // 2, h // 2)
M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

# --- 5. Contrast + Brightness Enhancement ---
lab = cv2.cvtColor(rotated, cv2.COLOR_BGR2LAB)
l, a, b = cv2.split(lab)
clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
cl = clahe.apply(l)
merged = cv2.merge((cl, a, b))
enhanced = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)

# --- 6. Display Results ---
plt.figure(figsize=(14, 8))
plt.subplot(1, 2, 1)
plt.title("Original")
plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.subplot(1, 2, 2)
plt.title("Perfectly Upright + Enhanced")
plt.imshow(cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB))
plt.axis("off")
plt.show()

# --- 7. Save the output ---
cv2.imwrite("upright_enhanced.jpg", enhanced)
print("✅ Saved as upright_enhanced.jpg")
