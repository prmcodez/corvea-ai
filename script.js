```javascript
console.log("CORVEA — FREE BROWSER VERSION");

// ============================================================
// STATE
// ============================================================

let selectedCategory = "skin";
let selectedFile = null;

// ============================================================
// DOM ELEMENTS
// ============================================================

const imageInput = document.getElementById("imageInput");
const cameraInput = document.getElementById("cameraInput");
const uploadArea = document.getElementById("uploadArea");

const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer =
    document.getElementById("imagePreviewContainer");

const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");

const uploadError =
    document.getElementById("uploadError");

const results =
    document.getElementById("results");

// ============================================================
// CATEGORY SELECTION
// ============================================================

function selectCategory(category) {

    selectedCategory = category;

    document
        .querySelectorAll(".category-option")
        .forEach(button => {

            button.classList.remove("active");

            if (button.dataset.category === category) {
                button.classList.add("active");
            }

        });

    document
        .getElementById("analyze")
        .scrollIntoView({
            behavior: "smooth"
        });

    console.log(
        "Selected category:",
        selectedCategory
    );
}

// ============================================================
// SCROLL TO ANALYSIS
// ============================================================

function scrollToAnalysis() {

    document
        .getElementById("analyze")
        .scrollIntoView({
            behavior: "smooth"
        });

}

// ============================================================
// IMAGE INPUT
// ============================================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function(event) {

            const file =
                event.target.files[0];

            if (file) {
                processFile(file);
            }

        }
    );

}

// ============================================================
// CAMERA INPUT
// ============================================================

if (cameraInput) {

    cameraInput.addEventListener(
        "change",
        function(event) {

            const file =
                event.target.files[0];

            if (file) {
                processFile(file);
            }

        }
    );

}

// ============================================================
// DRAG AND DROP
// ============================================================

if (uploadArea) {

    uploadArea.addEventListener(
        "dragover",
        function(event) {

            event.preventDefault();

            uploadArea.classList.add(
                "dragover"
            );

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        function() {

            uploadArea.classList.remove(
                "dragover"
            );

        }
    );


    uploadArea.addEventListener(
        "drop",
        function(event) {

            event.preventDefault();

            uploadArea.classList.remove(
                "dragover"
            );

            const file =
                event.dataTransfer.files[0];

            if (file) {
                processFile(file);
            }

        }
    );

}

// ============================================================
// PROCESS IMAGE
// ============================================================

function processFile(file) {

    clearError();

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"
    ];

    const maxSize =
        10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {

        showError(
            "Please upload a JPG, JPEG, PNG, or WebP image."
        );

        return;
    }

    if (file.size > maxSize) {

        showError(
            "The image is too large. Maximum size is 10 MB."
        );

        return;
    }

    selectedFile = file;

    fileName.textContent =
        file.name;

    fileSize.textContent =
        formatFileSize(file.size);

    const reader =
        new FileReader();

    reader.onload =
        function(event) {

            imagePreview.src =
                event.target.result;

            imagePreviewContainer
                .classList
                .remove("hidden");

            uploadArea
                .classList
                .add("hidden");

        };

    reader.readAsDataURL(file);

}

// ============================================================
// REMOVE IMAGE
// ============================================================

function removeImage() {

    selectedFile = null;

    imageInput.value = "";
    cameraInput.value = "";

    imagePreview.src = "";

    imagePreviewContainer
        .classList
        .add("hidden");

    uploadArea
        .classList
        .remove("hidden");

    results
        .classList
        .add("hidden");

    clearError();

}

// ============================================================
// FILE SIZE
// ============================================================

function formatFileSize(bytes) {

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";

    }

    return (
        bytes /
        (1024 * 1024)
    ).toFixed(1) + " MB";

}

// ============================================================
// ERROR HANDLING
// ============================================================

function showError(message) {

    uploadError.textContent =
        message;

    uploadError
        .classList
        .remove("hidden");

}

function clearError() {

    uploadError.textContent =
        "";

    uploadError
        .classList
        .add("hidden");

}

// ============================================================
// IMAGE LOADING
// ============================================================

function loadImage(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    const img =
                        new Image();

                    img.onload =
                        function() {

                            resolve(img);

                        };

                    img.onerror =
                        function() {

                            reject(
                                new Error(
                                    "Could not load image."
                                )
                            );

                        };

                    img.src =
                        event.target.result;

                };

            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Could not read image."
                        )
                    );

                };

            reader.readAsDataURL(file);

        }
    );

}

// ============================================================
// IMAGE FEATURE ANALYSIS
// ============================================================

async function analyzeVisualFeatures(file) {

    const image =
        await loadImage(file);

    const canvas =
        document.createElement("canvas");

    const ctx =
        canvas.getContext("2d");

    const MAX_SIZE = 300;

    const scale =
        Math.min(
            1,
            MAX_SIZE /
            Math.max(
                image.width,
                image.height
            )
        );

    canvas.width =
        Math.max(
            1,
            Math.round(
                image.width * scale
            )
        );

    canvas.height =
        Math.max(
            1,
            Math.round(
                image.height * scale
            )
        );

    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const imageData =
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

    const pixels =
        imageData.data;

    let totalBrightness = 0;
    let totalRed = 0;
    let totalGreen = 0;
    let totalBlue = 0;

    let redPixels = 0;
    let darkPixels = 0;
    let lightPixels = 0;

    let saturationTotal = 0;

    const pixelCount =
        pixels.length / 4;

    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const brightness =
            (r + g + b) / 3;

        totalBrightness +=
            brightness;

        totalRed += r;
        totalGreen += g;
        totalBlue += b;

        if (
            r > g * 1.15 &&
            r > b * 1.15 &&
            r > 100
        ) {

            redPixels++;

        }

        if (brightness < 70) {
            darkPixels++;
        }

        if (brightness > 210) {
            lightPixels++;
        }

        const max =
            Math.max(r, g, b);

        const min =
            Math.min(r, g, b);

        if (max !== 0) {

            saturationTotal +=
                (max - min) / max;

        }

    }

    const averageBrightness =
        totalBrightness / pixelCount;

    const averageRed =
        totalRed / pixelCount;

    const averageGreen =
        totalGreen / pixelCount;

    const averageBlue =
        totalBlue / pixelCount;

    const redRatio =
        redPixels / pixelCount;

    const darkRatio =
        darkPixels / pixelCount;

    const lightRatio =
        lightPixels / pixelCount;

    const averageSaturation =
        saturationTotal / pixelCount;

    return {

        brightness:
            averageBrightness,

        redRatio:
            redRatio,

        darkRatio:
            darkRatio,

        lightRatio:
            lightRatio,

        saturation:
            averageSaturation,

        averageRed:
            averageRed,

        averageGreen:
            averageGreen,

        averageBlue:
            averageBlue

    };

}

// ============================================================
// INTERPRET FEATURES
// ============================================================

function generateEducationalResult(features) {

    const {

        brightness,
        redRatio,
        darkRatio,
        lightRatio,
        saturation

    } = features;

    const characteristics = [];

    // --------------------------------------------------------
    // REDNESS
    // --------------------------------------------------------

    if (redRatio > 0.12) {

        characteristics.push(
            "noticeable reddish coloration"
        );

    }

    // --------------------------------------------------------
    // DARK / PIGMENTED AREAS
    // --------------------------------------------------------

    if (darkRatio > 0.18) {

        characteristics.push(
            "areas of darker coloration"
        );

    }

    // --------------------------------------------------------
    // BRIGHT / LIGHT AREAS
    // --------------------------------------------------------

    if (lightRatio > 0.30) {

        characteristics.push(
            "lighter or high-brightness areas"
        );

    }

    // --------------------------------------------------------
    // SATURATION
    // --------------------------------------------------------

    if (saturation > 0.35) {

        characteristics.push(
            "strong color variation"
        );

    }

    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------

    if (
        characteristics.length === 0
    ) {

        characteristics.push(
            "subtle color and brightness variation"
        );

    }

    // --------------------------------------------------------
    // SKIN
    // --------------------------------------------------------

    if (
        selectedCategory === "skin"
    ) {

        if (
            redRatio > 0.18 &&
            brightness < 190
        ) {

            return {

                visualCharacteristics:
                    characteristics,

                possibleExplanation:
                    "This image shows features that are consistent with an inflammatory or irritation-related skin change. Eczema-like changes are one possible explanation, although the image alone cannot determine the cause.",

                biology:
                    "Skin redness can occur when inflammation changes blood flow and activates immune responses in the skin. Conditions affecting the skin barrier can also change the way the surface looks and feels.",

                biologicalMechanisms:
                    "Inflammatory signaling can increase blood flow and recruit immune cells to affected tissue. Disruption of the skin barrier can also increase water loss and make the skin more sensitive to environmental irritation.",

                whyItLooksThisWay:
                    "Increased blood flow can make skin appear redder, while changes in the outer skin barrier can contribute to visible dryness, uneven texture, or irritation.",

                uncertainty:
                    "The image provides only visual information. Lighting, camera settings, skin tone, image quality, and many different conditions can produce similar appearances."

            };

        }

        if (
            redRatio > 0.10 &&
            saturation > 0.28
        ) {

            return {

                visualCharacteristics:
                    characteristics,

                possibleExplanation:
                    "This image shows features that are consistent with localized skin redness or inflammation. Irritation, acne-like inflammation, and other inflammatory skin changes can have similar visual features.",

                biology:
                    "Inflammation is part of the body's immune response. Signals released during inflammation can affect nearby blood vessels and immune cells, producing visible changes in the skin.",

                biologicalMechanisms:
                    "Inflammatory signaling can increase blood flow and alter activity within skin tissue. These changes may create areas that appear redder or more strongly colored.",

                whyItLooksThisWay:
                    "Changes in blood flow and tissue activity can alter the amount of light reflected from the skin, making affected areas appear more red or uneven.",

                uncertainty:
                    "Several different skin conditions can produce similar redness. A photograph cannot reliably determine the underlying condition."

            };

        }

        if (
            darkRatio > 0.25 &&
            redRatio < 0.10
        ) {

            return {

                visualCharacteristics:
                    characteristics,

                possibleExplanation:
                    "This image shows features that are consistent with an area of increased pigmentation or darker skin coloration. Post-inflammatory pigmentation is one possible explanation among several.",

                biology:
                    "Skin pigmentation is strongly influenced by melanin, a pigment produced by specialized cells called melanocytes.",

                biologicalMechanisms:
                    "Melanocytes produce melanin and transfer pigment to surrounding skin cells. Pigment levels can change following inflammation or other biological processes.",

                whyItLooksThisWay:
                    "Greater amounts or concentrations of melanin absorb more visible light, which can make an area appear darker than the surrounding skin.",

                uncertainty:
                    "Image lighting and exposure can strongly affect apparent skin color. A photograph cannot determine the underlying cause of pigmentation."

            };

        }

        return {

            visualCharacteristics:
                characteristics,

            possibleExplanation:
                "This image shows visible color variation that could be consistent with several common skin changes, but the available visual information is not specific enough to identify one likely explanation.",

            biology:
                "Skin appearance is influenced by pigmentation, blood flow, inflammation, the skin barrier, oil production, hair follicles, and many other biological processes.",

            biologicalMechanisms:
                "Changes in these systems can alter skin color, texture, and surface appearance.",

            whyItLooksThisWay:
                "Different biological processes can change how light is absorbed or reflected by the skin.",

            uncertainty:
                "The image does not contain enough information to distinguish reliably between different possible causes."

        };

    }

    // --------------------------------------------------------
    // TEETH
    // --------------------------------------------------------

    if (
        selectedCategory === "teeth"
    ) {

        if (
            redRatio > 0.10
        ) {

            return {

                visualCharacteristics:
                    characteristics,

                possibleExplanation:
                    "This image shows features that may be consistent with visible gum redness or irritation. Gingivitis-like inflammation is one possible explanation, but the image cannot establish a diagnosis.",

                biology:
                    "The gums contain blood vessels and immune cells that participate in responses to irritation and bacteria.",

                biologicalMechanisms:
                    "Bacterial plaque can interact with the immune system and contribute to inflammation of the gum tissue.",

                whyItLooksThisWay:
                    "Inflammation can increase blood flow in gum tissue, which may make the gums appear redder or swollen.",

                uncertainty:
                    "Lighting, camera exposure, and image angle can change the appearance of teeth and gums."

            };

        }

        return {

            visualCharacteristics:
                characteristics,

            possibleExplanation:
                "This image does not show enough specific visual information to identify one likely dental explanation. Color variation can have many causes.",

            biology:
                "Teeth and oral tissues are affected by mineralization, bacteria, saliva, pigmentation, inflammation, and environmental factors.",

            biologicalMechanisms:
                "Changes in the enamel surface, plaque accumulation, or surrounding gum tissue can affect visible appearance.",

            whyItLooksThisWay:
                "Differences in light reflection from enamel and soft tissue can create visible color and texture differences.",

            uncertainty:
                "A photograph alone cannot reliably determine dental health or diagnose an oral condition."

        };

    }

    // --------------------------------------------------------
    // EYES
    // --------------------------------------------------------

    if (
        selectedCategory === "eyes"
    ) {

        if (
            redRatio > 0.10
        ) {

            return {

                visualCharacteristics:
                    characteristics,

                possibleExplanation:
                    "This image shows features that may be consistent with visible eye redness or irritation. Several different causes can produce similar appearances.",

                biology:
                    "The surface of the eye contains small blood vessels that can become more noticeable when the tissue is irritated or inflamed.",

                biologicalMechanisms:
                    "Irritation and inflammatory signaling can increase blood flow in the small vessels of the eye surface.",

                whyItLooksThisWay:
                    "When surface blood vessels become more prominent, they can make the white portion of the eye appear redder.",

                uncertainty:
                    "Eye photographs are especially sensitive to lighting, camera exposure, and image angle. The underlying cause cannot be determined from an image alone."

            };

        }

        return {

            visualCharacteristics:
                characteristics,

            possibleExplanation:
                "The image does not show enough specific visual information to identify one likely eye-related explanation.",

            biology:
                "Eye appearance depends on the cornea, conjunctiva, blood vessels, tear film, pigmentation, and surrounding tissues.",

            biologicalMechanisms:
                "Changes in these tissues can alter the visible appearance of the eye.",

            whyItLooksThisWay:
                "Light reflection, blood vessel visibility, and tissue characteristics all affect how the eye appears in a photograph.",

            uncertainty:
                "A photograph cannot reliably determine eye health or diagnose an eye condition."

        };

    }

}

// ============================================================
// DISPLAY RESULTS
// ============================================================

function displayResults(data) {

    const tags =
        document.querySelector(
            ".result-card .tags"
        );

    const possibleResult =
        document.querySelector(
            ".possible-result"
        );

    const qualityBadge =
        document.querySelector(
            ".quality-badge"
        );

    const warnings =
        document.querySelectorAll(
            ".result-warning"
        );

    const biologyText =
        document.querySelector(
            ".biology-card > p"
        );

    const biologyMechanism =
        document.querySelector(
            ".biology-grid div:first-child p"
        );

    const biologyAppearance =
        document.querySelector(
            ".biology-grid div:last-child p"
        );

    tags.innerHTML = "";

    data.visualCharacteristics
        .forEach(characteristic => {

            const tag =
                document.createElement(
                    "span"
                );

            tag.textContent =
                characteristic;

            tags.appendChild(tag);

        });

    possibleResult.innerHTML = `

        <div>

            <strong>
                ${escapeHTML(
                    data.possibleExplanation
                )}
            </strong>

            <p>
                This is an educational
                possibility, not a diagnosis.
            </p>

        </div>

    `;

    qualityBadge.textContent =
        "Browser Educational Analysis";

    warnings[0].textContent =
        "This result is based on visual image characteristics and may be incorrect.";

    warnings[1].textContent =
        "Corvea cannot diagnose medical conditions from an image.";

    biologyText.textContent =
        data.biology;

    biologyMechanism.textContent =
        data.biologicalMechanisms;

    biologyAppearance.textContent =
        data.whyItLooksThisWay;

    results.classList.remove(
        "hidden"
    );

    results.scrollIntoView({
        behavior: "smooth"
    });

}

// ============================================================
// HTML SAFETY
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}

// ============================================================
// ANALYZE IMAGE
// ============================================================

async function analyzeImage() {

    clearError();

    if (!selectedFile) {

        showError(
            "Please upload an image before starting the analysis."
        );

        return;

    }

    const analyzeButton =
        document.querySelector(
            ".analyze-button"
        );

    analyzeButton.disabled =
        true;

    analyzeButton.textContent =
        "Analyzing image...";

    try {

        console.log(
            "Starting browser analysis..."
        );

        const features =
            await analyzeVisualFeatures(
                selectedFile
            );

        console.log(
            "Extracted visual features:",
            features
        );

        const result =
            generateEducationalResult(
                features
            );

        displayResults(
            result
        );

    } catch (error) {

        console.error(
            "Corvea analysis error:",
            error
        );

        showError(
            "The image could not be analyzed. Please try another image."
        );

    } finally {

        analyzeButton.disabled =
            false;

        analyzeButton.textContent =
            "Analyze Image";

    }

}

// ============================================================
// INITIALIZATION
// ============================================================

console.log(
    "Corvea JavaScript initialized."
);
```
