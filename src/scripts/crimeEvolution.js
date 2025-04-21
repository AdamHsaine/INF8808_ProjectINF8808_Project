/**
 * Module pour analyser l'évolution des différents types de crimes sur plusieurs années
 * Répond à la question: "Quelle est l'évolution des différents types de crimes sur plusieurs années?"
 */

/**
 * Crée une visualisation avancée de l'évolution des types de crimes
 * 
 * @param {Array} crimeData Les données des crimes
 * @param {Object} container Le conteneur où placer la visualisation
 */
export function createCrimeEvolutionAnalysis(crimeData, container) {
    // Créer un conteneur pour la visualisation
    const analysisDiv = document.createElement('div');
    analysisDiv.className = 'crime-evolution-container';
    analysisDiv.innerHTML = `
      <h2>Évolution des types de crimes au fil du temps</h2>
      <div class="analysis-description">
        <p>Cette analyse montre comment les différents types de crimes ont évolué sur la période étudiée, 
        permettant d'identifier les tendances à long terme et les changements significatifs.</p>
      </div>
      <div class="analysis-controls">
        <div class="control-group">
          <label for="evolution-view-type">Type de vue:</label>
          <select id="evolution-view-type">
            <option value="line">Graphique linéaire</option>
            <option value="stacked">Graphique empilé</option>
            <option value="percent">Graphique en pourcentage</option>
          </select>
        </div>
        <div class="control-group">
          <label for="evolution-highlight">Mettre en évidence:</label>
          <select id="evolution-highlight">
            <option value="none">Aucun</option>
            <option value="trend">Tendances</option>
            <option value="changes">Changements significatifs</option>
          </select>
        </div>
        <div class="control-group">
          <label for="evolution-aggregation">Agrégation:</label>
          <select id="evolution-aggregation">
            <option value="year">Annuelle</option>
            <option value="quarter">Trimestrielle</option>
            <option value="month">Mensuelle</option>
          </select>
        </div>
        <button id="apply-evolution-controls" class="apply-button">Appliquer</button>
      </div>
      <div class="evolution-chart-container">
        <svg id="evolution-chart" class="analysis-chart"></svg>
      </div>
      <div class="evolution-insights">
        <h3>Principaux enseignements</h3>
        <div class="insights-content"></div>
      </div>
      <div class="evolution-details">
        <h3>Détails par catégorie</h3>
        <div class="category-details"></div>
      </div>
    `;

    container.appendChild(analysisDiv);

    // Ajouter les styles pour la visualisation
    addEvolutionAnalysisStyles();

    // Gestionnaire d'événement pour les contrôles
    document.getElementById('apply-evolution-controls').addEventListener('click', function () {
        updateEvolutionAnalysis(crimeData);
    });

    // Initialiser la visualisation
    updateEvolutionAnalysis(crimeData);
}

/**
 * Ajoute les styles CSS pour l'analyse de l'évolution des crimes
 */
function addEvolutionAnalysisStyles() {
    // Vérifier si les styles existent déjà
    if (document.getElementById('crime-evolution-styles')) return;

    const style = document.createElement('style');
    style.id = 'crime-evolution-styles';
    style.textContent = `
      .crime-evolution-container {
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
      
      .crime-evolution-container h2 {
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
      
      .evolution-chart-container {
        display: flex;
        justify-content: center;
        margin-bottom: 30px;
        height: 400px;
      }
      
      .analysis-chart {
        width: 100%;
        max-width: 1000px;
        height: 100%;
      }
      
      .evolution-insights {
        margin-bottom: 30px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 8px;
        border-left: 4px solid #FB8C00;
      }
      
      .evolution-insights h3 {
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
      
      .evolution-details {
        margin-bottom: 20px;
      }
      
      .evolution-details h3 {
        color: #333;
        font-size: 18px;
        margin-bottom: 15px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
      }
      
      .category-details {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        justify-content: center;
      }
      
      .category-card {
        width: 30%;
        min-width: 250px;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
      
      .category-card h4 {
        margin-top: 0;
        color: #FB8C00;
        font-size: 16px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
      }
      
      .category-icon {
        width: 20px;
        height: 20px;
        margin-right: 8px;
        background-color: #FB8C00;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }
      
      .category-stats {
        margin-bottom: 10px;
      }
      
      .stat-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      
      .category-trend {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #ddd;
        font-size: 14px;
      }
      
      .trend-badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        margin-left: 5px;
        color: white;
      }
      
      .trend-up {
        background-color: #c5221f;
      }
      
      .trend-down {
        background-color: #137333;
      }
      
      .trend-stable {
        background-color: #9AA0A6;
      }
      
      .axis path,
      .axis line {
        stroke: #E5E5E5;
      }
      
      .axis text {
        fill: #666;
        font-size: 12px;
      }
      
      .chart-line {
        fill: none;
        stroke-width: 2;
      }
      
      .chart-area {
        opacity: 0.7;
      }
      
      .chart-legend {
        font-size: 12px;
        max-width: 150px; /* Adjust based on your needs */
        word-wrap: break-word;
        line-height: 1.2;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        margin-right: 15px;
        cursor: pointer;
      }
      
      .legend-color {
        width: 12px;
        height: 12px;
        margin-right: 5px;
        border-radius: 2px;
      }
    `;

    document.head.appendChild(style);
}

