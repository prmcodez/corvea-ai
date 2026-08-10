console.log("CORVEA — AI HEALTH EDUCATION VERSION");

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

    console.log("Selected category:", selectedCategory);
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

imageInput.addEventListener("change", function (event) {

    const file = event.target.files[0];

    if (file) {
        processFile(file);
    }

});

// ============================================================
// CAMERA INPUT
// ============================================================

cameraInput.addEventListener("change", function (event) {

    const file = event.target.files[0];

    if (file) {
        processFile(file);
    }

});

// ============================================================
// DRAG AND DROP
// ============================================================

uploadArea.addEventListener("dragover", function (event) {

    event.preventDefault();

    uploadArea.classList.add("dragover");

});

uploadArea.addEventListener("dragleave", function () {

    uploadArea.classList.remove("dragover");

});

uploadArea.addEventListener("drop", function (event) {

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

    // Check file type
    if (!allowedTypes.includes(file.type)) {

        showError(
            "Please upload a JPG, JPEG, PNG, or WebP image."
        );

        return;
    }

    // Check file size
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

    reader.onload = function (event) {

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

    console.log(
        "Image selected:",
        file.name
    );
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

    console.log("Image removed.");
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
// CONVERT IMAGE TO BASE64
// ============================================================

function getImageAsBase64() {

    return new Promise((resolve, reject) => {

        if (!selectedFile) {
            reject(
                new Error("No image selected.")
            );

            return;
        }

        const reader = new FileReader();

        reader.onload = function () {

            const base64 =
                reader.result.split(",")[1];

            resolve(base64);
        };

        reader.onerror = function () {

            reject(
                new Error(
                    "Could not read the image."
                )
            );

        };

        reader.readAsDataURL(selectedFile);

    });
}

// ============================================================
// DISPLAY AI RESULTS
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
        document.querySelector(".biology-grid div:first-child p");

    const biologyAppearance =
        document.querySelector(".biology-grid div:last-child p");


    // --------------------------------------------------------
    // VISUAL CHARACTERISTICS
    // --------------------------------------------------------

    tags.innerHTML = "";

    if (
        data.visualCharacteristics &&
        data.visualCharacteristics.length > 0
    ) {

        data.visualCharacteristics.forEach(
            characteristic => {

                const tag =
                    document.createElement("span");

                tag.textContent =
                    characteristic;

                tags.appendChild(tag);

            }
        );

    } else {

        const tag =
            document.createElement("span");

        tag.textContent =
            "No characteristics identified";

        tags.appendChild(tag);
    }


    // --------------------------------------------------------
    // POSSIBLE EXPLANATION
    // --------------------------------------------------------

    if (data.possibleExplanation) {

        possibleResult.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(
                        data.possibleExplanation
                    )}
                </strong>

                <p>
                    Educational possibility based
                    on the submitted information.
                </p>

            </div>

        `;

    } else {

        possibleResult.innerHTML = `

            <div>

                <strong>
                    No specific explanation available
                </strong>

                <p>
                    The AI could not provide a useful
                    educational explanation.
                </p>

            </div>

        `;
    }


    // --------------------------------------------------------
    // BADGE
    // --------------------------------------------------------

    qualityBadge.textContent =
        "AI Educational Analysis";


    // --------------------------------------------------------
    // WARNINGS
    // --------------------------------------------------------

    warnings[0].textContent =
        "AI-generated observations may be incorrect and should not be treated as confirmed medical findings.";

    warnings[1].textContent =
        "Corvea is an educational project, not a medical diagnostic service.";


    // --------------------------------------------------------
    // BIOLOGY
    // --------------------------------------------------------

    if (data.biology) {

        biologyText.textContent =
            data.biology;
    }

    if (data.biologicalMechanisms) {

        biologyMechanism.textContent =
            data.biologicalMechanisms;
    }

    if (data.whyItLooksThisWay) {

        biologyAppearance.textContent =
            data.whyItLooksThisWay;
    }


    // --------------------------------------------------------
    // SHOW RESULTS
    // --------------------------------------------------------

    results.classList.remove("hidden");

    results.scrollIntoView({
        behavior: "smooth"
    });
}

// ============================================================
// HTML SAFETY
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}

// ============================================================
// ANALYZE IMAGE
// ============================================================

async function analyzeImage() {

    clearError();

    // --------------------------------------------------------
    // CHECK IMAGE
    // --------------------------------------------------------

    if (!selectedFile) {

        showError(
            "Please upload an image before starting the analysis."
        );

        return;
    }


    // --------------------------------------------------------
    // GET BUTTON
    // --------------------------------------------------------

    const analyzeButton =
        document.querySelector(".analyze-button");


    analyzeButton.disabled = true;

    analyzeButton.textContent =
        "Preparing image...";


    try {

        console.log(
            "Starting Corvea analysis..."
        );

        console.log(
            "Category:",
            selectedCategory
        );


        // ----------------------------------------------------
        // GET USER INFORMATION
        // ----------------------------------------------------

        const concern =
            document.getElementById(
                "concern"
            ).value;

        const duration =
            document.getElementById(
                "duration"
            ).value;

        const symptoms =
            document.getElementById(
                "symptoms"
            ).value;


        // ----------------------------------------------------
        // CONVERT IMAGE
        // ----------------------------------------------------

        analyzeButton.textContent =
            "Preparing AI analysis...";

        const image =
            await getImageAsBase64();


        console.log(
            "Image successfully prepared."
        );


        // ----------------------------------------------------
        // BACKEND CONNECTION
        // ----------------------------------------------------
        //
        // IMPORTANT:
        // This URL will be connected to your backend.
        //
        // Do NOT put an AI API key in this file.
        //
        // ----------------------------------------------------

        analyzeButton.textContent =
            "Analyzing image...";


        const response =
            await fetch(
                "/api/analyze",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        category:
                            selectedCategory,

                        image:
                            image,

                        concern:
                            concern,

                        duration:
                            duration,

                        symptoms:
                            symptoms

                    })
                }
            );


        // ----------------------------------------------------
        // CHECK RESPONSE
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                "The AI analysis service is not connected yet."
            );
        }


        const data =
            await response.json();


        console.log(
            "AI response:",
            data
        );


        // ----------------------------------------------------
        // DISPLAY
        // ----------------------------------------------------

        displayResults(data);


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

// ============================================================
// INITIALIZATION
// ============================================================

console.log(
    "Corvea JavaScript initialized."
);
