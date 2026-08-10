console.log("CORVEA HEALTH MODEL VERSION 1");


// ============================================================
// MODEL VARIABLES
// ============================================================

let skinModel = null;
let skinLabels = null;

let selectedCategory = "skin";
let selectedFile = null;


// ============================================================
// DOM VARIABLES
// ============================================================

const imageInput =
    document.getElementById("imageInput");

const cameraInput =
    document.getElementById("cameraInput");

const uploadArea =
    document.getElementById("uploadArea");

const imagePreview =
    document.getElementById("imagePreview");

const imagePreviewContainer =
    document.getElementById("imagePreviewContainer");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const uploadError =
    document.getElementById("uploadError");

const results =
    document.getElementById("results");


// ============================================================
// MODEL PATHS
// ============================================================

const MODEL_PATHS = {

    skin:
        "./models/skin/model.json"

};

const LABEL_PATHS = {

    skin:
        "./models/skin/labels.json"

};


// ============================================================
// CATEGORY SELECTION
// ============================================================

function selectCategory(category) {

    selectedCategory = category;

    document
        .querySelectorAll(".category-option")
        .forEach(button => {

            button.classList.remove("active");

            if (
                button.dataset.category === category
            ) {

                button.classList.add("active");

            }

        });

    document
        .getElementById("analyze")
        .scrollIntoView({
            behavior: "smooth"
        });

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
// FILE INPUT
// ============================================================

imageInput.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];

        if (file) {

            processFile(file);

        }

    }
);


// ============================================================
// CAMERA INPUT
// ============================================================

cameraInput.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];

        if (file) {

            processFile(file);

        }

    }
);


// ============================================================
// DRAG AND DROP
// ============================================================

uploadArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        uploadArea.classList.add(
            "dragover"
        );

    }
);


uploadArea.addEventListener(
    "dragleave",
    function () {

        uploadArea.classList.remove(
            "dragover"
        );

    }
);


