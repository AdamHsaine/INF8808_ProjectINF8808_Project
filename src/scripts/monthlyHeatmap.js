/**
 * Module pour créer une visualisation des quartiers avec évolution significative de la criminalité
 * Ce module répond aux questions:
 * - Comment la criminalité évolue-t-elle au fil des années ?
 * - Quels quartiers montrent une augmentation ou diminution significative ?
 */

/**
 * Crée une visualisation des tendances par quartier
 * 
 * @param {Array} crimeData Les données des crimes
 * @param {Object} container Le conteneur où placer la visualisation
 */
export function createMonthlyHeatmap(crimeData, container) {
    // On renomme la fonction mais on garde le nom original pour compatibilité
    createNeighborhoodEvolution(crimeData, container);
}

/**
 * Crée une visualisation des tendances d'évolution par quartier
 * 
 * @param {Array} crimeData Les données des crimes
 * @param {Object} container Le conteneur où placer la visualisation
 */
function createNeighborhoodEvolution(crimeData, container) {
    // Créer un conteneur pour la visualisation
    const evolutionDiv = document.createElement('div');
    evolutionDiv.className = 'neighborhood-evolution-container';
    evolutionDiv.innerHTML = `
      <h2>Évolution de la criminalité par quartier</h2>
      <div class="chart-description">
        Cette visualisation montre les quartiers qui présentent les changements les plus significatifs de criminalité, permettant d'identifier rapidement les zones en amélioration ou en détérioration.
      </div>
      <div class="chart-filters">
        <div class="filter-group">
          <label for="category-filter-neighborhood">Catégorie:</label>
          <select id="category-filter-neighborhood">
            <option value="all">Toutes les catégories</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="year-range">Période d'analyse:</label>
          <div class="year-range-container">
            <select id="start-year">
              <!-- Sera rempli dynamiquement -->
            </select>
            <span>à</span>
            <select id="end-year">
              <!-- Sera rempli dynamiquement -->
            </select>
          </div>
        </div>
        <div class="filter-group">
          <label for="sort-method">Méthode de tri:</label>
          <select id="sort-method">
            <option value="absolute-change">Changement absolu</option>
            <option value="percent-change">Changement en pourcentage</option>
            <option value="alphabetical">Alphabétique</option>
          </select>
        </div>
        <button id="apply-neighborhood-filters" class="apply-button">Appliquer</button>
      </div>
      <div class="neighborhood-evolution-area">
        <svg class="neighborhood-evolution-svg"></svg>
      </div>
      <div class="neighborhood-evolution-details">
        <h3>Analyse détaillée</h3>
        <div id="top-improving" class="evolution-detail-section">
          <h4>Top 3 quartiers en amélioration</h4>
          <div class="detail-content"></div>
        </div>
        <div id="top-worsening" class="evolution-detail-section">
          <h4>Top 3 quartiers en détérioration</h4>
          <div class="detail-content"></div>
        </div>
      </div>
    `;

    container.appendChild(evolutionDiv);

    // Ajouter les styles pour la visualisation
    addNeighborhoodEvolutionStyles();

    // Extraire les catégories uniques des données
    const categories = [...new Set(crimeData
        .map(d => d.CATEGORIE)
        .filter(c => c !== null))];

    // Extraire les années uniques et les trier
    const years = [...new Set(crimeData
        .map(d => d.DATE ? new Date(d.DATE).getFullYear() : null)
        .filter(y => y !== null))].sort();

    // Remplir le sélecteur de catégories
    const categorySelect = document.getElementById('category-filter-neighborhood');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = formatCategoryName(category);
        categorySelect.appendChild(option);
    });

    // Remplir les sélecteurs d'années
    const startYearSelect = document.getElementById('start-year');
    const endYearSelect = document.getElementById('end-year');

    years.forEach((year, index) => {
        // Pour l'année de début, exclure la dernière année
        if (index < years.length - 1) {
            const startOption = document.createElement('option');
            startOption.value = year;
            startOption.textContent = year;
            if (index === 0) startOption.selected = true;
            startYearSelect.appendChild(startOption);
        }

        // Pour l'année de fin, exclure la première année
        if (index > 0) {
            const endOption = document.createElement('option');
            endOption.value = year;
            endOption.textContent = year;
            if (index === years.length - 1) endOption.selected = true;
            endYearSelect.appendChild(endOption);
        }
    });

    // Gestionnaire d'événement pour le bouton d'application des filtres
    document.getElementById('apply-neighborhood-filters').addEventListener('click', function () {
        updateNeighborhoodEvolution(crimeData);
    });

    // Déclencher le chargement initial
    updateNeighborhoodEvolution(crimeData);
}

