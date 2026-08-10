console.log("CORVEA HEALTH EDUCATION VERSION 2");

// ============================================================
// VARIABLES
// ============================================================

let selectedCategory = "skin";
let selectedFile = null;

// ============================================================
// DOM ELEMENTS
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
// IMAGE INPUT
// ============================================================

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

// ============================================================
// CAMERA INPUT
// ============================================================

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

// ============================================================
// DRAG AND DROP
// ============================================================

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
        "Preparing analysis...";

    try {

        /*
         * The actual AI vision API will be
         * connected here.
         *
         * Do NOT put a private API key
         * directly inside this JavaScript file.
         */

        analyzeButton.textContent =
            "Analyzing image...";

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    1000
                )
        );

        displayEducationalResult();

    } catch (error) {

        console.error(
            "Corvea analysis error:",
            error
        );

        showError(
            "The image could not be analyzed. Please try again."
        );

    } finally {

        analyzeButton.disabled =
            false;

        analyzeButton.textContent =
            "Analyze Image";
    }
}

// ============================================================
// DISPLAY EDUCATIONAL RESULT
// ============================================================

function displayEducationalResult() {

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

    tags.innerHTML = "";

    const tag =
        document.createElement(
            "span"
        );

    tag.textContent =
        "AI analysis connection pending";

    tags.appendChild(tag);

    qualityBadge.textContent =
        "Educational Preview";

    possibleResult.innerHTML = `
        <div>

            <strong>
                AI analysis will appear here
            </strong>

            <p>
                The image-analysis service
                has not been connected yet.
            </p>

        </div>
    `;

    warnings[0].textContent =
        "Corvea will use AI to identify observable visual characteristics and provide educational possibilities.";

    warnings[1].textContent =
        "AI-generated information may be incorrect and must not be interpreted as a medical diagnosis.";

    biologyText.textContent =
        "Corvea will explain the biological processes that may be associated with observable characteristics, including inflammation, skin-barrier function, microorganisms, tissues, and other relevant mechanisms.";

    results
        .classList
        .remove("hidden");

    results.scrollIntoView({
        behavior: "smooth"
    });
}

// ============================================================
// INITIALIZATION
// ============================================================

console.log(
    "Corvea JavaScript initialized."
);
