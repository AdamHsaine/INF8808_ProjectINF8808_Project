/**
 * Module modifié pour créer des filtres horizontaux, similaires à ceux
 * de la visualisation "Évolution Temporelle"
 */

let updateCallback = null;
let filtersObj = null;

/**
 * Formate le nom d'une catégorie pour l'affichage
 *
 * @param {string} category La catégorie à formater
 * @returns {string} Le nom formaté
 */
function formatCategoryName(category) {
    // Première lettre en majuscule, reste en minuscule
    if (!category) return 'Non spécifié';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

/**
 * Formate le nom d'un quart de travail pour l'affichage
 *
 * @param {string} quarter Le quart à formater
 * @returns {string} Le nom formaté
 */
function formatQuarterName(quarter) {
    const mapping = {
        jour: 'Jour (8h-16h)',
        soir: 'Soir (16h-00h)',
        nuit: 'Nuit (00h-8h)'
    };
    return mapping[quarter] || quarter;
}

/**
 * Ajoute les styles CSS pour les filtres horizontaux
 */
function addHorizontalFilterStyles() {
    // Vérifier si les styles existent déjà
    if (document.getElementById('horizontal-filters-styles')) return;

    const style = document.createElement('style');
    style.id = 'horizontal-filters-styles';
    style.textContent = `
        .filters-bar {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            margin: 20px 0;
            padding: 15px;
            flex-wrap: wrap;
        }
        
        .filter-group {
            display: flex;
            align-items: center;
            white-space: nowrap;
        }
        
        .filter-group label {
            margin-right: 8px;
            font-weight: bold;
            font-size: 14px;
        }
        
        .filter-group select {
            padding: 6px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: #fff;
            font-size: 14px;
            min-width: 150px;
        }
        
        .filter-button {
            background-color: #4285F4;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 6px 20px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .filter-button:hover {
            background-color: #3367D6;
            color:  #3367D6;
        }
        
        @media (max-width: 768px) {
            .filters-bar {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .filter-group {
                margin-bottom: 10px;
                width: 100%;
            }
            
            .filter-button {
                align-self: center;
                width: 100%;
            }
        }
    `;

    document.head.appendChild(style);
}

/**
 * Initialise les filtres horizontaux dans l'interface utilisateur
 *
 * @param {object} filters Objet contenant l'état des filtres
 * @param {Function} callback Fonction à appeler lors de la mise à jour des filtres
 */
export function initializeHorizontalFilters(filters, callback) {
    updateCallback = callback;
    filtersObj = filters;

    // Ajouter les styles CSS pour les filtres horizontaux
    addHorizontalFilterStyles();

    // Création du conteneur de filtres s'il n'existe pas déjà
    if (!document.getElementById('filters-bar')) {
        const graphContainer = document.querySelector('.graph');

        // Créer la barre de filtres
        const filtersBar = document.createElement('div');
        filtersBar.id = 'filters-bar';
        filtersBar.className = 'filters-bar';

        // Insérer la barre de filtres avant la carte
        if (graphContainer) {
            graphContainer.insertBefore(filtersBar, graphContainer.firstChild);
        } else {
            // Fallback si .graph n'existe pas
            const vizContainer = document.querySelector('.viz-container');
            if (vizContainer) {
                vizContainer.appendChild(filtersBar);
            }
        }
    }

    // Créer les filtres horizontaux
    createHorizontalFilterElements();
}

/**
 * Met à jour les options des filtres avec les valeurs disponibles
 *
 * @param {Array} categories Les catégories disponibles
 * @param {Array} years Les années disponibles
 * @param {Array} quarters Les quarts de travail disponibles
 */
export function updateFilterOptions(categories, years, quarters) {
    // Mettre à jour le filtre de catégorie
    const categorySelect = document.getElementById('category-filter');
    if (categorySelect) {
        // Vider les options existantes sauf "Tous"
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }

        // Ajouter les nouvelles options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = formatCategoryName(category);
            categorySelect.appendChild(option);
        });
    }

    // Mettre à jour le filtre d'année
    const yearSelect = document.getElementById('year-filter');
    if (yearSelect) {
        // Vider les options existantes sauf "Toutes"
        while (yearSelect.options.length > 1) {
            yearSelect.remove(1);
        }

        // Ajouter les nouvelles options
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    // Mettre à jour le filtre de quart
    const quarterSelect = document.getElementById('quarter-filter');
    if (quarterSelect) {
        // Vider les options existantes sauf "Tous"
        while (quarterSelect.options.length > 1) {
            quarterSelect.remove(1);
        }

        // Ajouter les nouvelles options
        quarters.forEach(quarter => {
            const option = document.createElement('option');
            option.value = quarter;
            option.textContent = formatQuarterName(quarter);
            quarterSelect.appendChild(option);
        });
    }
}

