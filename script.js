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

    skin: "./models/skin/model.json"

};


const LABEL_PATHS = {

    skin: "./models/skin/labels.json"

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


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        showError(
            "Please upload a JPG, JPEG, PNG, or WebP image."
        );

        return;

    }


    if (
        file.size > maxSize
    ) {

        showError(
            "The image is too large. Maximum size is 10 MB."
        );

        return;

    }


    selectedFile = file;


    fileName.textContent =
        file.name;


    fileSize.textContent =
        formatFileSize(
            file.size
        );


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


    clearError();

}


// ============================================================
// FILE SIZE
// ============================================================

function formatFileSize(bytes) {

    if (
        bytes < 1024
    ) {

        return bytes + " B";

    }


    if (
        bytes < 1024 * 1024
    ) {

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
// LOAD SKIN MODEL
// ============================================================

async function loadSkinModel() {

    if (
        skinModel !== null
    ) {

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

    if (
        skinLabels !== null
    ) {

        return skinLabels;

    }


    console.log(
        "Loading skin labels..."
    );


    const response =
        await fetch(
            LABEL_PATHS.skin
        );


    if (
        !response.ok
    ) {

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
            tf.browser.fromPixels(
                image
            );


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
        preprocessImage(
            image
        );


    let output = null;


    try {

        output =
            model.predict(
                input
            );


        const probabilities =
            await output.data();


        const resultsArray =
            Array.from(
                probabilities
            );


        const predictions =
            resultsArray
                .map(
                    (
                        probability,
                        index
                    ) => ({

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
// DISPLAY RESULTS
// ============================================================

function displaySkinResults(
    predictions
) {


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


    // --------------------------------------------------------
    // CLEAR OLD TAGS
    // --------------------------------------------------------

    tags.innerHTML = "";


    // --------------------------------------------------------
    // TOP PREDICTIONS
    // --------------------------------------------------------

    const topPredictions =
        predictions.slice(
            0,
            3
        );


    topPredictions.forEach(
        prediction => {


            const tag =
                document.createElement(
                    "span"
                );


            const percentage =
                (
                    prediction.probability *
                    100
                ).toFixed(1);


            tag.textContent =
                `${prediction.label} (${percentage}%)`;


            tags.appendChild(
                tag
            );

        }
    );


    // --------------------------------------------------------
    // MODEL BADGE
    // --------------------------------------------------------

    qualityBadge.textContent =
        "Corvea Skin Model";


    // --------------------------------------------------------
    // MAIN RESULT
    // --------------------------------------------------------

    const best =
        predictions[0];


    if (!best) {

        possibleResult.innerHTML = `
            <strong>
                No result available
            </strong>

            <p>
                The model did not return a prediction.
            </p>
        `;

        return;

    }


    const confidence =
        (
            best.probability *
            100
        ).toFixed(1);


    possibleResult.innerHTML = `

        <div>

            <strong>
                ${best.label}
            </strong>

            <p>
                Model confidence:
                ${confidence}%
            </p>

        </div>

    `;


    // --------------------------------------------------------
    // WARNINGS
    // --------------------------------------------------------

    warnings[0].textContent =
        "The displayed predictions come from Corvea's trained computer-vision model and represent model outputs, not confirmed medical findings.";


    warnings[1].textContent =
        "Corvea is an educational project. Model predictions may be incorrect and must not be interpreted as a medical diagnosis.";


    // --------------------------------------------------------
    // BIOLOGY
    // --------------------------------------------------------

    const biologyText =
        document.querySelector(
            ".biology-card > p"
        );


    biologyText.textContent =
        "Visible skin characteristics can be influenced by biological processes involving the skin barrier, immune system, inflammation, follicles, microorganisms, and other tissues.";


    // --------------------------------------------------------
    // SHOW RESULTS
    // --------------------------------------------------------

    results.classList.remove(
        "hidden"
    );


    results.scrollIntoView({
        behavior: "smooth"
    });

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
        "Loading AI model...";


    try {


        console.log(
            "Starting Corvea health analysis..."
        );


        // ----------------------------------------------------
        // ONLY SKIN IS CURRENTLY CONNECTED
        // ----------------------------------------------------

        if (
            selectedCategory !==
            "skin"
        ) {

            throw new Error(
                "Only the skin model is currently connected. Teeth and eye models will be added later."
            );

        }


        // ----------------------------------------------------
        // WAIT FOR IMAGE
        // ----------------------------------------------------

        const image =
            document.getElementById(
                "imagePreview"
            );


        // ----------------------------------------------------
        // RUN MODEL
        // ----------------------------------------------------

        analyzeButton.textContent =
            "Analyzing image...";


        const predictions =
            await runSkinModel(
                image
            );


        console.log(
            "Skin model predictions:",
            predictions
        );


        // ----------------------------------------------------
        // DISPLAY
        // ----------------------------------------------------

        displaySkinResults(
            predictions
        );


        console.log(
            "Corvea health analysis completed."
        );


    } catch (error) {


        console.error(
            "Corvea analysis error:",
            error
        );


        showError(
            error.message ||
            "The image could not be analyzed. Please try again."
        );


    } finally {


        analyzeButton.disabled =
            false;


        analyzeButton.textContent =
            "Analyze Image";

    }

}
