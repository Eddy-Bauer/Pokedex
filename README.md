# 📖 Pokédex Web App

An interactive and responsive Pokédex web application built with Vanilla JavaScript, HTML, and CSS. The project uses the public [PokéAPI](https://pokeapi.co/?utm_source=gemini) to fetch detailed information about Pokémon and display them in an appealing design.

## ✨ Features

* **Dynamic Loading:** Initially loads the first 10 Pokémon and provides a "Load More" button to fetch 20 more at a time.

* **Smart Search:** Search through the already loaded Pokémon in real-time (the search triggers after typing at least 3 characters).

* **Color-Coded Types:** The background colors of the Pokémon cards automatically adapt to the primary type of each Pokémon (e.g., Red for Fire, Blue for Water).

* **Detailed Modal (Pop-up):** Clicking on a Pokémon opens a clean dialog box with three tabs:

  * **Main:** General info such as height, weight, base experience, and abilities.

  * **Stats:** Detailed base stats (HP, Attack, Defense, etc.) visualized with progress bars.

  * **Evo chain:** Displays the complete evolution chain of the selected Pokémon, including images.

* **Modal Navigation:** Easily browse through the list of Pokémon using the "Next" and "Previous" buttons directly inside the modal.

## 🛠️ Technologies Used

* **HTML5:** Structure of the webpage (including the native `<dialog>` element).

* **CSS3:** Layout, animations, and responsive design (via `style.css`).

* **Vanilla JavaScript:** Logic, DOM manipulation, and asynchronous API requests (`fetch`, `async/await`).

* **API:** [PokéAPI v2](https://pokeapi.co/?utm_source=gemini)

## 📁 Project Structure

```
├── assets/
│   ├── img/            # UI icons (Close, Next, Prev, Loading animation)
│   └── logos/          # Logos (Pokéball, Footer logos, Favicon)
├── index.html          # Main HTML document
├── style.css           # Styling for the entire app
├── script.js           # JavaScript logic and API integration
└── README.md           # This file

```

## 📄 License & Acknowledgements

This project was created for educational purposes. Pokémon and all associated names are trademarks of Nintendo. The data is provided by [PokéAPI](https://pokeapi.co/?utm_source=gemini).
