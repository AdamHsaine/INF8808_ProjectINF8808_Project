/**
 * Module pour analyser les corrélations entre types de crimes et périodes
 * Répond à la question: "Y a-t-il des corrélations entre certains types de crimes et des périodes?"
 */

/**
 * Crée une visualisation d'analyse des corrélations temporelles des crimes
 * 
 * @param {Array} crimeData Les données des crimes
 * @param {Object} container Le conteneur où placer la visualisation
 */
export function createCrimeCorrelationAnalysis(crimeData, container) {
    // Créer un conteneur pour la visualisation
    const analysisDiv = document.createElement('div');
    analysisDiv.className = 'crime-correlation-container';
    analysisDiv.innerHTML = `
      <h2>Corrélations entre types de crimes et périodes</h2>
      <div class="analysis-description">
        <p>Cette analyse examine les relations entre différents types de crimes et les périodes temporelles, 
        révélant quand certains types de crimes sont plus susceptibles de se produire.</p>
      </div>
      <div class="analysis-controls">
        <div class="control-group">
          <label for="correlation-period">Période d'analyse:</label>
          <select id="correlation-period">
            <option value="day">Moment de la journée</option>
            <option value="month">Mois de l'année</option>
            <option value="weekday">Jour de la semaine</option>
          </select>
        </div>
        <div class="control-group">
          <label for="correlation-categories">Nombre de catégories:</label>
          <select id="correlation-categories">
            <option value="5">Top 5 catégories</option>
            <option value="10">Top 10 catégories</option>
            <option value="all">Toutes les catégories</option>
          </select>
        </div>
        <button id="apply-correlation-controls" class="apply-button">Appliquer</button>
      </div>
      <div class="correlation-heatmap-container">
        <svg id="correlation-heatmap" class="analysis-chart"></svg>
      </div>
      <div class="correlation-insights">
        <h3>Principales observations</h3>
        <div class="insights-content"></div>
      </div>
      <div class="period-distribution-section">
        <h3>Distribution des crimes par période</h3>
        <div class="period-chart-container">
          <svg id="period-distribution-chart" class="analysis-chart"></svg>
        </div>
      </div>
    `;

    container.appendChild(analysisDiv);

    // Ajouter les styles pour la visualisation
    addCorrelationAnalysisStyles();

    // Gestionnaire d'événement pour les contrôles
    document.getElementById('apply-correlation-controls').addEventListener('click', function () {
        updateCorrelationAnalysis(crimeData);
    });

    // Initialiser la visualisation
    updateCorrelationAnalysis(crimeData);
}

/**
 * Ajoute les styles CSS pour l'analyse de corrélation
 */