/**
 * Ajoute les styles CSS pour la visualisation d'évolution par quartier
 */
function addNeighborhoodEvolutionStyles() {
    // Vérifier si les styles existent déjà
    if (document.getElementById('neighborhood-evolution-styles')) return;

    const style = document.createElement('style');
    style.id = 'neighborhood-evolution-styles';
    style.textContent = `
      .neighborhood-evolution-container {
        margin-top: 40px;
        padding: 20px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .neighborhood-evolution-container h2 {
        margin-top: 0;
        margin-bottom: 10px;
        text-align: center;
        font-size: 24px;
        color: #333;
      }
      
      .chart-description {
        text-align: center;
        margin-bottom: 20px;
        color: #666;
        font-size: 16px;
      }
      
      .chart-filters {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .chart-filters .filter-group {
        display: flex;
        flex-direction: column;
      }
      
      .year-range-container {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .chart-filters label {
        margin-bottom: 5px;
        font-weight: bold;
        font-size: 14px;
      }
      
      .chart-filters select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        min-width: 120px;
      }
      
      .chart-filters .apply-button {
        background-color: #4285F4;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        align-self: center;
      }
      
      .chart-filters .apply-button:hover {
        background-color: #3367D6;
      }
      
      .neighborhood-evolution-area {
        display: flex;
        justify-content: center;
        overflow-x: auto;
        margin-bottom: 20px;
      }
      
      .neighborhood-evolution-svg {
        width: 100%;
        height: 600px;
        max-width: 960px;
      }
      
      .neighborhood-evolution-details {
        margin-top: 30px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: white;
      }
      
      .neighborhood-evolution-details h3 {
        text-align: center;
        margin-top: 0;
        margin-bottom: 20px;
        color: #333;
        border-bottom: 2px solid #4285F4;
        padding-bottom: 10px;
      }
      
      .evolution-detail-section {
        margin-bottom: 20px;
      }
      
      .evolution-detail-section h4 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #4285F4;
      }
      
      .detail-content {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        justify-content: space-around;
      }
      
      .neighborhood-card {
        width: 30%;
        min-width: 250px;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .neighborhood-card h5 {
        margin-top: 0;
        margin-bottom: 10px;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      
      .neighborhood-card .stat {
        margin: 5px 0;
      }
      
      .neighborhood-card .change {
        font-weight: bold;
        margin-top: 10px;
        padding: 5px;
        border-radius: 4px;
        text-align: center;
      }
      
      .change.positive {
        background-color: #e6f4ea;
        color: #137333;
      }
      
      .change.negative {
        background-color: #fce8e6;
        color: #c5221f;
      }
      
      .neighborhood-bar {
        cursor: pointer;
        transition: opacity 0.2s;
      }
      
      .neighborhood-bar:hover {
        opacity: 0.8;
      }
      
      .neighborhood-tooltip {
        position: absolute;
        background-color: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        font-size: 14px;
        pointer-events: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
      }
      
      .empty-data-message {
        text-align: center;
        font-size: 18px;
        color: #666;
        margin: 40px 0;
      }
    `;

    document.head.appendChild(style);
}

/**
 * Met à jour la visualisation d'évolution par quartier en fonction des filtres sélectionnés
 * 
 * @param {Array} crimeData Les données des crimes
 */