uploadArea.addEventListener(
    "drop",
    function (event) {

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
        function (event) {

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

    uploadError.textContent = "";

    uploadError
        .classList
        .add("hidden");

}


// ============================================================
// LOAD SKIN MODEL
// ============================================================

async function loadSkinModel() {

    if (skinModel !== null) {

        return skinModel;

    }


    console.log(
        "Loading Corvea skin model..."
    );


    skinModel =
        await tf.loadLayersModel(
            MODEL_PATHS.skin
        );


    console.log(
        "Corvea skin model loaded."
    );


    console.log(
        "Model input shape:",
        skinModel.inputs[0].shape
    );


    console.log(
        "Model output shape:",
        skinModel.outputs[0].shape
    );


    return skinModel;

}


// ============================================================
// LOAD LABELS
// ============================================================

async function loadSkinLabels() {

    if (skinLabels !== null) {

        return skinLabels;

    }


    console.log(
        "Loading skin labels..."
    );


    const response =
        await fetch(
            LABEL_PATHS.skin
        );


    if (!response.ok) {

        throw new Error(
            "Could not load labels.json"
        );

    }


    skinLabels =
        await response.json();


    console.log(
        "Skin labels loaded:",
        skinLabels
    );


    return skinLabels;

}


// ============================================================
// PREPROCESS IMAGE
// ============================================================

function preprocessImage(image) {

    return tf.tidy(() => {

        let tensor =
            tf.browser
                .fromPixels(image);


        tensor =
            tf.image.resizeBilinear(
                tensor,
                [224, 224]
            );


        tensor =
            tensor
                .toFloat()
                .div(255.0);


        tensor =
            tensor.expandDims(0);


        return tensor;

    });

}


// ============================================================
// RUN SKIN MODEL
// ============================================================

async function runSkinModel(image) {

    const model =
        await loadSkinModel();


    const labels =
        await loadSkinLabels();


    const input =
        preprocessImage(image);


    let output = null;


    try {

        output =
            model.predict(input);


        const probabilities =
            await output.data();


        const resultsArray =
            Array.from(
                probabilities
            );


        const predictions =
            resultsArray
                .map(
                    (probability, index) => ({

                        index:
                            index,

                        label:
                            labels[index] ||
                            `Class ${index}`,

                        probability:
                            probability

                    })
                )
                .sort(
                    (a, b) =>
                        b.probability -
                        a.probability
                );


        return predictions;


    } finally {

        input.dispose();


        if (
            output &&
            typeof output.dispose ===
            "function"
        ) {

            output.dispose();

        }

    }

}


// ============================================================
// DISPLAY MODEL RESULTS
// ============================================================

function displaySkinResults(predictions) {

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


    tags.innerHTML = "";


    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    const categoryTag =
        document.createElement("span");

    categoryTag.textContent =
        "Category: Skin";

    tags.appendChild(
        categoryTag
    );


    // --------------------------------------------------------
    // MODEL STATUS
    // --------------------------------------------------------

    qualityBadge.textContent =
        "Corvea Skin Model";


    // --------------------------------------------------------
    // TOP PREDICTIONS
    // --------------------------------------------------------

    const topPredictions =
        predictions.slice(0, 3);


    topPredictions.forEach(
        prediction => {

            const tag =
                document.createElement("span");


            const percentage =
                (
                    prediction.probability *
                    100
                ).toFixed(1);


            tag.textContent =
                `${prediction.label} ${percentage}%`;


            tags.appendChild(tag);

        }
    );


    // --------------------------------------------------------
    // MAIN RESULT
    // --------------------------------------------------------

    const top =
        predictions[0];


    if (!top) {

        possibleResult.innerHTML = `
            <strong>
                No result available
            </strong>

            <p>
                The model did not return a usable
                classification.
            </p>
        `;

        return;

    }


    const confidence =
        (
            top.probability *
            100
        ).toFixed(1);


    possibleResult.innerHTML = `

        <div>

            <strong>
                ${top.label}
            </strong>

            <p>
                Model confidence:
                ${confidence}%
            </p>

        </div>

    `;


    // --------------------------------------------------------
    // SAFETY WARNINGS
    // --------------------------------------------------------

    if (warnings.length >= 2) {

        warnings[0].textContent =
            "The model provides a computer-vision classification based on the image. This is not a medical finding.";

        warnings[1].textContent =
            "This result is educational and must not be interpreted as a diagnosis. A qualified healthcare professional should evaluate health concerns.";

    }

}


// ============================================================
// UPDATE BIOLOGY SECTION
// ============================================================

function updateBiologySection(
    prediction
) {

    const biologyText =
        document.querySelector(
            ".biology-card > p"
        );


    if (!biologyText) {

        return;

    }


    const label =
        prediction.label.toLowerCase();


    if (
        label.includes("acne")
    ) {

        biologyText.textContent =
            "Acne can involve hair follicles, sebum production, changes in follicular cells, inflammation, and interactions with microorganisms associated with the skin.";

    }

    else if (
        label.includes("eczema")
    ) {

        biologyText.textContent =
            "Eczema can involve disruption of the skin barrier and immune-system activity, which may contribute to inflammation, dryness, itching, and visible skin changes.";

    }

    else if (
        label.includes("psoriasis")
    ) {

        biologyText.textContent =
            "Psoriasis involves immune-system activity that can increase inflammation and accelerate the growth cycle of skin cells, contributing to visible plaques and scaling.";

    }

    else if (
        label.includes("melanoma")
    ) {

        biologyText.textContent =
            "Melanoma involves abnormal growth of melanocytes, the cells responsible for producing melanin. Changes in a pigmented lesion can have many possible causes and require professional evaluation.";

    }

    else {

        biologyText.textContent =
            "Visible skin changes can be influenced by the skin barrier, immune responses, inflammation, follicles, microorganisms, pigmentation, and other biological processes.";

    }

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


    analyzeButton.disabled = true;

    analyzeButton.textContent =
        "Analyzing...";


    try {

        console.log(
            "Starting Corvea health analysis..."
        );


        // ----------------------------------------------------
        // CHECK CATEGORY
        // ----------------------------------------------------

        if (
            selectedCategory !==
            "skin"
        ) {

            throw new Error(
                "The health model currently supports skin images only. Teeth and eye models have not been connected yet."
            );

        }


        // ----------------------------------------------------
        // GET IMAGE
        // ----------------------------------------------------

        const image =
            document.getElementById(
                "imagePreview"
            );


        if (!image.complete) {

            await new Promise(
                resolve => {

                    image.onload =
                        resolve;

                }
            );

        }


        // ----------------------------------------------------
        // RUN SKIN MODEL
        // ----------------------------------------------------

        const predictions =
            await runSkinModel(
                image
            );


        console.log(
            "Corvea model predictions:",
            predictions
        );


        // ----------------------------------------------------
        // SHOW RESULTS
        // ----------------------------------------------------

        results
            .classList
            .remove("hidden");


        results.scrollIntoView({
            behavior: "smooth"
        });


        // ----------------------------------------------------
        // DISPLAY RESULTS
        // ----------------------------------------------------

        displaySkinResults(
            predictions
        );


        // ----------------------------------------------------
        // BIOLOGY
        // ----------------------------------------------------

        if (
            predictions.length > 0
        ) {

            updateBiologySection(
                predictions[0]
            );

        }


        console.log(
            "Corvea health analysis completed."
        );

    }


    catch (error) {

        console.error(
            "Corvea analysis error:",
            error
        );


        showError(
            error.message ||
            "The image could not be analyzed. Please try another image."
        );

    }


    finally {

        analyzeButton.disabled =
            false;

        analyzeButton.textContent =
            "Analyze Image";

    }

}