function addCorrelationAnalysisStyles() {
    // Vérifier si les styles existent déjà
    if (document.getElementById('crime-correlation-styles')) return;

    const style = document.createElement('style');
    style.id = 'crime-correlation-styles';
    style.textContent = `
      .crime-correlation-container {
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
      
      .crime-correlation-container h2 {
        margin-top: 0;
        color: #333;
        text-align: center;
        margin-bottom: 15px;
        font-size: 24px;
      }
      
      .analysis-description {
        text-align: center;
        color: #666;
        margin-bottom: 20px;
        font-size: 16px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .analysis-controls {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 15px;
        margin-bottom: 25px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 8px;
      }
      
      .control-group {
        display: flex;
        flex-direction: column;
      }
      
      .control-group label {
        margin-bottom: 5px;
        font-weight: bold;
        font-size: 14px;
        color: #555;
      }
      
      .control-group select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        min-width: 150px;
      }
      
      .apply-button {
        align-self: flex-end;
        background-color: #FB8C00;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .apply-button:hover {
        background-color: #F57C00;
      }
      
      .correlation-heatmap-container {
        display: flex;
        justify-content: center;
        margin-bottom: 30px;
        height: 500px;
      }
      
      .analysis-chart {
        width: 100%;
        max-width: 900px;
        height: 100%;
      }
      
      .correlation-insights {
        margin-bottom: 30px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 8px;
        border-left: 4px solid #FB8C00;
      }
      
      .correlation-insights h3 {
        margin-top: 0;
        color: #FB8C00;
        font-size: 18px;
        margin-bottom: 15px;
      }
      
      .insights-content {
        color: #333;
        line-height: 1.5;
      }
      
      .insights-content ul {
        margin: 0;
        padding-left: 20px;
      }
      
      .insights-content li {
        margin-bottom: 8px;
      }
      
      .period-distribution-section {
        margin-bottom: 30px;
      }
      
      .period-distribution-section h3 {
        text-align: center;
        color: #333;
        margin-bottom: 15px;
      }
      
      .period-chart-container {
        display: flex;
        justify-content: center;
        height: 350px;
      }
      
      .heatmap-cell {
        stroke: white;
        stroke-width: 0.5;
      }
      
      .heatmap-cell:hover {
        stroke-width: 2;
        stroke: #333;
      }
      
      .correlation-tooltip {
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
      
      .axis-label {
        font-size: 14px;
        font-weight: bold;
      }
      
      .y-axis-label {
        text-anchor: middle;
      }
      
      .x-axis text {
        text-anchor: end;
        transform: rotate(-45deg);
        font-size: 12px;
      }
      
      .y-axis text {
        font-size: 12px;
      }
      
      .legend-label {
        font-size: 10px;
      }
      
      .highlight-cell {
        stroke: #000;
        stroke-width: 2;
      }
    `;

    document.head.appendChild(style);
}

/**
 * Met à jour l'analyse de corrélation en fonction des contrôles sélectionnés
 * 
 * @param {Array} crimeData Les données des crimes
 */
function updateCorrelationAnalysis(crimeData) {
    // Récupérer les valeurs des contrôles
    const periodType = document.getElementById('correlation-period').value;
    const categoryCount = document.getElementById('correlation-categories').value;

    // Traiter les données pour l'analyse
    const processedData = processDataForCorrelationAnalysis(crimeData, periodType, categoryCount);

    // Créer la heatmap de corrélation
    createCorrelationHeatmap(processedData, periodType);

    // Créer le graphique de distribution par période
    createPeriodDistributionChart(processedData, periodType);

    // Générer les insights basés sur les données
    generateCorrelationInsights(processedData, periodType);
}

/**
 * Traite les données pour l'analyse de corrélation
 * 
 * @param {Array} crimeData Les données brutes des crimes
 * @param {string} periodType Le type de période d'analyse
 * @param {string} categoryCount Le nombre de catégories à inclure
 * @returns {Object} Les données traitées pour l'analyse
 */
function processDataForCorrelationAnalysis(crimeData, periodType, categoryCount) {
    // Filtrer les données avec date valide
    const validData = crimeData.filter(crime => crime.DATE && crime.CATEGORIE);

    // Extraire les périodes selon le type
    const periods = extractPeriods(validData, periodType);

    // Extraire les catégories et les compter
    const categoryCounts = {};

    validData.forEach(crime => {
        if (!categoryCounts[crime.CATEGORIE]) {
            categoryCounts[crime.CATEGORIE] = 0;
        }
        categoryCounts[crime.CATEGORIE]++;
    });

    // Trier les catégories par fréquence
    const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    // Sélectionner les catégories selon le paramètre
    let selectedCategories;
    if (categoryCount === 'all') {
        selectedCategories = sortedCategories;
    } else {
        selectedCategories = sortedCategories.slice(0, parseInt(categoryCount));
    }

    // Créer la matrice de corrélation
    const correlationMatrix = {};
    const periodTotals = {};
    const categoryTotals = {};
    const grandTotal = validData.length;

    // Initialiser les structures
    selectedCategories.forEach(category => {
        correlationMatrix[category] = {};
        categoryTotals[category] = 0;

        periods.forEach(period => {
            correlationMatrix[category][period] = 0;

            if (!periodTotals[period]) {
                periodTotals[period] = 0;
            }
        });
    });

    // Remplir la matrice
    validData.forEach(crime => {
        const category = crime.CATEGORIE;
        if (selectedCategories.includes(category)) {
            const period = getPeriod(crime.DATE, crime.QUART, periodType);

            correlationMatrix[category][period]++;
            categoryTotals[category]++;
            periodTotals[period]++;
        }
    });

    // Calculer les coefficients de corrélation et écarts par rapport à l'attendu
    const expectedMatrix = {};
    const deviationMatrix = {};

    selectedCategories.forEach(category => {
        expectedMatrix[category] = {};
        deviationMatrix[category] = {};

        periods.forEach(period => {
            // Valeur attendue si indépendance (loi du produit des probabilités)
            const expected = (categoryTotals[category] * periodTotals[period]) / grandTotal;

            // Écart par rapport à l'attendu (en pourcentage)
            const actual = correlationMatrix[category][period];
            const deviation = expected > 0 ? ((actual - expected) / expected) * 100 : 0;

            expectedMatrix[category][period] = expected;
            deviationMatrix[category][period] = deviation;
        });
    });

    return {
        correlationMatrix,
        expectedMatrix,
        deviationMatrix,
        periods,
        selectedCategories,
        periodTotals,
        categoryTotals,
        grandTotal,
        periodType
    };
}