function updateNeighborhoodEvolution(crimeData) {
    // Récupérer les valeurs des filtres
    const categoryFilter = document.getElementById('category-filter-neighborhood').value;
    const startYear = parseInt(document.getElementById('start-year').value);
    const endYear = parseInt(document.getElementById('end-year').value);
    const sortMethod = document.getElementById('sort-method').value;

    // Vérifier que les années sont valides
    if (startYear >= endYear) {
        alert('L\'année de début doit être antérieure à l\'année de fin');
        return;
    }

    // Traiter les données pour l'analyse
    const evolutionData = processDataForNeighborhoodEvolution(crimeData, categoryFilter, startYear, endYear);

    // Dessiner le graphique
    drawNeighborhoodEvolutionChart(evolutionData, sortMethod);

    // Afficher les détails des quartiers
    displayNeighborhoodDetails(evolutionData, sortMethod);
}

/**
 * Traite les données pour l'analyse d'évolution par quartier
 * 
 * @param {Array} crimeData Les données des crimes
 * @param {string} categoryFilter La catégorie à filtrer (ou 'all' pour toutes)
 * @param {number} startYear L'année de début de l'analyse
 * @param {number} endYear L'année de fin de l'analyse
 * @returns {Array} Les données traitées pour l'analyse
 */
function processDataForNeighborhoodEvolution(crimeData, categoryFilter, startYear, endYear) {
    // Filtrer les données selon la catégorie
    const filteredData = crimeData.filter(crime => {
        if (categoryFilter !== 'all' && crime.CATEGORIE !== categoryFilter) {
            return false;
        }

        if (!crime.DATE || !crime.PDQ) {
            return false;
        }

        const year = new Date(crime.DATE).getFullYear();
        return year === startYear || year === endYear;
    });

    // Agréger les crimes par PDQ et année
    const crimesByPDQAndYear = {};

    filteredData.forEach(crime => {
        const pdq = crime.PDQ;
        const year = new Date(crime.DATE).getFullYear();

        if (!crimesByPDQAndYear[pdq]) {
            crimesByPDQAndYear[pdq] = { [startYear]: 0, [endYear]: 0 };
        }

        crimesByPDQAndYear[pdq][year]++;
    });

    // Calculer les évolutions pour chaque PDQ
    const evolutionData = Object.entries(crimesByPDQAndYear)
        .map(([pdq, yearCounts]) => {
            const startCount = yearCounts[startYear] || 0;
            const endCount = yearCounts[endYear] || 0;
            const absoluteChange = endCount - startCount;
            const percentChange = startCount > 0 ? ((endCount - startCount) / startCount) * 100 : 0;

            return {
                pdq: parseInt(pdq),
                startCount,
                endCount,
                absoluteChange,
                percentChange,
                isImproving: absoluteChange < 0 // Une diminution du nombre de crimes est une amélioration
            };
        })
        .filter(item => item.startCount > 0 || item.endCount > 0); // Éliminer les PDQ sans crimes

    return evolutionData;
}

/**
 * Dessine le graphique d'évolution par quartier
 * 
 * @param {Array} data Les données traitées
 * @param {string} sortMethod La méthode de tri
 */
