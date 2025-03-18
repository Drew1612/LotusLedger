// Initialize temporary cards array
let tempCards = JSON.parse(localStorage.getItem("tempCards")) || [];
let errorCards = JSON.parse(localStorage.getItem("errorCards")) || [];

// Initialize saved cards array
let savedCards = JSON.parse(localStorage.getItem("savedCards")) || {};

// Initialize decks array
let decks = JSON.parse(localStorage.getItem("decks")) || [];

// Function to display temporary cards in a grid with 5 cards per row
function displayTempCards() {
    const tempCardsDiv = document.getElementById("temp-cards");
    tempCardsDiv.innerHTML = "";

    tempCards.forEach((card, index) => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.style.width = "90%"; // Makes sure 5 cards fit across the row
        cardDiv.innerHTML = `
            <h3>${card.name} (x${card.quantity})</h3>
            <img src="${card.image}" alt="${card.name}">
            <button onclick="removeTempCard(${index})">Remove</button>
        `;
        tempCardsDiv.appendChild(cardDiv);
    });
}

// Function to display error cards at the top of the page
function displayErrorCards() {
    const errorCardsDiv = document.getElementById("error-cards");
    errorCardsDiv.innerHTML = "<h2>Errors:</h2>";

    errorCards.forEach((card, index) => {
        const errorDiv = document.createElement("div");
        errorDiv.classList.add("error-card");
        errorDiv.innerHTML = `
            <p>${card}</p>
            <button onclick="removeErrorCard(${index})">Remove</button>
        `;
        errorCardsDiv.appendChild(errorDiv);
    });
}

// Function to remove a temporary card from the list
function removeTempCard(index) {
    tempCards.splice(index, 1); // Remove the card from the array
    localStorage.setItem("tempCards", JSON.stringify(tempCards)); // Save to local storage
    displayTempCards(); // Re-render the temp card list
}

// Function to remove an error card from the list
function removeErrorCard(index) {
    errorCards.splice(index, 1); // Remove the error card from the array
    localStorage.setItem("errorCards", JSON.stringify(errorCards)); // Save to local storage
    displayErrorCards(); // Re-render the error card list
}

// Function to confirm adding cards to the saved list
function confirmAddCards() {
    tempCards.forEach(card => {
        if (savedCards[card.name]) {
            savedCards[card.name].quantity += card.quantity;
        } else {
            savedCards[card.name] = {
                name: card.name,
                image: card.image,
                quantity: card.quantity
            };
        }
    });

    // Update the saved cards in local storage
    localStorage.setItem("savedCards", JSON.stringify(savedCards));

    // Clear the temporary card list after adding
    tempCards = [];
    localStorage.removeItem("tempCards");
    displayTempCards(); // Re-render temp card list (now empty)
}

// Function to upload CSV and add cards to the temp list
function uploadCSV() {
    let fileInput = document.getElementById("csv-upload");
    if (fileInput.files.length === 0) {
        alert("Please select a CSV file.");
        return;
    }

    let file = fileInput.files[0];
    let reader = new FileReader();
    reader.onload = function (event) {
        let csvData = event.target.result;
        processCSV(csvData);
    };
    reader.readAsText(file);
}

// Function to process CSV and add to temp cards or log errors
function processCSV(csvData) {
    let rows = csvData.split("\n").slice(1);
    rows.forEach(row => {
        let cols = row.split(",");
        if (cols.length >= 2) {
            let quantity = parseInt(cols[0].trim(), 10) || 1;
            let cardName = cols[1].trim();
            fetchCard(cardName, quantity);
        }
    });
}

// Function to fetch card from Scryfall and add to temp cards
function fetchCard(cardName, quantity = 1) {
    fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.object !== "error") {
                let card = {
                    name: data.name,
                    image: data.image_uris.normal,
                    quantity: quantity
                };
                tempCards.push(card);
                localStorage.setItem("tempCards", JSON.stringify(tempCards)); // Save to local storage
                displayTempCards(); // Re-render the temp card list
            } else {
                addErrorCard(cardName);
            }
        })
        .catch(error => {
            console.error("Error fetching card:", error);
            addErrorCard(cardName);
        });
}

// Function to add a card to the error list if it's not found
function addErrorCard(cardName) {
    if (!errorCards.includes(cardName)) {
        errorCards.push(cardName);
        localStorage.setItem("errorCards", JSON.stringify(errorCards)); // Save to local storage
        displayErrorCards(); // Re-render the error card list
    }
}

// Function to search for cards
function searchCard() {
    const searchTerm = document.getElementById("card-name").value.trim();
    if (searchTerm.length > 0) {
        fetchCard(searchTerm);
    }
}

// Function to display saved cards on the Current Cards page
function displaySavedCards() {
    const savedCardsDiv = document.getElementById("saved-cards");
    savedCardsDiv.innerHTML = "";

    Object.values(savedCards).forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.innerHTML = `
            <h3>${card.name} (x${card.quantity})</h3>
            <img src="${card.image}" alt="${card.name}">
        `;
        savedCardsDiv.appendChild(cardDiv);
    });

    // Update total card count
    document.getElementById("card-count").innerText = `Total Cards: ${Object.keys(savedCards).length}`;
}

// Filter cards by type on the Current Cards page
function filterCards() {
    const filterValue = document.getElementById("filter").value;
    const filteredCards = filterValue === "all" 
        ? Object.values(savedCards)
        : Object.values(savedCards).filter(card => card.type === filterValue);

    const savedCardsDiv = document.getElementById("saved-cards");
    savedCardsDiv.innerHTML = "";

    filteredCards.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.innerHTML = `
            <h3>${card.name} (x${card.quantity})</h3>
            <img src="${card.image}" alt="${card.name}">
        `;
        savedCardsDiv.appendChild(cardDiv);
    });
}

// Function to add a deck
function addDeck() {
    const deckName = document.getElementById("deck-name").value.trim();
    if (deckName) {
        decks.push(deckName);
        localStorage.setItem("decks", JSON.stringify(decks));
        document.getElementById("deck-name").value = ''; // Clear input field
        displayDecks(); // Re-display decks
    } else {
        alert('Please enter a valid deck name.');
    }
}

// Function to display all decks
function displayDecks() {
    const deckList = document.getElementById("deck-list-items");
    deckList.innerHTML = ''; // Clear current list

    decks.forEach((deck, index) => {
        const li = document.createElement("li");
        li.textContent = deck;

        // Create a delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
            deleteDeck(index);
        };

        li.appendChild(deleteButton);
        deckList.appendChild(li);
    });
}

// Function to delete a deck
function deleteDeck(index) {
    decks.splice(index, 1);
    localStorage.setItem("decks", JSON.stringify(decks));
    displayDecks(); // Re-display decks after deletion
}

// Display saved cards on page load
if (document.getElementById("saved-cards")) {
    displaySavedCards();
}

// Display temporary cards on Add Cards page load
if (document.getElementById("temp-cards")) {
    displayTempCards();
}

// Display error cards on Add Cards page load
if (document.getElementById("error-cards")) {
    displayErrorCards();
}

// Display decks on Manage Decks page load
if (document.getElementById("deck-list-items")) {
    displayDecks();
}

// Add event listener to search form
document.getElementById("scryfall-search-form")?.addEventListener("submit", function (e) {
    e.preventDefault();  // Prevent form submission
    searchCard();        // Call the searchCard function
});