/**
 * Met à jour l'analyse d'évolution des crimes en fonction des contrôles sélectionnés
 * 
 * @param {Array} crimeData Les données des crimes
 */
function updateEvolutionAnalysis(crimeData) {
    // Récupérer les valeurs des contrôles
    const viewType = document.getElementById('evolution-view-type').value;
    const highlightType = document.getElementById('evolution-highlight').value;
    const aggregationType = document.getElementById('evolution-aggregation').value;

    // Traiter les données pour l'analyse
    const processedData = processDataForEvolutionAnalysis(crimeData, aggregationType);

    // Créer le graphique approprié selon le type de vue
    if (viewType === 'line') {
        createLineChart(processedData, highlightType);
    } else if (viewType === 'stacked') {
        createStackedAreaChart(processedData, highlightType);
    } else if (viewType === 'percent') {
        createPercentStackedAreaChart(processedData, highlightType);
    }

    // Générer les insights basés sur les données
    generateEvolutionInsights(processedData, highlightType);

    // Afficher les détails par catégorie
    displayCategoryDetails(processedData);
}

/**
 * Traite les données pour l'analyse d'évolution
 * 
 * @param {Array} crimeData Les données brutes des crimes
 * @param {string} aggregationType Le type d'agrégation temporelle
 * @returns {Object} Les données traitées pour l'analyse
 */
function processDataForEvolutionAnalysis(crimeData, aggregationType) {
    // Extraire et filtrer les données avec une date valide
    const validData = crimeData.filter(crime => crime.DATE && crime.CATEGORIE);

    // Extraire les catégories uniques
    const categories = [...new Set(validData.map(d => d.CATEGORIE))];

    // Fonction pour obtenir la clé temporelle selon le type d'agrégation
    function getTimeKey(date) {
        const d = new Date(date);

        if (aggregationType === 'year') {
            return d.getFullYear().toString();
        }
        else if (aggregationType === 'quarter') {
            const quarter = Math.floor(d.getMonth() / 3) + 1;
            return `${d.getFullYear()}-Q${quarter}`;
        }
        else if (aggregationType === 'month') {
            const month = d.getMonth() + 1;
            return `${d.getFullYear()}-${month.toString().padStart(2, '0')}`;
        }
    }

    // Agréger les données par période et catégorie
    const aggregatedData = {};
    const timeKeys = new Set();

    validData.forEach(crime => {
        const timeKey = getTimeKey(crime.DATE);
        const category = crime.CATEGORIE;

        timeKeys.add(timeKey);

        if (!aggregatedData[timeKey]) {
            aggregatedData[timeKey] = {};
            categories.forEach(cat => {
                aggregatedData[timeKey][cat] = 0;
            });
        }

        aggregatedData[timeKey][category]++;
    });

    // Convertir en format pour le graphique
    const sortedTimeKeys = Array.from(timeKeys).sort();

    // Séries temporelles pour chaque catégorie
    const series = categories.map(category => {
        return {
            category: category,
            values: sortedTimeKeys.map(timeKey => {
                return {
                    time: timeKey,
                    value: aggregatedData[timeKey][category] || 0
                };
            })
        };
    });

    // Calculer les tendances pour chaque catégorie
    const trends = {};

    categories.forEach(category => {
        const catSeries = series.find(s => s.category === category);

        if (catSeries && catSeries.values.length >= 2) {
            const firstValue = catSeries.values[0].value;
            const lastValue = catSeries.values[catSeries.values.length - 1].value;

            // Calculer la variation en pourcentage
            let percentChange = 0;
            if (firstValue > 0) {
                percentChange = ((lastValue - firstValue) / firstValue) * 100;
            }

            // Calculer la tendance avec régression linéaire
            const coordinates = catSeries.values.map((d, i) => [i, d.value]);
            const linearRegression = calculateLinearRegression(coordinates);

            // Classifier la tendance
            let trend = 'stable';

            if (Math.abs(percentChange) < 5 || Math.abs(linearRegression.slope) < 0.5) {
                trend = 'stable';
            } else if (linearRegression.slope > 0) {
                trend = 'increasing';
            } else {
                trend = 'decreasing';
            }

            trends[category] = {
                firstValue,
                lastValue,
                absoluteChange: lastValue - firstValue,
                percentChange,
                linearRegression,
                trend
            };
        }
    });

    // Calculer les changements significatifs (points d'inflexion)
    const significantChanges = {};

    categories.forEach(category => {
        const catSeries = series.find(s => s.category === category);

        if (catSeries && catSeries.values.length >= 3) {
            const changes = [];

            // Détecter les changements significatifs dans la série
            for (let i = 1; i < catSeries.values.length - 1; i++) {
                const prevValue = catSeries.values[i - 1].value;
                const currValue = catSeries.values[i].value;
                const nextValue = catSeries.values[i + 1].value;

                // Calculer la variation par rapport à la tendance
                const prevDiff = currValue - prevValue;
                const nextDiff = nextValue - currValue;

                // Si le signe de la différence change, c'est un point d'inflexion
                if ((prevDiff * nextDiff < 0) && (Math.abs(prevDiff) > prevValue * 0.1 || Math.abs(nextDiff) > currValue * 0.1)) {
                    changes.push({
                        time: catSeries.values[i].time,
                        value: currValue,
                        changeType: prevDiff > 0 ? 'peak' : 'valley'
                    });
                }
            }

            significantChanges[category] = changes;
        }
    });

    return {
        timeKeys: sortedTimeKeys,
        categories,
        series,
        trends,
        significantChanges
    };
}

