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

const uploadError = document.getElementById("uploadError");
const results = document.getElementById("results");

// ============================================================
// CATEGORY
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

    console.log("Selected category:", category);
}

// ============================================================
// SCROLL
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

imageInput.addEventListener("change", event => {

    const file = event.target.files[0];

    if (file) {
        processFile(file);
    }

});

// ============================================================
// CAMERA INPUT
// ============================================================

cameraInput.addEventListener("change", event => {

    const file = event.target.files[0];

    if (file) {
        processFile(file);
    }

});

// ============================================================
// DRAG AND DROP
// ============================================================

uploadArea.addEventListener("dragover", event => {

    event.preventDefault();

    uploadArea.classList.add("dragover");

});

uploadArea.addEventListener("dragleave", () => {

    uploadArea.classList.remove("dragover");

});

uploadArea.addEventListener("drop", event => {

    event.preventDefault();

    uploadArea.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (file) {
        processFile(file);
    }

});

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

    const maxSize = 10 * 1024 * 1024;

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

    fileName.textContent = file.name;

    fileSize.textContent =
        formatFileSize(file.size);

    const reader = new FileReader();

    reader.onload = event => {

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
        bytes / (1024 * 1024)
    ).toFixed(1) + " MB";
}

// ============================================================
// ERROR HANDLING
// ============================================================

function showError(message) {

    uploadError.textContent = message;

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
// FREE EDUCATIONAL ANALYSIS
// ============================================================

function analyzeImage() {

    clearError();

    if (!selectedFile) {

        showError(
            "Please upload an image before starting the analysis."
        );

        return;
    }

    const analyzeButton =
        document.querySelector(".analyze-button");

    analyzeButton.disabled = true;

    analyzeButton.textContent =
        "Analyzing...";

    /*
     * This version does NOT send the image
     * to a paid API or external server.
     *
     * It provides educational information
     * based on the selected category.
     */

    setTimeout(() => {

        const data =
            getEducationalInformation(
                selectedCategory
            );

        displayResults(data);

        analyzeButton.disabled = false;

        analyzeButton.textContent =
            "Analyze Image";

    }, 800);
}

// ============================================================
// EDUCATIONAL INFORMATION
// ============================================================

function getEducationalInformation(category) {

    if (category === "skin") {

        return {

            characteristics: [
                "Visible skin change",
                "Color or texture variation",
                "Possible inflammation"
            ],

            explanation:
                "Common skin changes can have many possible causes, including irritation, inflammation, acne, eczema, infection, or other conditions.",

            biology:
                "Skin appearance can be influenced by the skin barrier, immune responses, inflammation, oil production, hair follicles, blood vessels, and microorganisms.",

            mechanism:
                "Inflammatory signals can cause changes in blood flow, immune activity, and tissue behavior that become visible on the skin.",

            appearance:
                "Changes in inflammation, pigmentation, fluid, or tissue structure can alter the color, texture, or appearance of skin."

        };

    }

    if (category === "teeth") {

        return {

            characteristics: [
                "Visible tooth or gum change",
                "Color variation",
                "Possible gum irritation"
            ],

            explanation:
                "Visible dental changes can have many possible causes, including plaque buildup, staining, irritation, or other oral conditions.",

            biology:
                "Teeth and gums are influenced by enamel structure, oral bacteria, saliva, immune responses, and surrounding tissues.",

            mechanism:
                "Bacterial activity and inflammation can affect the tissues surrounding teeth and contribute to visible changes.",

            appearance:
                "Changes in plaque, staining, inflammation, or gum tissue can affect the appearance of the mouth."

        };

    }

    return {

        characteristics: [
            "Visible eye change",
            "Color variation",
            "Possible irritation"
        ],

        explanation:
            "Visible eye changes can have many possible causes, including irritation, allergies, dryness, infection, or other conditions.",

        biology:
            "Eye appearance can be influenced by blood vessels, immune responses, tears, surrounding tissues, and environmental factors.",

        mechanism:
            "Irritation and inflammation can affect blood vessels and surrounding tissues.",

        appearance:
            "Changes in blood vessel dilation, inflammation, or tear-film conditions can alter visible eye characteristics."

    };
}

// ============================================================
// DISPLAY RESULTS
// ============================================================

function displayResults(data) {

    const tags =
        document.querySelector(".result-card .tags");

    const possibleResult =
        document.querySelector(".possible-result");

    const qualityBadge =
        document.querySelector(".quality-badge");

    const warnings =
        document.querySelectorAll(".result-warning");

    const biologyText =
        document.querySelector(".biology-card > p");

    const biologyMechanism =
        document.querySelector(
            ".biology-grid div:first-child p"
        );

    const biologyAppearance =
        document.querySelector(
            ".biology-grid div:last-child p"
        );

    // Characteristics

    tags.innerHTML = "";

    data.characteristics.forEach(characteristic => {

        const tag =
            document.createElement("span");

        tag.textContent =
            characteristic;

        tags.appendChild(tag);

    });

    // Explanation

    possibleResult.innerHTML = `

        <div>

            <strong>
                Possible educational explanations
            </strong>

            <p>
                ${data.explanation}
            </p>

        </div>

    `;

    // Badge

    qualityBadge.textContent =
        "Educational Analysis";

    // Warnings

    warnings[0].textContent =
        "This result is educational information, not an AI diagnosis. The image has not been medically classified.";

    warnings[1].textContent =
        "Corvea cannot determine what condition a person has from an image alone. A qualified healthcare professional should evaluate concerning symptoms.";

    // Biology

    biologyText.textContent =
        data.biology;

    biologyMechanism.textContent =
        data.mechanism;

    biologyAppearance.textContent =
        data.appearance;

    // Show results

    results.classList.remove("hidden");

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