function drawNeighborhoodEvolutionChart(data, sortMethod) {
    // Vérifier si des données sont disponibles
    if (data.length === 0) {
        const chartArea = document.querySelector('.neighborhood-evolution-area');
        chartArea.innerHTML = '<div class="empty-data-message">Aucune donnée disponible pour les filtres sélectionnés</div>';
        return;
    }

    // Trier les données selon la méthode de tri
    const sortedData = sortNeighborhoodData(data, sortMethod);

    // Réinitialiser la zone du graphique
    const chartArea = document.querySelector('.neighborhood-evolution-area');
    chartArea.innerHTML = '<svg class="neighborhood-evolution-svg"></svg>';

    // Dimensions
    const margin = { top: 40, right: 30, bottom: 100, left: 60 };
    const width = 960 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Créer le SVG
    const svg = d3.select('.neighborhood-evolution-svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Échelles
    const x0 = d3.scaleBand()
        .domain(sortedData.map(d => d.pdq))
        .rangeRound([0, width])
        .paddingInner(0.1);

    const x1 = d3.scaleBand()
        .domain(['start', 'end'])
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);

    const yMax = d3.max(sortedData, d => Math.max(d.startCount, d.endCount));

    const y = d3.scaleLinear()
        .domain([0, yMax * 1.1]) // Ajouter 10% d'espace en haut
        .nice()
        .range([height, 0]);

    // Couleurs pour début et fin
    const color = d3.scaleOrdinal()
        .domain(['start', 'end'])
        .range(['#4285F4', '#34A853']);

    // Titre du graphique
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Évolution du nombre de crimes par PDQ');

    // Dessiner les barres groupées
    sortedData.forEach(d => {
        // Groupe pour chaque PDQ
        const pdqGroup = svg.append('g')
            .attr('transform', `translate(${x0(d.pdq)}, 0)`);

        // Barre pour l'année de début
        pdqGroup.append('rect')
            .attr('class', 'neighborhood-bar')
            .attr('x', x1('start'))
            .attr('y', y(d.startCount))
            .attr('width', x1.bandwidth())
            .attr('height', height - y(d.startCount))
            .attr('fill', color('start'))
            .on('mouseover', function (event) {
                showTooltip(event, d, 'start');
            })
            .on('mouseout', hideTooltip);

        // Barre pour l'année de fin
        pdqGroup.append('rect')
            .attr('class', 'neighborhood-bar')
            .attr('x', x1('end'))
            .attr('y', y(d.endCount))
            .attr('width', x1.bandwidth())
            .attr('height', height - y(d.endCount))
            .attr('fill', color('end'))
            .on('mouseover', function (event) {
                showTooltip(event, d, 'end');
            })
            .on('mouseout', hideTooltip);

        // Flèche ou marqueur de tendance
        if (Math.abs(d.absoluteChange) > 0) {
            const arrowX = x0.bandwidth() / 2;
            const arrowY1 = y(d.startCount) - 5;
            const arrowY2 = y(d.endCount) - 5;
            const arrowColor = d.isImproving ? "#137333" : "#c5221f";

            pdqGroup.append('line')
                .attr('x1', arrowX)
                .attr('y1', arrowY1)
                .attr('x2', arrowX)
                .attr('y2', arrowY2)
                .attr('stroke', arrowColor)
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrow)');
        }
    });

    // Définir le marqueur de flèche
    svg.append('defs').append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 5)
        .attr('refY', 0)
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#666');

    // Axe X
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x0))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    // Axe Y
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(10));

    // Titre de l'axe Y
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Nombre de crimes');

    // Légende
    const startYear = document.getElementById('start-year').value;
    const endYear = document.getElementById('end-year').value;

    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 150}, 0)`);

    // Premier élément de légende
    legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', color('start'));

    legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .text(`Année ${startYear}`);

    // Deuxième élément de légende
    legend.append('rect')
        .attr('x', 0)
        .attr('y', 25)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', color('end'));

    legend.append('text')
        .attr('x', 20)
        .attr('y', 37)
        .style('font-size', '12px')
        .text(`Année ${endYear}`);
}

/**
 * Trie les données selon la méthode spécifiée
 * 
 * @param {Array} data Les données à trier
 * @param {string} sortMethod La méthode de tri
 * @returns {Array} Les données triées
 */
function sortNeighborhoodData(data, sortMethod) {
    if (sortMethod === 'absolute-change') {
        // Trier par changement absolu (du pire au meilleur)
        return [...data].sort((a, b) => b.absoluteChange - a.absoluteChange);
    }
    else if (sortMethod === 'percent-change') {
        // Trier par changement en pourcentage (du pire au meilleur)
        return [...data].sort((a, b) => b.percentChange - a.percentChange);
    }
    else if (sortMethod === 'alphabetical') {
        // Trier par numéro de PDQ
        return [...data].sort((a, b) => a.pdq - b.pdq);
    }

    return data;
}

/**
 * Affiche une infobulle au survol d'une barre
 * 
 * @param {Event} event L'événement de survol
 * @param {Object} data Les données associées à la barre
 * @param {string} yearType Le type d'année ('start' ou 'end')
 */
function showTooltip(event, data, yearType) {
    const startYear = document.getElementById('start-year').value;
    const endYear = document.getElementById('end-year').value;
    const year = yearType === 'start' ? startYear : endYear;
    const count = yearType === 'start' ? data.startCount : data.endCount;

    // Créer l'infobulle si elle n'existe pas
    if (!d3.select('.neighborhood-tooltip').size()) {
        d3.select('body').append('div')
            .attr('class', 'neighborhood-tooltip')
            .style('opacity', 0);
    }

    // Afficher et positionner l'infobulle
    d3.select('.neighborhood-tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0.9);

    d3.select('.neighborhood-tooltip')
        .html(`
        <div style="text-align: center; font-weight: bold; margin-bottom: 5px;">
          PDQ ${data.pdq}
        </div>
        <div>
          Année: <strong>${year}</strong><br>
          Nombre de crimes: <strong>${count}</strong>
        </div>
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
}