/**
 * Calcule la régression linéaire pour un ensemble de points
 * 
 * @param {Array} points Les points sous forme de paires [x, y]
 * @returns {Object} Les paramètres de la régression linéaire
 */
function calculateLinearRegression(points) {
    const n = points.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    points.forEach(point => {
        const [x, y] = point;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

/**
 * Crée un graphique linéaire pour l'évolution des crimes
 * 
 * @param {Object} data Les données traitées
 * @param {string} highlightType Le type de mise en évidence
 */
function createLineChart(data, highlightType) {
    // Vider le conteneur du graphique
    const chartContainer = document.getElementById('evolution-chart');
    chartContainer.innerHTML = '';

    // Définir les dimensions du graphique
    const margin = { top: 30, right: 100, bottom: 50, left: 60 };
    const width = chartContainer.clientWidth - margin.left - margin.right;
    const height = chartContainer.clientHeight - margin.top - margin.bottom;

    // Créer le conteneur SVG
    const svg = d3.select(chartContainer)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Échelle pour l'axe X
    const x = d3.scaleBand()
        .domain(data.timeKeys)
        .range([0, width])
        .padding(0.1);

    // Déterminer la valeur maximale pour l'axe Y
    const yMax = d3.max(data.series, serie => d3.max(serie.values, d => d.value));

    // Échelle pour l'axe Y
    const y = d3.scaleLinear()
        .domain([0, yMax * 1.1]) // Ajouter 10% d'espace en haut
        .nice()
        .range([height, 0]);

    // Échelle de couleur pour les catégories
    const color = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(data.categories);

    // Créer les axes
    const xAxis = d3.axisBottom(x)
        .tickSize(-height)
        .tickPadding(10);

    // Adapter le nombre de ticks en fonction du nombre de périodes
    if (data.timeKeys.length > 10) {
        xAxis.tickValues(data.timeKeys.filter((d, i) => i % Math.ceil(data.timeKeys.length / 10) === 0));
    }

    const yAxis = d3.axisLeft(y)
        .tickSize(-width)
        .tickPadding(10)
        .tickFormat(d => d3.format(',')(d));

    // Dessiner les axes
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // Dessiner les lignes pour chaque catégorie
    const line = d3.line()
        .x(d => x(d.time) + x.bandwidth() / 2)
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    // Créer la légende
    const legend = svg.append('g')
        .attr('class', 'chart-legend')
        .attr('transform', `translate(${width + 10}, 0)`);

    // Ajouter les éléments de légende pour chaque catégorie
    data.categories.forEach((category, i) => {
        const legendRow = legend.append('g')
            .attr('class', 'legend-item')
            .attr('transform', `translate(0, ${i * 20})`)
            .on('mouseover', function () {
                // Mettre en évidence la ligne correspondante
                highlightLine(category);
            })
            .on('mouseout', function () {
                // Restaurer toutes les lignes
                resetHighlight();
            });

        legendRow.append('rect')
            .attr('class', 'legend-color')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', color(category));

        legendRow.append('text')
            .attr('x', 15)
            .attr('y', 9)
            .text(formatCategoryName(category));
    });

    // Dessiner les lignes
    data.series.forEach(serie => {
        if (serie.values.some(v => v.value > 0)) {
            svg.append('path')
                .datum(serie.values)
                .attr('class', `chart-line line-${serie.category.replace(/\s+/g, '-')}`)
                .attr('d', line)
                .attr('stroke', color(serie.category))
                .attr('stroke-width', 2)
                .attr('fill', 'none');

            // Ajouter les points sur la ligne
            svg.selectAll(`.point-${serie.category.replace(/\s+/g, '-')}`)
                .data(serie.values)
                .enter()
                .append('circle')
                .attr('class', `point-${serie.category.replace(/\s+/g, '-')}`)
                .attr('cx', d => x(d.time) + x.bandwidth() / 2)
                .attr('cy', d => y(d.value))
                .attr('r', 4)
                .attr('fill', color(serie.category))
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
        }
    });

    // Ajouter les mises en évidence selon le type sélectionné
    if (highlightType === 'trend') {
        highlightTrends(svg, data, x, y, color);
    } else if (highlightType === 'changes') {
        highlightSignificantChanges(svg, data, x, y, color);
    }

    // Fonction pour mettre en évidence une ligne
    function highlightLine(category) {
        // Réduire l'opacité de toutes les lignes
        svg.selectAll('.chart-line')
            .attr('opacity', 0.3);

        // Mettre en évidence la ligne sélectionnée
        svg.select(`.line-${category.replace(/\s+/g, '-')}`)
            .attr('opacity', 1)
            .attr('stroke-width', 3);

        // Réduire l'opacité de tous les points
        svg.selectAll('circle')
            .attr('opacity', 0.3);

        // Mettre en évidence les points de la catégorie
        svg.selectAll(`.point-${category.replace(/\s+/g, '-')}`)
            .attr('opacity', 1)
            .attr('r', 5);
    }

    // Fonction pour réinitialiser la mise en évidence
    function resetHighlight() {
        svg.selectAll('.chart-line')
            .attr('opacity', 1)
            .attr('stroke-width', 2);

        svg.selectAll('circle')
            .attr('opacity', 1)
            .attr('r', 4);
    }
}

/**
 * Met en évidence les tendances dans le graphique
 * 
 * @param {Object} svg Le groupe SVG du graphique
 * @param {Object} data Les données traitées
 * @param {Function} x L'échelle X
 * @param {Function} y L'échelle Y
 * @param {Function} color L'échelle de couleur
 */
function highlightTrends(svg, data, x, y, color) {
    // Pour chaque catégorie avec une tendance
    Object.entries(data.trends).forEach(([category, trendInfo]) => {
        const serie = data.series.find(s => s.category === category);
        if (!serie) return;

        // Ne montrer que les tendances significatives
        if (Math.abs(trendInfo.percentChange) < 5) return;

        // Récupérer les points de début et de fin
        const firstPoint = serie.values[0];
        const lastPoint = serie.values[serie.values.length - 1];

        // Tracer une ligne de tendance
        svg.append('line')
            .attr('class', 'trend-line')
            .attr('x1', x(firstPoint.time) + x.bandwidth() / 2)
            .attr('y1', y(firstPoint.value))
            .attr('x2', x(lastPoint.time) + x.bandwidth() / 2)
            .attr('y2', y(lastPoint.value))
            .attr('stroke', trendInfo.trend === 'increasing' ? '#c5221f' : '#137333')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.7);

        // Ajouter une flèche à la fin
        const arrowSize = 5;
        const angle = Math.atan2(
            y(firstPoint.value) - y(lastPoint.value),
            x(lastPoint.time) - x(firstPoint.time) + x.bandwidth() / 2
        );

        svg.append('path')
            .attr('d', `M ${x(lastPoint.time) + x.bandwidth() / 2} ${y(lastPoint.value)} ` +
                `L ${x(lastPoint.time) + x.bandwidth() / 2 - arrowSize * Math.cos(angle - Math.PI / 6)} ` +
                `${y(lastPoint.value) - arrowSize * Math.sin(angle - Math.PI / 6)} ` +
                `L ${x(lastPoint.time) + x.bandwidth() / 2 - arrowSize * Math.cos(angle + Math.PI / 6)} ` +
                `${y(lastPoint.value) - arrowSize * Math.sin(angle + Math.PI / 6)} Z`)
            .attr('fill', trendInfo.trend === 'increasing' ? '#c5221f' : '#137333');

        // Ajouter une étiquette avec le pourcentage de changement
        const percentText = trendInfo.percentChange.toFixed(1) + '%';
        const labelPosX = x(lastPoint.time) + x.bandwidth() / 2 + 5;
        const labelPosY = y(lastPoint.value);

        svg.append('text')
            .attr('class', 'trend-label')
            .attr('x', labelPosX)
            .attr('y', labelPosY)
            .attr('fill', trendInfo.trend === 'increasing' ? '#c5221f' : '#137333')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text(percentText);
    });
}

/**
 * Met en évidence les changements significatifs dans le graphique
 * 
 * @param {Object} svg Le groupe SVG du graphique
 * @param {Object} data Les données traitées
 * @param {Function} x L'échelle X
 * @param {Function} y L'échelle Y
 * @param {Function} color L'échelle de couleur
 */
function highlightSignificantChanges(svg, data, x, y, color) {
    // Pour chaque catégorie avec des changements significatifs
    Object.entries(data.significantChanges).forEach(([category, changes]) => {
        if (changes.length === 0) return;

        // Dessiner un cercle pour chaque changement significatif
        changes.forEach(change => {
            svg.append('circle')
                .attr('class', 'significant-change')
                .attr('cx', x(change.time) + x.bandwidth() / 2)
                .attr('cy', y(change.value))
                .attr('r', 8)
                .attr('fill', 'none')
                .attr('stroke', change.changeType === 'peak' ? '#c5221f' : '#137333')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '2,2');

            // Ajouter une flèche pour indiquer la direction
            if (change.changeType === 'peak') {
                // Flèche vers le bas pour un pic
                svg.append('path')
                    .attr('d', `M ${x(change.time) + x.bandwidth() / 2} ${y(change.value) - 15} ` +
                        `L ${x(change.time) + x.bandwidth() / 2} ${y(change.value) + 15} ` +
                        `M ${x(change.time) + x.bandwidth() / 2 - 5} ${y(change.value) + 10} ` +
                        `L ${x(change.time) + x.bandwidth() / 2} ${y(change.value) + 15} ` +
                        `L ${x(change.time) + x.bandwidth() / 2 + 5} ${y(change.value) + 10}`)
                    .attr('stroke', '#c5221f')
                    .attr('stroke-width', 1.5)
                    .attr('fill', 'none');
            } else {
                // Flèche vers le haut pour un creux
                svg.append('path')
                    .attr('d', `M ${x(change.time) + x.bandwidth() / 2} ${y(change.value) + 15} ` +
                        `L ${x(change.time) + x.bandwidth() / 2} ${y(change.value) - 15} ` +
                        `M ${x(change.time) + x.bandwidth() / 2 - 5} ${y(change.value) - 10} ` +
                        `L ${x(change.time) + x.bandwidth() / 2} ${y(change.value) - 15} ` +
                        `L ${x(change.time) + x.bandwidth() / 2 + 5} ${y(change.value) - 10}`)
                    .attr('stroke', '#137333')
                    .attr('stroke-width', 1.5)
                    .attr('fill', 'none');
            }
        });
    });
}

/**
 * Crée un graphique en aires empilées pour l'évolution des crimes
 * 
 * @param {Object} data Les données traitées
 * @param {string} highlightType Le type de mise en évidence
 */
function createStackedAreaChart(data, highlightType) {
    // Vider le conteneur du graphique
    const chartContainer = document.getElementById('evolution-chart');
    chartContainer.innerHTML = '';

    // Définir les dimensions du graphique
    const margin = { top: 30, right: 100, bottom: 50, left: 60 };
    const width = chartContainer.clientWidth - margin.left - margin.right;
    const height = chartContainer.clientHeight - margin.top - margin.bottom;

    // Créer le conteneur SVG
    const svg = d3.select(chartContainer)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Préparer les données pour le graphique empilé
    const stackData = {};

    // Initialiser la structure
    data.timeKeys.forEach(timeKey => {
        stackData[timeKey] = { time: timeKey };
        data.categories.forEach(category => {
            stackData[timeKey][category] = 0;
        });
    });

    // Remplir avec les valeurs
    data.series.forEach(serie => {
        serie.values.forEach(value => {
            stackData[value.time][serie.category] = value.value;
        });
    });

    // Convertir en tableau
    const stackedData = Object.values(stackData);

    // Créer la pile
    const stack = d3.stack()
        .keys(data.categories)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const layers = stack(stackedData);

    // Échelle pour l'axe X
    const x = d3.scaleBand()
        .domain(data.timeKeys)
        .range([0, width])
        .padding(0.1);

    // Échelle pour l'axe Y
    const y = d3.scaleLinear()
        .domain([0, d3.max(layers, layer => d3.max(layer, d => d[1]))])
        .nice()
        .range([height, 0]);

    // Échelle de couleur pour les catégories
    const color = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(data.categories);

    // Créer les axes
    const xAxis = d3.axisBottom(x)
        .tickSize(-height)
        .tickPadding(10);

    // Adapter le nombre de ticks en fonction du nombre de périodes
    if (data.timeKeys.length > 10) {
        xAxis.tickValues(data.timeKeys.filter((d, i) => i % Math.ceil(data.timeKeys.length / 10) === 0));
    }

    const yAxis = d3.axisLeft(y)
        .tickSize(-width)
        .tickPadding(10)
        .tickFormat(d => d3.format(',')(d));

    // Dessiner les axes
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // Créer le générateur d'aires
    const area = d3.area()
        .x((d, i) => x(data.timeKeys[i]) + x.bandwidth() / 2)
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveMonotoneX);

    // Dessiner les aires empilées
    svg.selectAll('.layer')
        .data(layers)
        .enter()
        .append('path')
        .attr('class', d => `chart-area area-${d.key.replace(/\s+/g, '-')}`)
        .attr('d', area)
        .attr('fill', d => color(d.key))
        .attr('opacity', 0.8)
        .on('mouseover', function (event, d) {
            // Mettre en évidence la couche
            d3.select(this)
                .attr('opacity', 1)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1);

            // Créer une infobulle si elle n'existe pas
            if (!d3.select('.evolution-tooltip').size()) {
                d3.select('body').append('div')
                    .attr('class', 'evolution-tooltip')
                    .style('position', 'absolute')
                    .style('background-color', 'white')
                    .style('padding', '10px')
                    .style('border', '1px solid #ddd')
                    .style('border-radius', '5px')
                    .style('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)')
                    .style('pointer-events', 'none')
                    .style('opacity', 0);
            }

            // Afficher l'infobulle
            const tooltip = d3.select('.evolution-tooltip');

            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);

            // Trouver la dernière valeur de la série pour l'infobulle
            const lastTimeKey = data.timeKeys[data.timeKeys.length - 1];
            const lastValue = stackedData.find(sd => sd.time === lastTimeKey)[d.key];
            const total = Object.values(stackedData.find(sd => sd.time === lastTimeKey))
                .filter(val => typeof val === 'number')
                .reduce((sum, val) => sum + val, 0);
            const percentage = (lastValue / total * 100).toFixed(1);

            tooltip.html(`
          <div style="font-weight: bold; margin-bottom: 5px; color: ${color(d.key)};">
            ${formatCategoryName(d.key)}
          </div>
          <div>
            Dernière valeur: ${lastValue} crimes<br>
            Pourcentage: ${percentage}%
          </div>
        `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
            // Restaurer l'apparence normale
            d3.select(this)
                .attr('opacity', 0.8)
                .attr('stroke', 'none');

            // Masquer l'infobulle
            d3.select('.evolution-tooltip').transition()
                .duration(500)
                .style('opacity', 0);
        });

    // Créer la légende
    const legend = svg.append('g')
        .attr('class', 'chart-legend')
        .attr('transform', `translate(${width + 10}, 0)`);

    // Ajouter les éléments de légende pour chaque catégorie
    data.categories.forEach((category, i) => {
        const legendRow = legend.append('g')
            .attr('class', 'legend-item')
            .attr('transform', `translate(0, ${i * 20})`)
            .on('mouseover', function () {
                // Mettre en évidence l'aire correspondante
                svg.select(`.area-${category.replace(/\s+/g, '-')}`)
                    .attr('opacity', 1)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1);
            })
            .on('mouseout', function () {
                // Restaurer l'apparence normale
                svg.select(`.area-${category.replace(/\s+/g, '-')}`)
                    .attr('opacity', 0.8)
                    .attr('stroke', 'none');
            });

        legendRow.append('rect')
            .attr('class', 'legend-color')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', color(category));

        legendRow.append('text')
            .attr('x', 15)
            .attr('y', 9)
            .text(formatCategoryName(category));
    });

    // Ajouter le titre du graphique
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Évolution des crimes au fil du temps par catégorie');
}

