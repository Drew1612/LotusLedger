document.getElementById("scryfall-search-form").addEventListener("submit", function (e) {
    e.preventDefault();

    let cardName = document.getElementById("card-name").value.trim();
    if (cardName === "") return;

    fetchCard(cardName);
});

// Fetch and display a single card
function fetchCard(cardName) {
    fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.object === "error") {
                document.getElementById("card-result").innerHTML = "No results found.";
                document.getElementById("save-card").style.display = "none";
                return;
            }

            let cardHtml = `
                <h3>${data.name}</h3>
                <img src="${data.image_uris?.normal || ''}" alt="${data.name}">
                <p><strong>Set:</strong> ${data.set_name}</p>
                <p><strong>Type:</strong> ${data.type_line}</p>
                <p>${data.oracle_text}</p>
            `;

            document.getElementById("card-result").innerHTML = cardHtml;
            document.getElementById("save-card").style.display = "block";
            document.getElementById("save-card").setAttribute("data-card", JSON.stringify(data));
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("card-result").innerHTML = "An error occurred.";
        });
}

// Save the card to localStorage
document.getElementById("save-card").addEventListener("click", function () {
    let cardData = JSON.parse(this.getAttribute("data-card"));
    if (!cardData) return;

    let savedCards = JSON.parse(localStorage.getItem("savedCards")) || [];
    savedCards.push(cardData);
    localStorage.setItem("savedCards", JSON.stringify(savedCards));

    displaySavedCards();
});

// Display saved cards
function displaySavedCards() {
    let savedCardsContainer = document.getElementById("saved-cards");
    savedCardsContainer.innerHTML = "";

    let savedCards = JSON.parse(localStorage.getItem("savedCards")) || [];

    savedCards.forEach((card, index) => {
        let cardElement = document.createElement("div");
        cardElement.classList.add("saved-card");
        cardElement.innerHTML = `
            <h4>${card.name}</h4>
            <img src="${card.image_uris?.small || ''}" alt="${card.name}">
            <p><strong>Set:</strong> ${card.set_name}</p>
            <button onclick="removeCard(${index})">Remove</button>
        `;
        savedCardsContainer.appendChild(cardElement);
    });
}

// Remove a card
function removeCard(index) {
    let savedCards = JSON.parse(localStorage.getItem("savedCards")) || [];
    savedCards.splice(index, 1);
    localStorage.setItem("savedCards", JSON.stringify(savedCards));
    displaySavedCards();
}

// Load saved cards on page load
window.onload = displaySavedCards;

// Handle CSV upload
function uploadCSV() {
    const fileInput = document.getElementById("csv-file");
    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const lines = e.target.result.split("\n").map(line => line.trim()).filter(line => line);
        addCardsFromCSV(lines);
    };

    reader.readAsText(file);
}

// Fetch and save multiple cards from CSV
function addCardsFromCSV(cardNames) {
    let savedCards = JSON.parse(localStorage.getItem("savedCards")) || [];

    cardNames.forEach(cardName => {
        fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`)
            .then(response => response.json())
            .then(data => {
                if (data.object !== "error") {
                    savedCards.push(data);
                    localStorage.setItem("savedCards", JSON.stringify(savedCards));
                    displaySavedCards();
                }
            })
            .catch(error => console.error("Error fetching data:", error));
    });
}