/**
 * Cache l'infobulle
 */
function hideTooltip() {
    d3.select('.neighborhood-tooltip')
        .transition()
        .duration(500)
        .style('opacity', 0);
}

/**
 * Affiche les détails des quartiers en amélioration et en détérioration
 * 
 * @param {Array} data Les données traitées
 * @param {string} sortMethod La méthode de tri
 */
function displayNeighborhoodDetails(data, sortMethod) {
    // Vérifier si des données sont disponibles
    if (data.length === 0) return;

    // Trier les données
    const improvedPDQs = [...data]
        .filter(d => d.isImproving)
        .sort((a, b) => a.absoluteChange - b.absoluteChange) // Tri croissant pour les améliorations (les plus négatives d'abord)
        .slice(0, 3); // Top 3

    const worsenedPDQs = [...data]
        .filter(d => !d.isImproving)
        .sort((a, b) => b.absoluteChange - a.absoluteChange) // Tri décroissant pour les détériorations (les plus positives d'abord)
        .slice(0, 3); // Top 3

    // Afficher les PDQ en amélioration
    const improvingSection = document.querySelector('#top-improving .detail-content');
    improvingSection.innerHTML = '';

    if (improvedPDQs.length === 0) {
        improvingSection.innerHTML = '<p>Aucun quartier ne montre d\'amélioration significative.</p>';
    } else {
        improvedPDQs.forEach(pdq => {
            improvingSection.appendChild(createNeighborhoodCard(pdq, true));
        });
    }

    // Afficher les PDQ en détérioration
    const worseningSection = document.querySelector('#top-worsening .detail-content');
    worseningSection.innerHTML = '';

    if (worsenedPDQs.length === 0) {
        worseningSection.innerHTML = '<p>Aucun quartier ne montre de détérioration significative.</p>';
    } else {
        worsenedPDQs.forEach(pdq => {
            worseningSection.appendChild(createNeighborhoodCard(pdq, false));
        });
    }
}

/**
 * Crée une carte d'information pour un quartier
 * 
 * @param {Object} pdqData Les données du PDQ
 * @param {boolean} isImproving Indique si le PDQ est en amélioration
 * @returns {HTMLElement} L'élément de carte créé
 */
function createNeighborhoodCard(pdqData, isImproving) {
    const startYear = document.getElementById('start-year').value;
    const endYear = document.getElementById('end-year').value;
    const absoluteChange = pdqData.absoluteChange;
    const percentChange = pdqData.percentChange.toFixed(1);

    const card = document.createElement('div');
    card.className = 'neighborhood-card';

    card.innerHTML = `
      <h5>PDQ ${pdqData.pdq}</h5>
      <div class="stat">${startYear}: <strong>${pdqData.startCount}</strong> crimes</div>
      <div class="stat">${endYear}: <strong>${pdqData.endCount}</strong> crimes</div>
      <div class="change ${isImproving ? 'positive' : 'negative'}">
        ${isImproving ? '▼' : '▲'} ${Math.abs(absoluteChange)} crimes (${Math.abs(percentChange)}%)
      </div>
    `;

    return card;
}

/**
 * Formate le nom d'une catégorie pour l'affichage
 * 
 * @param {string} category La catégorie à formater
 * @returns {string} Le nom formaté
 */
function formatCategoryName(category) {
    if (!category) return 'Non spécifié';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}