/**
 * Crée un graphique en aires empilées en pourcentage pour l'évolution des crimes
 * 
 * @param {Object} data Les données traitées
 * @param {string} highlightType Le type de mise en évidence
 */
function createPercentStackedAreaChart(data, highlightType) {
    // Vider le conteneur du graphique
    const chartContainer = document.getElementById('evolution-chart');
    chartContainer.innerHTML = '';

    // Définir les dimensions du graphique
    const margin = { top: 30, right: 100, bottom: 50, left: 60 };
    const width = chartContainer.clientWidth - margin.left - margin.right;
    const height = chartContainer.clientHeight - margin.top - margin.bottom;

    // Créer le conteneur SVG
    const svg = d3.select(chartContainer)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Préparer les données pour le graphique empilé
    const stackData = {};

    // Initialiser la structure
    data.timeKeys.forEach(timeKey => {
        stackData[timeKey] = { time: timeKey };
        data.categories.forEach(category => {
            stackData[timeKey][category] = 0;
        });
    });

    // Remplir avec les valeurs
    data.series.forEach(serie => {
        serie.values.forEach(value => {
            stackData[value.time][serie.category] = value.value;
        });
    });

    // Calculer les totaux pour chaque période
    Object.values(stackData).forEach(periodData => {
        let total = 0;
        data.categories.forEach(category => {
            total += periodData[category];
        });

        // Convertir les valeurs en pourcentages
        if (total > 0) {
            data.categories.forEach(category => {
                periodData[category] = (periodData[category] / total) * 100;
            });
        }
    });

    // Convertir en tableau
    const stackedData = Object.values(stackData);

    // Créer la pile
    const stack = d3.stack()
        .keys(data.categories)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const layers = stack(stackedData);

    // Échelle pour l'axe X
    const x = d3.scaleBand()
        .domain(data.timeKeys)
        .range([0, width])
        .padding(0.1);

    // Échelle pour l'axe Y (de 0 à 100%)
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    // Échelle de couleur pour les catégories
    const color = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(data.categories);

    // Créer les axes
    const xAxis = d3.axisBottom(x)
        .tickSize(-height)
        .tickPadding(10);

    // Adapter le nombre de ticks en fonction du nombre de périodes
    if (data.timeKeys.length > 10) {
        xAxis.tickValues(data.timeKeys.filter((d, i) => i % Math.ceil(data.timeKeys.length / 10) === 0));
    }

    const yAxis = d3.axisLeft(y)
        .tickSize(-width)
        .tickPadding(10)
        .tickFormat(d => d + '%');

    // Dessiner les axes
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // Créer le générateur d'aires
    const area = d3.area()
        .x((d, i) => x(data.timeKeys[i]) + x.bandwidth() / 2)
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveMonotoneX);

    // Dessiner les aires empilées
    svg.selectAll('.layer')
        .data(layers)
        .enter()
        .append('path')
        .attr('class', d => `chart-area area-${d.key.replace(/\s+/g, '-')}`)
        .attr('d', area)
        .attr('fill', d => color(d.key))
        .attr('opacity', 0.8);

    // Créer la légende
    const legend = svg.append('g')
        .attr('class', 'chart-legend')
        .attr('transform', `translate(${width + 10}, 0)`);

    // Ajouter les éléments de légende pour chaque catégorie
    data.categories.forEach((category, i) => {
        const legendRow = legend.append('g')
            .attr('class', 'legend-item')
            .attr('transform', `translate(0, ${i * 20})`)
            .on('mouseover', function () {
                // Mettre en évidence la couche correspondante
                svg.selectAll(`.area-${category.replace(/\s+/g, '-')}`)
                    .attr('opacity', 1)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1);
            })
            .on('mouseout', function () {
                // Restaurer l'apparence normale
                svg.selectAll(`.area-${category.replace(/\s+/g, '-')}`)
                    .attr('opacity', 0.8)
                    .attr('stroke', 'none');
            });

        legendRow.append('rect')
            .attr('class', 'legend-color')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', color(category));

        legendRow.append('text')
            .attr('x', 15)
            .attr('y', 9)
            .text(formatCategoryName(category));
    });

    // Ajouter un titre pour le graphique
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Distribution relative des types de crimes (%)');
}