/**
 * Extrait les périodes pertinentes selon le type d'analyse
 * 
 * @param {Array} data Les données filtrées
 * @param {string} periodType Le type de période d'analyse
 * @returns {Array} Les périodes disponibles
 */
function extractPeriods(data, periodType) {
    if (periodType === 'day') {
        // Périodes de la journée (en utilisant le champ QUART)
        return ['jour', 'soir', 'nuit'];
    }
    else if (periodType === 'month') {
        // Mois de l'année
        return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    }
    else if (periodType === 'weekday') {
        // Jours de la semaine
        return ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    }

    return [];
}

/**
 * Obtient la période correspondante pour un crime
 * 
 * @param {string} date La date du crime
 * @param {string} quart Le quart de travail (pour période de la journée)
 * @param {string} periodType Le type de période d'analyse
 * @returns {string} La période correspondante
 */
function getPeriod(date, quart, periodType) {
    const d = new Date(date);

    if (periodType === 'day') {
        // Utiliser directement le quart de travail
        return quart || 'jour'; // Par défaut 'jour' si non spécifié
    }
    else if (periodType === 'month') {
        // Extraire le mois (1-12) et le formater avec deux chiffres
        return (d.getMonth() + 1).toString().padStart(2, '0');
    }
    else if (periodType === 'weekday') {
        // Extraire le jour de la semaine (0-6, où 0 = Dimanche)
        const weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return weekdays[d.getDay()];
    }

    return '';
}

/**
 * Crée une heatmap de corrélation entre catégories de crimes et périodes
 * 
 * @param {Object} data Les données traitées
 * @param {string} periodType Le type de période d'analyse
 */
