/**
 * Module pour créer un graphique de tendances des crimes par quart de travail
 * Ce module visualise l'évolution temporelle des crimes selon le moment de la journée
 */

/**
 * Crée un graphique de tendances des crimes par quart de travail
 * 
 * @param {Array} crimeData Les données des crimes
 * @param {Object} container Le conteneur où placer la visualisation
 */
export function createCrimeTrendsChart(crimeData, container) {
    // Créer un conteneur pour le graphique de tendances
    const trendsDiv = document.createElement('div');
    trendsDiv.className = 'crime-trends-container';
    trendsDiv.innerHTML = `
      <h2>Tendances temporelles par quart de travail</h2>
      <div class="chart-description">
        Ce graphique montre l'évolution des crimes selon le moment de la journée au fil du temps.
      </div>
      <div class="chart-filters">
        <div class="filter-group">
          <label for="category-filter-trends">Catégorie:</label>
          <select id="category-filter-trends">
            <option value="all">Toutes les catégories</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="pdq-filter-trends">PDQ:</label>
          <select id="pdq-filter-trends">
            <option value="all">Tous les PDQ</option>
          </select>
        </div>
        <button id="apply-trends-filters" class="apply-button">Appliquer</button>
      </div>
      <div class="trends-chart-area">
        <svg class="trends-chart-svg"></svg>
      </div>
      <div class="trends-legend"></div>
    `;

    container.appendChild(trendsDiv);

    // Ajouter les styles pour le graphique de tendances
    addTrendsChartStyles();

    // Extraire les catégories uniques des données
    const categories = [...new Set(crimeData
        .map(d => d.CATEGORIE)
        .filter(c => c !== null))];

    // Extraire les PDQ uniques
    const pdqs = [...new Set(crimeData
        .map(d => d.PDQ)
        .filter(p => p !== null))].sort((a, b) => a - b);

    // Remplir le sélecteur de catégories
    const categorySelect = document.getElementById('category-filter-trends');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = formatCategoryName(category);
        categorySelect.appendChild(option);
    });

    // Remplir le sélecteur de PDQ
    const pdqSelect = document.getElementById('pdq-filter-trends');
    pdqs.forEach(pdq => {
        const option = document.createElement('option');
        option.value = pdq;
        option.textContent = `PDQ ${pdq}`;
        pdqSelect.appendChild(option);
    });

    // Gestionnaire d'événement pour le bouton d'application des filtres
    document.getElementById('apply-trends-filters').addEventListener('click', function () {
        updateTrendsChart(crimeData);
    });

    // Déclencher le chargement initial
    updateTrendsChart(crimeData);
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

/**
 * Ajoute les styles CSS pour le graphique de tendances
 */
function addTrendsChartStyles() {
    // Vérifier si les styles existent déjà
    if (document.getElementById('trends-chart-styles')) return;

    const style = document.createElement('style');
    style.id = 'trends-chart-styles';
    style.textContent = `
      .crime-trends-container {
        margin-top: 40px;
        padding: 20px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .crime-trends-container h2 {
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
        min-width: 150px;
      }
      
      .chart-filters .apply-button {
        background-color: #4285F4;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        align-self: flex-end;
      }
      
      .chart-filters .apply-button:hover {
        background-color: #3367D6;
      }
      
      .trends-chart-area {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }
      
      .trends-chart-svg {
        width: 100%;
        height: 500px;
        max-width: 900px;
      }
      
      .trends-legend {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 10px;
      }
      
      .trends-legend-item {
        display: flex;
        align-items: center;
      }
      
      .trends-legend-color {
        width: 30px;
        height: 3px;
        margin-right: 8px;
      }
      
      .trends-legend-label {
        font-size: 14px;
      }
      
      .trends-tooltip {
        position: absolute;
        background-color: rgba(255, 255, 255, 0.9);
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        font-size: 14px;
        pointer-events: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      
      .empty-data-message {
        text-align: center;
        font-size: 18px;
        color: #666;
        margin: 40px 0;
      }
      
      .axis-title {
        font-size: 12px;
        font-weight: bold;
      }
    `;

    document.head.appendChild(style);
}

/**
 * Met à jour le graphique de tendances en fonction des filtres sélectionnés
 * 
 * @param {Array} crimeData Les données des crimes
 */
function updateTrendsChart(crimeData) {
    // Récupérer les valeurs des filtres
    const categoryFilter = document.getElementById('category-filter-trends').value;
    const pdqFilter = document.getElementById('pdq-filter-trends').value;

    // Filtrer les données selon les critères
    const filteredData = crimeData.filter(crime => {
        // Filtre par catégorie
        if (categoryFilter !== 'all' && crime.CATEGORIE !== categoryFilter) {
            return false;
        }

        // Filtre par PDQ
        if (pdqFilter !== 'all' && crime.PDQ !== parseInt(pdqFilter)) {
            return false;
        }

        // Vérifier que la date et le quart existent
        return crime.DATE && crime.QUART;
    });

    // Agréger les données par année et quart de travail
    const trendData = processDataForTrends(filteredData);

    // Créer le graphique
    drawTrendsChart(trendData);
}

/**
 * Traite les données pour le graphique de tendances
 * 
 * @param {Array} filteredData Les données filtrées
 * @returns {Object} Les données formatées pour le graphique
 */