/**
 * Génère des insights basés sur l'analyse des données
 * 
 * @param {Object} data Les données traitées
 * @param {string} highlightType Le type de mise en évidence
 */
function generateEvolutionInsights(data, highlightType) {
    const insightsContent = document.querySelector('.insights-content');

    // Analyser les tendances
    const increasingCategories = [];
    const decreasingCategories = [];
    const stableCategories = [];

    Object.entries(data.trends).forEach(([category, trendInfo]) => {
        // Seulement les catégories avec un nombre significatif de crimes
        if (trendInfo.lastValue < 10) return;

        if (trendInfo.trend === 'increasing' && trendInfo.percentChange > 10) {
            increasingCategories.push({
                category,
                percentChange: trendInfo.percentChange
            });
        } else if (trendInfo.trend === 'decreasing' && trendInfo.percentChange < -10) {
            decreasingCategories.push({
                category,
                percentChange: trendInfo.percentChange
            });
        } else {
            stableCategories.push({
                category,
                percentChange: trendInfo.percentChange
            });
        }
    });

    // Trier par importance du changement
    increasingCategories.sort((a, b) => b.percentChange - a.percentChange);
    decreasingCategories.sort((a, b) => a.percentChange - b.percentChange);

    // Analyser les changements importants
    const significantChanges = [];

    Object.entries(data.significantChanges).forEach(([category, changes]) => {
        changes.forEach(change => {
            significantChanges.push({
                category,
                time: change.time,
                changeType: change.changeType
            });
        });
    });

    // Générer le texte des insights
    let insightsHtml = '<ul>';

    // Tendance générale
    const totalAtStart = data.series.reduce((sum, serie) => sum + (serie.values[0]?.value || 0), 0);
    const totalAtEnd = data.series.reduce((sum, serie) => sum + (serie.values[serie.values.length - 1]?.value || 0), 0);

    const totalPercentChange = totalAtStart > 0 ? ((totalAtEnd - totalAtStart) / totalAtStart) * 100 : 0;

    if (Math.abs(totalPercentChange) < 5) {
        insightsHtml += `<li>Le nombre total de crimes est resté relativement stable sur la période (variation de ${totalPercentChange.toFixed(1)}%).</li>`;
    } else if (totalPercentChange > 0) {
        insightsHtml += `<li>Le nombre total de crimes a augmenté de ${totalPercentChange.toFixed(1)}% sur la période.</li>`;
    } else {
        insightsHtml += `<li>Le nombre total de crimes a diminué de ${Math.abs(totalPercentChange).toFixed(1)}% sur la période.</li>`;
    }

    // Types de crimes en augmentation
    if (increasingCategories.length > 0) {
        insightsHtml += '<li>Types de crimes en augmentation significative: ';
        insightsHtml += increasingCategories.slice(0, 3).map(cat =>
            `<strong>${formatCategoryName(cat.category)}</strong> (+${cat.percentChange.toFixed(1)}%)`
        ).join(', ');
        insightsHtml += '.</li>';
    }

    // Types de crimes en diminution
    if (decreasingCategories.length > 0) {
        insightsHtml += '<li>Types de crimes en diminution significative: ';
        insightsHtml += decreasingCategories.slice(0, 3).map(cat =>
            `<strong>${formatCategoryName(cat.category)}</strong> (${cat.percentChange.toFixed(1)}%)`
        ).join(', ');
        insightsHtml += '.</li>';
    }

    // Changements importants
    if (significantChanges.length > 0 && highlightType === 'changes') {
        insightsHtml += '<li>Changements importants observés: ';
        insightsHtml += significantChanges.slice(0, 3).map(change =>
            `<strong>${formatCategoryName(change.category)}</strong> (${change.changeType === 'peak' ? 'pic' : 'creux'} en ${change.time})`
        ).join(', ');
        insightsHtml += '.</li>';
    }

    // Catégorie dominante
    const mostCommonCategory = data.series
        .map(serie => ({
            category: serie.category,
            total: serie.values.reduce((sum, v) => sum + v.value, 0)
        }))
        .sort((a, b) => b.total - a.total)[0];

    insightsHtml += `<li>Le type de crime le plus fréquent est <strong>${formatCategoryName(mostCommonCategory.category)}</strong>, représentant une part importante de l'ensemble des crimes.</li>`;

    insightsHtml += '</ul>';

    // Mettre à jour le contenu des insights
    insightsContent.innerHTML = insightsHtml;
}

