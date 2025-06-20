import React, { useState } from 'react';

// Translation object for English and Portuguese
const translations = {
  en: {
    cocktailGenerator: "Cocktail AI",
    discoverDrink: "Discover your next favorite drink!",
    findCocktail: "Find a Cocktail", // Keeping for internal logic, but not displayed as a heading
    searchPlaceholder: "Search for a cocktail or ingredient...", // Changed placeholder text
    searchButton: "Search",
    feelingLucky: "I'm Feeling Lucky",
    loadingCocktails: "Loading cocktails...",
    noCocktailsFound: "No cocktails found for your search. Try a different name or ingredient.",
    failedToFetch: "Failed to fetch cocktails. Please check your internet connection or try again later.",
    searchResults: "Search Results",
    category: "Category",
    glass: "Glass",
    type: "Type",
    ingredients: "Ingredients",
    instructions: "Instructions",
    createdby: "Created by",
    enterSearchTerm: "Please enter a cocktail name or ingredient to search.",
    failedRandom: "Failed to fetch a random cocktail.",
    couldNotFindDetails: "Could not find full details for this cocktail."
  },
  pt: {
    cocktailGenerator: "Cocktail AI",
    discoverDrink: "Descubra a sua próxima bebida favorita!",
    findCocktail: "Encontre um Cocktail", // Keeping for internal logic, but not not displayed as a heading
    searchPlaceholder: "Pesquise um cocktail ou ingrediente...", // Changed placeholder text
    searchButton: "Pesquisar",
    feelingLucky: "Tenho Sorte",
    loadingCocktails: "A carregar cocktails...",
    noCocktailsFound: "Nenhum cocktail encontrado para a sua pesquisa. Tente um nome ou ingrediente diferente.",
    failedToFetch: "Falha ao carregar cocktails. Verifique a sua ligação à internet ou tente novamente mais tarde.",
    searchResults: "Resultados da Pesquisa",
    category: "Categoria",
    glass: "Copo",
    type: "Tipo",
    ingredients: "Ingredientes",
    instructions: "Instruções",
    createdby: "Criado por",
    enterSearchTerm: "Por favor, insira um nome de cocktail ou ingrediente para pesquisar.",
    failedRandom: "Falha ao carregar um cocktail aleatório.",
    couldNotFindDetails: "Não foi possível encontrar detalhes completos para este cocktail."
  }
};