function processDataForTrends(filteredData) {
    // Agréger par année et quart de travail
    const dataByYearAndQuarter = {};

    // Définir les quarts possibles
    const quarters = ['jour', 'soir', 'nuit'];

    filteredData.forEach(crime => {
        if (crime.DATE && crime.QUART) {
            const year = new Date(crime.DATE).getFullYear();
            const quart = crime.QUART;

            if (!dataByYearAndQuarter[year]) {
                dataByYearAndQuarter[year] = {
                    jour: 0,
                    soir: 0,
                    nuit: 0
                };
            }

            if (quarters.includes(quart)) {
                dataByYearAndQuarter[year][quart]++;
            }
        }
    });

    // Convertir en format pour le graphique
    const years = Object.keys(dataByYearAndQuarter).sort();

    const trendData = {
        years: years,
        quarters: quarters,
        series: quarters.map(quarter => {
            return {
                name: quarter,
                values: years.map(year => dataByYearAndQuarter[year][quarter] || 0)
            };
        })
    };

    return trendData;
}

/**
 * Dessine le graphique de tendances
 * 
 * @param {Object} data Les données formatées pour le graphique
 */
function drawTrendsChart(data) {
    // Vérifier si des données sont disponibles
    if (data.years.length === 0) {
        const chartArea = document.querySelector('.trends-chart-area');
        chartArea.innerHTML = '<div class="empty-data-message">Aucune donnée disponible pour les filtres sélectionnés</div>';
        document.querySelector('.trends-legend').innerHTML = '';
        return;
    }

    // Réinitialiser la zone du graphique
    const chartArea = document.querySelector('.trends-chart-area');
    chartArea.innerHTML = '<svg class="trends-chart-svg"></svg>';

    // Dimensions
    const margin = { top: 40, right: 60, bottom: 60, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Créer le SVG
    const svg = d3.select('.trends-chart-svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Échelles
    const x = d3.scaleBand()
        .domain(data.years)
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data.series, s => d3.max(s.values)) * 1.1]) // Ajouter 10% pour l'espace
        .nice()
        .range([height, 0]);

    // Couleurs pour les quarts de travail
    const colorScale = d3.scaleOrdinal()
        .domain(data.quarters)
        .range(['#4285F4', '#FBBC05', '#34A853']);

    // Noms formatés pour les quarts
    const quarterNames = {
        'jour': 'Jour (8h-16h)',
        'soir': 'Soir (16h-00h)',
        'nuit': 'Nuit (00h-8h)'
    };

    // Créer les lignes
    const line = d3.line()
        .x((d, i) => x(data.years[i]) + x.bandwidth() / 2)
        .y(d => y(d))
        .curve(d3.curveMonotoneX); // Lissage des courbes

    // Dessiner les axes
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll('text')
        .style('text-anchor', 'middle');

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(10));

    // Titres des axes
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Année');

    svg.append('text')
        .attr('class', 'axis-title')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .text('Nombre de crimes');

    // Titre du graphique
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Évolution des crimes par quart de travail');

    // Infobulle
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'trends-tooltip')
        .style('opacity', 0);

    // Dessiner les lignes pour chaque série
    data.series.forEach(serie => {
        const seriePath = svg.append('path')
            .datum(serie.values)
            .attr('fill', 'none')
            .attr('stroke', colorScale(serie.name))
            .attr('stroke-width', 3)
            .attr('d', line);

        // Animation de dessin de la ligne
        const pathLength = seriePath.node().getTotalLength();

        seriePath
            .attr('stroke-dasharray', pathLength)
            .attr('stroke-dashoffset', pathLength)
            .transition()
            .duration(1000)
            .attr('stroke-dashoffset', 0);
    });

    // Ajouter les points pour chaque donnée
    data.series.forEach(serie => {
        svg.selectAll(`.point-${serie.name}`)
            .data(serie.values)
            .enter()
            .append('circle')
            .attr('class', `point-${serie.name}`)
            .attr('cx', (d, i) => x(data.years[i]) + x.bandwidth() / 2)
            .attr('cy', d => y(d))
            .attr('r', 5)
            .attr('fill', colorScale(serie.name))
            .attr('stroke', 'white')
            .attr('stroke-width', 1.5)
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
                // Effet de survol
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 8);

                // Afficher l'infobulle
                const index = serie.values.indexOf(d);
                const year = data.years[index];

                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);

                tooltip.html(`
            <strong>${quarterNames[serie.name]}</strong><br>
            Année: ${year}<br>
            Nombre de crimes: ${d}
          `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function () {
                // Restaurer le point normal
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 5);

                // Masquer l'infobulle
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    });

    // Créer la légende
    createTrendsLegend(data.quarters, colorScale, quarterNames);
}

/**
 * Crée la légende pour le graphique de tendances
 * 
 * @param {Array} quarters Les quarts de travail
 * @param {Function} colorScale L'échelle de couleur utilisée
 * @param {Object} quarterNames Les noms formatés des quarts
 */
function createTrendsLegend(quarters, colorScale, quarterNames) {
    const legendContainer = document.querySelector('.trends-legend');
    legendContainer.innerHTML = '';

    quarters.forEach(quarter => {
        const legendItem = document.createElement('div');
        legendItem.className = 'trends-legend-item';

        const colorBox = document.createElement('div');
        colorBox.className = 'trends-legend-color';
        colorBox.style.backgroundColor = colorScale(quarter);

        const label = document.createElement('span');
        label.className = 'trends-legend-label';
        label.textContent = quarterNames[quarter] || quarter;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
}