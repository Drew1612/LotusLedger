// JavaScript for handling form submission and interacting with Scryfall API
document.getElementById("scryfall-search-form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Get the card name entered by the user
    let cardName = document.getElementById("card-name").value.trim();
    
    if (cardName === "") return;

    // Use the fetch API to get data from the Scryfall API
    fetch(`https://api.scryfall.com/cards/named?fuzzy=${cardName}`)
        .then(response => response.json())
        .then(data => {
            if (data.object === "error") {
                document.getElementById("card-result").innerHTML = "No results found.";
                document.getElementById("card-result").style.display = "block";
                return;
            }

            let card = data;
            let cardHtml = `
                <h3>${card.name}</h3>
                <img src="${card.image_uris.normal}" alt="${card.name}">
                <p><strong>Set:</strong> ${card.set_name}</p>
                <p><strong>Type:</strong> ${card.type_line}</p>
                <p>${card.oracle_text}</p>
            `;

            // Display the card result
            document.getElementById("card-result").innerHTML = cardHtml;
            document.getElementById("card-result").style.display = "block";
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("card-result").innerHTML = "An error occurred while fetching data.";
            document.getElementById("card-result").style.display = "block";
        });
});