// Main App component
function App() {
  // State variables for managing the app's data and UI
  const [searchTerm, setSearchTerm] = useState(''); // Single input for name or ingredient search
  const [cocktails, setCocktails] = useState([]); // Array to store fetched cocktails
  const [selectedCocktail, setSelectedCocktail] = useState(null); // Currently displayed cocktail details
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(''); // Error message state
  const [language] = useState('en'); // Language state ('en' or 'pt') - kept for translations, but toggle button removed

  // Get translations based on current language
  const t = translations[language];

  const API_BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1/';

  // Function to fetch cocktails based on a given URL
  const fetchCocktails = async (url) => {
    setLoading(true);
    setError('');
    setCocktails([]); // Ensure cocktails is reset to an empty array before a new fetch
    setSelectedCocktail(null); // Clear previously selected cocktail
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.drinks; // Return the drinks array directly
    } catch (err) {
      console.error('Error fetching cocktails:', err);
      setError(t.failedToFetch); // Use translated error message
      return null; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  // Handle combined search by cocktail name or ingredient
  const handleCombinedSearch = async () => {
    if (!searchTerm.trim()) {
      setError(t.enterSearchTerm); // Use translated error message
      return;
    }

    setLoading(true);
    setError('');
    setCocktails([]);
    setSelectedCocktail(null);

    const term = searchTerm.trim();

    // 1. Try searching by name
    let results = await fetchCocktails(`${API_BASE_URL}search.php?s=${term}`);

    // 2. If no results by name, try searching by ingredient
    if (!results || results.length === 0) { // If no results by name, or if results is null/undefined
      results = await fetchCocktails(`${API_BASE_URL}filter.php?i=${term}`);
    }

    if (results && results.length > 0) {
      setCocktails(results);
      // If only one cocktail is returned (e.g., by ID or random), display its details
      if (results.length === 1) {
        setSelectedCocktail(results[0]);
      }
    } else {
      setCocktails([]); // Explicitly set to empty array if no results
      setError(t.noCocktailsFound); // Use translated error message
    }
    setLoading(false);
  };

  // Handle fetching a random cocktail
  const handleRandomCocktail = async () => {
    // Set loading state but don't clear selectedCocktail yet
    setLoading(true);
    setError('');
    setCocktails([]);
    
    try {
      const response = await fetch(`${API_BASE_URL}random.php`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.drinks && data.drinks.length > 0) {
        setSelectedCocktail(data.drinks[0]);
      } else {
        setError(t.failedRandom);
      }
    } catch (err) {
      console.error('Error fetching random cocktail:', err);
      setError(t.failedToFetch);
    } finally {
      setLoading(false);
    }
  };

  // Function to get ingredients and measures for a cocktail
  const getIngredientsAndMeasures = (cocktail) => {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}`];
      const measure = cocktail[`strMeasure${i}`];
      if (ingredient) {
        ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
      }
    }
    return ingredients;
  };

  // Function to lookup full details of a cocktail by ID
  const lookupCocktailDetails = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}lookup.php?i=${id}`);
      const data = await response.json();
      if (data.drinks && data.drinks.length > 0) {
        setSelectedCocktail(data.drinks[0]);
        setCocktails([]); // Clear the list of cocktails once a specific one is selected
      } else {
        setError(t.couldNotFindDetails); // Use translated error message
      }
    } catch (err) {
      console.error('Error looking up cocktail details:', err);
      setError(t.failedToFetch); // Use translated error message
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle language is removed as it's not used

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-inter p-4 sm:p-8 lg:p-12 flex flex-col items-center">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          .cocktail-gradient {
            background-image: linear-gradient(to right, #4299E1, #2B6CB0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
            display: inline-block;
          }
        `}
      </style>
      <main className="w-full max-w-2xl">
      <header className="text-center mb-12 sm:mb-16 lg:mb-20 relative">
        <h1 className="flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-extrabold mb-1 tracking-tight text-gray-900">
          <span className="cocktail-gradient">Cocktail</span>
          <span className="bg-blue-100 text-blue-800 text-2xl font-semibold px-2.5 py-0.5 rounded-sm ms-2">AI</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 -mt-1">{t.discoverDrink}</p>
      </header>
      
      <div id="root" className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full">

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search Input Field */}
          <input
            type="text"
            className="flex-grow p-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-base placeholder:text-gray-300"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCombinedSearch()}
            aria-label="Enter cocktail to search"
            aria-invalid="false"
          />
          <button
            onClick={handleCombinedSearch}
            className="px-5 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-400 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.searchButton}
          </button>
          <button
            onClick={handleRandomCocktail}
            className="px-5 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-400 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Search a random cocktail"
          >
            {t.feelingLucky} 🍹
          </button>
        </div>
        
        {/* Instructions or Results */}
        <div id="definitionOutput" className="bg-gray-50 p-5 rounded-md border border-gray-200 min-h-[200px] definition-scroll overflow-y-auto" aria-live="polite" role="region">
          {loading && (
            <p className="text-blue-600 text-center text-base font-medium">{t.loadingCocktails}</p>
          )}
          {error && (
            <div className="text-center text-base bg-red-100 p-3 rounded-md border border-red-300 text-red-700">
              {error}
            </div>
          )}
          {selectedCocktail && (
            <section className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4 text-gray-900">{selectedCocktail.strDrink}</h2>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0 w-full md:w-1/2 lg:w-2/5 flex justify-center">
                  <img
                    src={`${selectedCocktail.strDrinkThumb}/medium`}
                    alt={selectedCocktail.strDrink}
                    className="w-full h-auto max-h-60 object-cover rounded-lg shadow-sm border border-gray-200"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x300/E0E0E0/616161?text=No+Image`; }}
                  />
                </div>
                <div className="flex-1 space-y-3 text-base text-gray-700">
                  {selectedCocktail.strCategory && (
                    <p><span className="font-bold text-gray-800">{t.category}:</span> {selectedCocktail.strCategory}</p>
                  )}
                  {selectedCocktail.strGlass && (
                    <p><span className="font-bold text-gray-800">{t.glass}:</span> {selectedCocktail.strGlass}</p>
                  )}
                  {selectedCocktail.strAlcoholic && (
                    <p><span className="font-bold text-gray-800">{t.type}:</span> {selectedCocktail.strAlcoholic}</p>
                  )}

                  <h3 className="text-lg sm:text-xl font-bold mt-3 text-gray-800">{t.ingredients}:</h3>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    {getIngredientsAndMeasures(selectedCocktail).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  <h3 className="text-lg sm:text-xl font-bold mt-3 text-gray-800">{t.instructions}:</h3>
                  <p className="leading-relaxed text-gray-700">{selectedCocktail.strInstructions}</p>
                </div>
              </div>
            </section>
          )}
          {!loading && !error && !selectedCocktail && (
            <p className="text-gray-600 text-center text-base">Type a cocktail name or ingredient and click '{t.searchButton}', or click '{t.feelingLucky}' for a random cocktail.</p>
          )}
        </div>
      </div>

      {/* Only show this container when there are search results to display */}
      {cocktails.length > 0 && !selectedCocktail && (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl mt-8">
          {/* Cocktail List (if multiple results) */}
          <section className="space-y-8 mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-800">{t.searchResults}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
              {cocktails.map((cocktail) => (
                <div
                  key={cocktail.idDrink}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-md transition duration-300 p-4 sm:p-6 flex flex-col items-center text-center border border-gray-100"
                  onClick={() => lookupCocktailDetails(cocktail.idDrink)}
                >
                  <img
                    src={`${cocktail.strDrinkThumb}/preview`} // Using /preview for smaller image
                    alt={cocktail.strDrink}
                    className="w-full h-48 sm:h-56 object-cover rounded-lg mb-3 sm:mb-4 border border-gray-200"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x250/E0E0E0/616161?text=No+Image`; }}
                  />
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">{cocktail.strDrink}</h3>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      </main>
      <footer className="text-center text-sm text-gray-600 mt-8 py-4">
        {t.createdby} <a href="https://www.goat.africa" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-decoration-none hover:text-blue-700">Carlos Araújo</a>
      </footer>
    </div>
  );
}

export default App;