/**
 * Affiche les détails pour chaque catégorie de crime
 * 
 * @param {Object} data Les données traitées
 */
function displayCategoryDetails(data) {
    const categoryDetailsContainer = document.querySelector('.category-details');
    categoryDetailsContainer.innerHTML = '';

    // Trier les catégories par importance (total des crimes)
    const sortedCategories = data.series
        .map(serie => ({
            category: serie.category,
            total: serie.values.reduce((sum, v) => sum + v.value, 0)
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6); // Limiter aux 6 principales catégories

    // Créer une carte pour chaque catégorie
    sortedCategories.forEach((categoryData, index) => {
        const category = categoryData.category;
        const serie = data.series.find(s => s.category === category);
        const trend = data.trends[category];

        if (!serie || !trend) return;

        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';

        // Titre avec icône
        categoryCard.innerHTML = `
        <h4>
          <span class="category-icon">${index + 1}</span>
          ${formatCategoryName(category)}
        </h4>
        <div class="category-stats">
          <div class="stat-item">
            <span>Total</span>
            <span>${categoryData.total}</span>
          </div>
          <div class="stat-item">
            <span>Première période</span>
            <span>${trend.firstValue}</span>
          </div>
          <div class="stat-item">
            <span>Dernière période</span>
            <span>${trend.lastValue}</span>
          </div>
          <div class="stat-item">
            <span>Changement</span>
            <span>${trend.absoluteChange > 0 ? '+' : ''}${trend.absoluteChange}</span>
          </div>
        </div>
      `;

        // Ajouter la tendance
        let trendBadgeClass = 'trend-stable';
        let trendText = 'Stable';

        if (trend.percentChange > 10) {
            trendBadgeClass = 'trend-up';
            trendText = 'En hausse';
        } else if (trend.percentChange < -10) {
            trendBadgeClass = 'trend-down';
            trendText = 'En baisse';
        }

        const trendDiv = document.createElement('div');
        trendDiv.className = 'category-trend';
        trendDiv.innerHTML = `
        Tendance: <span class="trend-badge ${trendBadgeClass}">${trendText} ${Math.abs(trend.percentChange).toFixed(1)}%</span>
      `;

        categoryCard.appendChild(trendDiv);
        categoryDetailsContainer.appendChild(categoryCard);
    });
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