function createCorrelationHeatmap(data, periodType) {
    // Sélectionner et vider le SVG
    const svg = d3.select('#correlation-heatmap');
    svg.selectAll('*').remove();

    // Dimensions
    const margin = { top: 50, right: 70, bottom: 100, left: 150 };
    const width = svg.node().clientWidth - margin.left - margin.right;
    const height = svg.node().clientHeight - margin.top - margin.bottom;

    // Groupe principal avec marge
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Échelles
    const x = d3.scaleBand()
        .domain(data.periods)
        .range([0, width])
        .padding(0.05);

    const y = d3.scaleBand()
        .domain(data.selectedCategories)
        .range([0, height])
        .padding(0.05);

    // Échelle de couleur divergente pour les écarts (rouge = au-dessus de l'attendu, bleu = en-dessous)
    const colorScale = d3.scaleSequential()
        .domain([-50, 50])
        .interpolator(d3.interpolateRdBu);

    // Fonction pour déterminer la couleur selon l'écart
    function getColor(deviation) {
        return colorScale(-deviation); // Inverser pour que rouge = positif, bleu = négatif
    }

    // Dessiner les rectangles de la heatmap
    data.selectedCategories.forEach(category => {
        data.periods.forEach(period => {
            const deviation = data.deviationMatrix[category][period];
            const actual = data.correlationMatrix[category][period];
            const expected = data.expectedMatrix[category][period];

            g.append('rect')
                .attr('class', 'heatmap-cell')
                .attr('x', x(period))
                .attr('y', y(category))
                .attr('width', x.bandwidth())
                .attr('height', y.bandwidth())
                .attr('fill', getColor(deviation))
                .attr('opacity', 0.8)
                .on('mouseover', function (event) {
                    // Mettre en évidence la cellule
                    d3.select(this)
                        .attr('class', 'heatmap-cell highlight-cell');

                    // Afficher une infobulle
                    displayCorrelationTooltip(event, {
                        category,
                        period,
                        actual,
                        expected,
                        deviation
                    }, periodType);
                })
                .on('mouseout', function () {
                    // Restaurer l'apparence normale
                    d3.select(this)
                        .attr('class', 'heatmap-cell');

                    // Masquer l'infobulle
                    hideCorrelationTooltip();
                });
        });
    });

    // Axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .text(d => formatCategoryName(d).substring(0, 30)); // Limiter la longueur pour éviter les débordements

    // Titre de l'axe X
    g.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text(getPeriodTypeLabel(periodType));

    // Titre de l'axe Y
    g.append('text')
        .attr('class', 'axis-label y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .text('Type de crime');

    // Titre du graphique
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', margin.left + width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`Corrélation entre types de crimes et ${getPeriodTypeLabel(periodType).toLowerCase()}`);

    // Légende pour l'échelle de couleur
    const legendWidth = 200;
    const legendHeight = 15;

    const legendGroup = svg.append('g')
        .attr('class', 'heatmap-legend')
        .attr('transform', `translate(${margin.left + width - legendWidth - 20}, ${margin.top + 410})`);

    legendGroup.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Écart par rapport à l\'attendu');

    // Gradient pour la légende
    const defs = legendGroup.append('defs');

    const gradient = defs.append('linearGradient')
        .attr('id', 'heatmap-gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

    // Définir les stops du gradient
    const stops = [
        { offset: 0, color: colorScale(-50) },
        { offset: 0.5, color: colorScale(0) },
        { offset: 1, color: colorScale(50) }
    ];

    stops.forEach(stop => {
        gradient.append('stop')
            .attr('offset', stop.offset)
            .attr('stop-color', stop.color);
    });

    // Rectangle avec le gradient
    legendGroup.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#heatmap-gradient)');

    // Étiquettes de la légende
    legendGroup.append('text')
        .attr('class', 'legend-label')
        .attr('x', -50)
        .attr('y', legendHeight + 15)
        .attr('text-anchor', 'start')
        .text('-50% (sous-représenté)');

    legendGroup.append('text')
        .attr('class', 'legend-label')
        .attr('x', legendWidth / 2)
        .attr('y', legendHeight + 15)
        .attr('text-anchor', 'middle')
        .text('0%');

    legendGroup.append('text')
        .attr('class', 'legend-label')
        .attr('x', legendWidth + 50)
        .attr('y', legendHeight + 15)
        .attr('text-anchor', 'end')
        .text('+50% (sur-représenté)');
}

/**
 * Crée un graphique de distribution des crimes par période
 * 
 * @param {Object} data Les données traitées
 * @param {string} periodType Le type de période d'analyse
 */
function createPeriodDistributionChart(data, periodType) {
    // Sélectionner et vider le SVG
    const svg = d3.select('#period-distribution-chart');
    svg.selectAll('*').remove();

    // Dimensions
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const width = svg.node().clientWidth - margin.left - margin.right;
    const height = svg.node().clientHeight - margin.top - margin.bottom;

    // Groupe principal avec marge
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Extraire les données pour le graphique
    const chartData = data.periods.map(period => ({
        period,
        count: data.periodTotals[period],
        percentage: (data.periodTotals[period] / data.grandTotal) * 100
    }));

    // Échelles
    const x = d3.scaleBand()
        .domain(data.periods)
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.count) * 1.1])
        .range([height, 0]);

    // Barres
    g.selectAll('.period-bar')
        .data(chartData)
        .enter().append('rect')
        .attr('class', 'period-bar')
        .attr('x', d => x(d.period))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.count))
        .attr('fill', '#FB8C00')
        .attr('opacity', 0.8)
        .on('mouseover', function (event, d) {
            // Mettre en évidence la barre
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 1);

            // Afficher une infobulle
            displayPeriodTooltip(event, d, periodType);
        })
        .on('mouseout', function () {
            // Restaurer l'opacité normale
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 0.8);

            // Masquer l'infobulle
            hideCorrelationTooltip();
        });

    // Étiquettes des barres
    g.selectAll('.bar-label')
        .data(chartData)
        .enter().append('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.period) + x.bandwidth() / 2)
        .attr('y', d => y(d.count) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text(d => `${d.percentage.toFixed(1)}%`);

    // Axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(5));

    // Titres des axes
    g.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text(getPeriodTypeLabel(periodType));

    g.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .attr('text-anchor', 'middle')
        .text('Nombre de crimes');

    // Titre du graphique
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', margin.left + width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`Distribution des crimes par ${getPeriodTypeLabel(periodType).toLowerCase()}`);
}

/**
 * Génère des insights basés sur l'analyse des corrélations
 * 
 * @param {Object} data Les données traitées
 * @param {string} periodType Le type de période d'analyse
 */
function generateCorrelationInsights(data, periodType) {
    const insightsContainer = document.querySelector('.insights-content');
    insightsContainer.innerHTML = '';

    // Trouver les corrélations positives les plus fortes
    const positiveCorrelations = findStrongCorrelations(data, true);

    // Trouver les corrélations négatives les plus fortes
    const negativeCorrelations = findStrongCorrelations(data, false);

    // Trouver la période avec le plus de crimes
    const peakPeriod = findPeakPeriod(data);

    // Trouver la période avec le moins de crimes
    const lowPeriod = findLowPeriod(data);

    // Générer les insights HTML
    let insightsHTML = '<ul>';

    // Insight sur les corrélations positives
    if (positiveCorrelations.length > 0) {
        insightsHTML += `
        <li>
          <strong>Associations temporelles significatives:</strong> 
          ${positiveCorrelations.slice(0, 3).map(c =>
            `Les crimes de type <strong>${formatCategoryName(c.category)}</strong> sont ${Math.round(c.deviation)}% plus fréquents ${formatPeriodWithType(c.period, periodType)} que ce qui serait attendu si la distribution était uniforme.`
        ).join(' ')}
        </li>
      `;
    }

    // Insight sur les corrélations négatives
    if (negativeCorrelations.length > 0) {
        insightsHTML += `
        <li>
          <strong>Périodes de sous-représentation:</strong> 
          ${negativeCorrelations.slice(0, 2).map(c =>
            `Les crimes de type <strong>${formatCategoryName(c.category)}</strong> sont ${Math.abs(Math.round(c.deviation))}% moins fréquents ${formatPeriodWithType(c.period, periodType)} que la moyenne.`
        ).join(' ')}
        </li>
      `;
    }

    // Insight sur la période de pointe
    insightsHTML += `
<li>
  <strong>Période de pointe:</strong> 
  ${formatPeriodWithType(peakPeriod.period, periodType, true)} est la période où le plus grand nombre de crimes sont commis, 
  représentant ${peakPeriod.percentage.toFixed(1)}% de tous les crimes.
  ${peakPeriod.topCategories.length > 0 ?
            `Les catégories les plus fréquentes durant cette période sont ${peakPeriod.topCategories.map(c => formatCategoryName(c)).join(', ')}.` :
            ''}
</li>
`;

    // Insight sur la période creuse
    insightsHTML += `
<li>
  <strong>Période creuse:</strong> 
  ${formatPeriodWithType(lowPeriod.period, periodType, true)} est la période avec le moins de crimes, 
  représentant seulement ${lowPeriod.percentage.toFixed(1)}% de tous les crimes.
</li>
`;

    insightsHTML += '</ul>';

    insightsContainer.innerHTML = insightsHTML;
}

/**
* Trouve les corrélations les plus fortes (positives ou négatives)
* 
* @param {Object} data Les données traitées
* @param {boolean} positive Rechercher les corrélations positives (true) ou négatives (false)
* @returns {Array} Les corrélations les plus fortes
*/
function findStrongCorrelations(data, positive) {
    const correlations = [];

    data.selectedCategories.forEach(category => {
        data.periods.forEach(period => {
            const deviation = data.deviationMatrix[category][period];

            // Ne considérer que les déviations significatives (>= 20% en valeur absolue)
            if ((positive && deviation >= 20) || (!positive && deviation <= -20)) {
                correlations.push({
                    category,
                    period,
                    deviation,
                    actual: data.correlationMatrix[category][period],
                    expected: data.expectedMatrix[category][period]
                });
            }
        });
    });

    // Trier par déviation (plus forte d'abord)
    if (positive) {
        correlations.sort((a, b) => b.deviation - a.deviation);
    } else {
        correlations.sort((a, b) => a.deviation - b.deviation);
    }

    return correlations;
}

/**
* Trouve la période avec le plus de crimes
* 
* @param {Object} data Les données traitées
* @returns {Object} Informations sur la période de pointe
*/
function findPeakPeriod(data) {
    // Trouver la période avec le plus grand nombre de crimes
    let maxCount = 0;
    let peakPeriod = null;

    data.periods.forEach(period => {
        if (data.periodTotals[period] > maxCount) {
            maxCount = data.periodTotals[period];
            peakPeriod = period;
        }
    });

    // Calculer le pourcentage
    const percentage = (maxCount / data.grandTotal) * 100;

    // Trouver les catégories les plus courantes durant cette période
    const categoriesInPeriod = [];

    data.selectedCategories.forEach(category => {
        categoriesInPeriod.push({
            category,
            count: data.correlationMatrix[category][peakPeriod]
        });
    });

    // Trier par nombre de crimes et prendre les 3 premières
    categoriesInPeriod.sort((a, b) => b.count - a.count);
    const topCategories = categoriesInPeriod.slice(0, 3).map(c => c.category);

    return {
        period: peakPeriod,
        count: maxCount,
        percentage,
        topCategories
    };
}

/**
* Trouve la période avec le moins de crimes
* 
* @param {Object} data Les données traitées
* @returns {Object} Informations sur la période creuse
*/
function findLowPeriod(data) {
    // Trouver la période avec le plus petit nombre de crimes
    let minCount = Infinity;
    let lowPeriod = null;

    data.periods.forEach(period => {
        if (data.periodTotals[period] < minCount) {
            minCount = data.periodTotals[period];
            lowPeriod = period;
        }
    });

    // Calculer le pourcentage
    const percentage = (minCount / data.grandTotal) * 100;

    return {
        period: lowPeriod,
        count: minCount,
        percentage
    };
}

/**
* Formate une période en fonction du type
* 
* @param {string} period La période
* @param {string} periodType Le type de période
* @param {boolean} capitalize Mettre la première lettre en majuscule
* @returns {string} La période formatée
*/
function formatPeriodWithType(period, periodType, capitalize = false) {
    let result = '';

    if (periodType === 'day') {
        const periodNames = {
            'jour': 'pendant la journée',
            'soir': 'le soir',
            'nuit': 'la nuit'
        };

        result = periodNames[period] || period;
    }
    else if (periodType === 'month') {
        const monthNames = [
            'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
        ];

        const monthIndex = parseInt(period) - 1;
        result = `en ${monthNames[monthIndex]}`;
    }
    else if (periodType === 'weekday') {
        result = `le ${period.toLowerCase()}`;
    }

    if (capitalize) {
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    return result;
}

/**
* Affiche une infobulle pour une cellule de la heatmap
* 
* @param {Event} event L'événement de souris
* @param {Object} data Les données de la cellule
* @param {string} periodType Le type de période
*/
function displayCorrelationTooltip(event, data, periodType) {
    // Créer l'infobulle si elle n'existe pas
    if (!d3.select('.correlation-tooltip').size()) {
        d3.select('body').append('div')
            .attr('class', 'correlation-tooltip')
            .style('opacity', 0);
    }

    // Formater la période
    const formattedPeriod = getPeriodLabel(data.period, periodType);

    // Déterminer le type de déviation
    let deviationType = 'neutre';
    if (data.deviation > 20) {
        deviationType = 'sur-représentation significative';
    } else if (data.deviation > 10) {
        deviationType = 'sur-représentation modérée';
    } else if (data.deviation < -20) {
        deviationType = 'sous-représentation significative';
    } else if (data.deviation < -10) {
        deviationType = 'sous-représentation modérée';
    }

    // Définir le contenu de l'infobulle
    let tooltipContent = `
<div style="text-align: center; font-weight: bold; margin-bottom: 8px; color: #FB8C00; font-size: 14px;">
  ${formatCategoryName(data.category)}
</div>
<div style="margin-bottom: 5px;">
  <strong>Période:</strong> ${formattedPeriod}
</div>
<hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;">
<div>
  <strong>Nombre observé:</strong> ${data.actual} crimes<br>
  <strong>Nombre attendu:</strong> ${data.expected.toFixed(1)} crimes<br>
  <strong>Écart:</strong> ${data.deviation.toFixed(1)}%<br>
  <strong>Type:</strong> ${deviationType}
</div>
`;

    // Afficher et positionner l'infobulle
    d3.select('.correlation-tooltip')
        .html(tooltipContent)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 0.9);
}

/**
* Affiche une infobulle pour une barre du graphique de distribution
* 
* @param {Event} event L'événement de souris
* @param {Object} data Les données de la barre
* @param {string} periodType Le type de période
*/
function displayPeriodTooltip(event, data, periodType) {
    // Créer l'infobulle si elle n'existe pas
    if (!d3.select('.correlation-tooltip').size()) {
        d3.select('body').append('div')
            .attr('class', 'correlation-tooltip')
            .style('opacity', 0);
    }

    // Formater la période
    const formattedPeriod = getPeriodLabel(data.period, periodType);

    // Définir le contenu de l'infobulle
    let tooltipContent = `
<div style="text-align: center; font-weight: bold; margin-bottom: 8px; color: #FB8C00; font-size: 14px;">
  ${formattedPeriod}
</div>
<div>
  <strong>Nombre de crimes:</strong> ${data.count}<br>
  <strong>Pourcentage du total:</strong> ${data.percentage.toFixed(1)}%
</div>
`;

    // Afficher et positionner l'infobulle
    d3.select('.correlation-tooltip')
        .html(tooltipContent)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 0.9);
}

/**
* Cache l'infobulle de corrélation
*/
function hideCorrelationTooltip() {
    d3.select('.correlation-tooltip')
        .transition()
        .duration(500)
        .style('opacity', 0);
}

/**
* Obtient le libellé de la période
* 
* @param {string} period La période
* @param {string} periodType Le type de période
* @returns {string} Le libellé formaté
*/
function getPeriodLabel(period, periodType) {
    if (periodType === 'day') {
        const dayLabels = {
            'jour': 'Journée (8h-16h)',
            'soir': 'Soir (16h-00h)',
            'nuit': 'Nuit (00h-8h)'
        };

        return dayLabels[period] || period;
    }
    else if (periodType === 'month') {
        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        const monthIndex = parseInt(period) - 1;
        return monthNames[monthIndex];
    }

    // Par défaut, retourner la période telle quelle
    return period;
}

/**
* Obtient le libellé du type de période
* 
* @param {string} periodType Le type de période
* @returns {string} Le libellé formaté
*/
function getPeriodTypeLabel(periodType) {
    switch (periodType) {
        case 'day':
            return 'Moment de la journée';
        case 'month':
            return 'Mois de l\'année';
        case 'weekday':
            return 'Jour de la semaine';
        default:
            return 'Période';
    }
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