/**
 * Crée les éléments HTML pour les filtres horizontaux
 */
function createHorizontalFilterElements() {
    const filtersBar = document.getElementById('filters-bar');
    if (!filtersBar) return;

    // Vider le conteneur
    filtersBar.innerHTML = '';

    // 1. Filtre par catégorie
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'filter-group';

    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Catégorie de crime:';
    categoryLabel.htmlFor = 'category-filter';

    const categorySelect = document.createElement('select');
    categorySelect.id = 'category-filter';

    // Option par défaut
    const categoryDefaultOption = document.createElement('option');
    categoryDefaultOption.value = 'all';
    categoryDefaultOption.textContent = 'Toutes les catégories';
    categorySelect.appendChild(categoryDefaultOption);

    // Gestionnaire d'événement
    categorySelect.addEventListener('change', function () {
        filtersObj.category = this.value;
        if (updateCallback) updateCallback();
    });

    categoryDiv.appendChild(categoryLabel);
    categoryDiv.appendChild(categorySelect);
    filtersBar.appendChild(categoryDiv);

    // 2. Filtre par année
    const yearDiv = document.createElement('div');
    yearDiv.className = 'filter-group';

    const yearLabel = document.createElement('label');
    yearLabel.textContent = 'Année:';
    yearLabel.htmlFor = 'year-filter';

    const yearSelect = document.createElement('select');
    yearSelect.id = 'year-filter';

    // Option par défaut
    const yearDefaultOption = document.createElement('option');
    yearDefaultOption.value = 'all';
    yearDefaultOption.textContent = 'Toutes les années';
    yearSelect.appendChild(yearDefaultOption);

    // Gestionnaire d'événement
    yearSelect.addEventListener('change', function () {
        filtersObj.year = this.value;
        if (updateCallback) updateCallback();
    });

    yearDiv.appendChild(yearLabel);
    yearDiv.appendChild(yearSelect);
    filtersBar.appendChild(yearDiv);

    // 3. Filtre par quart de travail
    const quarterDiv = document.createElement('div');
    quarterDiv.className = 'filter-group';

    const quarterLabel = document.createElement('label');
    quarterLabel.textContent = 'Moment de la journée:';
    quarterLabel.htmlFor = 'quarter-filter';

    const quarterSelect = document.createElement('select');
    quarterSelect.id = 'quarter-filter';

    // Option par défaut
    const quarterDefaultOption = document.createElement('option');
    quarterDefaultOption.value = 'all';
    quarterDefaultOption.textContent = 'Tous les moments';
    quarterSelect.appendChild(quarterDefaultOption);

    // Gestionnaire d'événement
    quarterSelect.addEventListener('change', function () {
        filtersObj.quarter = this.value;
        if (updateCallback) updateCallback();
    });

    quarterDiv.appendChild(quarterLabel);
    quarterDiv.appendChild(quarterSelect);
    filtersBar.appendChild(quarterDiv);

    // // Bouton d'application des filtres
    // const applyButton = document.createElement('button');
    // applyButton.textContent = 'Appliquer';
    // applyButton.className = 'filter-button';
    // applyButton.addEventListener('click', function () {
    //     if (updateCallback) updateCallback();
    // });
    // filtersBar.appendChild(applyButton);
}

// Exporter aussi l'ancienne fonction pour compatibilité
export function initializeFilters(filters, callback) {
    // Appeler la nouvelle fonction à la place
    initializeHorizontalFilters(filters, callback);
}