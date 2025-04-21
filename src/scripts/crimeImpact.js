/**
 * Module pour analyser l'impact des différents types de crimes sur la sécurité publique
 * Répond à la question: "Quels types de crimes ont l'impact le plus significatif sur la sécurité publique?"
 */

/**
 * Crée une visualisation d'analyse de l'impact des crimes sur la sécurité publique
 * 
 * @param {Array} crimeData Les données des crimes
 * @param {Object} container Le conteneur où placer la visualisation
 */
export function createCrimeImpactAnalysis(crimeData, container) {
    // Créer un conteneur pour la visualisation
    const analysisDiv = document.createElement('div');
    analysisDiv.className = 'crime-impact-container';
    analysisDiv.innerHTML = `
      <h2>Impact des types de crimes sur la sécurité publique</h2>
      <div class="analysis-description">
        <p>Cette analyse évalue l'impact des différents types de crimes sur la sécurité publique, 
        en tenant compte de leur fréquence, de leur gravité estimée et de leur répartition géographique.</p>
      </div>
      <div class="analysis-controls">
        <div class="control-group">
          <label for="impact-year">Année d'analyse:</label>
          <select id="impact-year">
            <option value="all">Toutes les années</option>
          </select>
        </div>
        <div class="control-group">
          <label for="impact-metric">Métrique d'évaluation:</label>
          <select id="impact-metric">
            <option value="weighted">Score d'impact pondéré</option>
            <option value="frequency">Fréquence seulement</option>
            <option value="distribution">Distribution géographique</option>
          </select>
        </div>
        <button id="apply-impact-controls" class="apply-button">Appliquer</button>
      </div>
      <div class="impact-chart-container">
        <svg id="impact-chart" class="analysis-chart"></svg>
      </div>
      <div class="impact-matrix-section">
        <h3>Matrice d'impact des crimes</h3>
        <div class="matrix-description">
          Cette matrice positionne les types de crimes selon leur fréquence (axe horizontal) 
          et leur gravité estimée (axe vertical).
        </div>
        <div class="impact-matrix-container">
          <svg id="impact-matrix" class="analysis-matrix"></svg>
        </div>
      </div>
      <div class="impact-insights">
        <h3>Principales conclusions</h3>
        <div class="insights-content"></div>
      </div>
      <div class="methodology-note">
        <h4>Note méthodologique</h4>
        <p>L'évaluation de l'impact sur la sécurité publique est basée sur une combinaison de facteurs:</p>
        <ul>
          <li><strong>Fréquence:</strong> Le nombre total d'occurrences d'un type de crime.</li>
          <li><strong>Gravité estimée:</strong> Une estimation de la gravité relative basée sur la catégorie du crime.</li>
          <li><strong>Distribution géographique:</strong> L'étendue de la répartition des crimes sur le territoire.</li>
        </ul>
        <p>Le score d'impact est calculé en combinant ces facteurs pour donner une vision globale de l'influence de chaque type de crime sur la sécurité publique.</p>
      </div>
    `;

    container.appendChild(analysisDiv);

    // Ajouter les styles pour la visualisation
    addImpactAnalysisStyles();

    // Remplir le sélecteur d'années
    populateYearSelector(crimeData);

    // Gestionnaire d'événement pour les contrôles
    document.getElementById('apply-impact-controls').addEventListener('click', function () {
        updateImpactAnalysis(crimeData);
    });

    // Initialiser la visualisation
    updateImpactAnalysis(crimeData);
}

/**
 * Ajoute les styles CSS pour l'analyse d'impact
 */
function addImpactAnalysisStyles() {
    // Vérifier si les styles existent déjà
    if (document.getElementById('crime-impact-styles')) return;

    const style = document.createElement('style');
    style.id = 'crime-impact-styles';
    style.textContent = `
      .crime-impact-container {
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
      
      .crime-impact-container h2 {
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
      
      .impact-chart-container {
        display: flex;
        justify-content: center;
        margin-bottom: 30px;
        height: 400px;
      }
      
      .analysis-chart {
        width: 100%;
        max-width: 900px;
        height: 100%;
      }
      
      .impact-matrix-section {
        margin-bottom: 30px;
      }
      
      .impact-matrix-section h3 {
        text-align: center;
        color: #333;
        margin-bottom: 10px;
      }
      
      .matrix-description {
        text-align: center;
        color: #666;
        margin-bottom: 20px;
        font-size: 14px;
      }
      
      .impact-matrix-container {
        display: flex;
        justify-content: center;
        height: 500px;
        margin-bottom: 20px;
      }
      
      .analysis-matrix {
        width: 100%;
        max-width: 900px;
        height: 100%;
      }
      
      .impact-insights {
        margin-bottom: 30px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 8px;
        border-left: 4px solid #FB8C00;
      }
      
      .impact-insights h3 {
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
      
      .methodology-note {
        background-color: #f5f5f5;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      
      .methodology-note h4 {
        margin-top: 0;
        color: #333;
        font-size: 16px;
        margin-bottom: 10px;
      }
      
      .methodology-note p, .methodology-note ul {
        margin-bottom: 10px;
        font-size: 14px;
        color: #555;
      }
      
      .methodology-note ul {
        padding-left: 20px;
      }
      
      .methodology-note li {
        margin-bottom: 5px;
      }
      
      .bar-label {
        font-size: 12px;
        fill: #333;
      }
      
      .impact-tooltip {
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
      
      .quadrant-label {
        font-size: 14px;
        font-weight: bold;
        fill: #555;
        text-anchor: middle;
      }
      
      .matrix-bubble {
        stroke: #fff;
        stroke-width: 1.5;
      }
      
      .matrix-bubble:hover {
        stroke-width: 2.5;
      }
      
      .matrix-axes-labels text {
        font-size: 12px;
        fill: #666;
      }
      
      .matrix-legend {
        font-size: 11px;
      }
    `;

    document.head.appendChild(style);
}

/**
 * Remplit le sélecteur d'années avec les années disponibles dans les données
 * 
 * @param {Array} crimeData Les données des crimes
 */
function populateYearSelector(crimeData) {
    // Extraire les années uniques
    const years = [...new Set(crimeData
        .map(d => d.DATE ? new Date(d.DATE).getFullYear() : null)
        .filter(y => y !== null))].sort();

    // Sélectionner le dropdown
    const yearSelect = document.getElementById('impact-year');

    // Ajouter chaque année comme option
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

/**
 * Met à jour l'analyse d'impact en fonction des contrôles sélectionnés
 * 
 * @param {Array} crimeData Les données des crimes
 */
function updateImpactAnalysis(crimeData) {
    // Récupérer les valeurs des contrôles
    const selectedYear = document.getElementById('impact-year').value;
    const metricType = document.getElementById('impact-metric').value;

    // Traiter les données pour l'analyse
    const processedData = processDataForImpactAnalysis(crimeData, selectedYear, metricType);

    // Créer le graphique à barres d'impact
    createImpactBarChart(processedData, metricType);

    // Créer la matrice d'impact
    createImpactMatrix(processedData);

    // Générer les insights basés sur les données
    generateImpactInsights(processedData, metricType);
}

/**
 * Traite les données pour l'analyse d'impact
 * 
 * @param {Array} crimeData Les données brutes des crimes
 * @param {string} selectedYear L'année sélectionnée (ou 'all' pour toutes)
 * @param {string} metricType Le type de métrique d'évaluation
 * @returns {Object} Les données traitées pour l'analyse
 */
function processDataForImpactAnalysis(crimeData, selectedYear, metricType) {
    // Filtrer par année si une année spécifique est sélectionnée
    const filteredData = selectedYear === 'all' ? crimeData : crimeData.filter(crime => {
        if (!crime.DATE) return false;
        const year = new Date(crime.DATE).getFullYear();
        return year.toString() === selectedYear;
    });

    // Extraire les catégories uniques
    const categories = [...new Set(filteredData.map(d => d.CATEGORIE).filter(c => c))];

    // Extraire les PDQ uniques
    const pdqs = [...new Set(filteredData.map(d => d.PDQ).filter(p => p))];

    // Définir des poids de gravité pour les types de crimes (estimation)
    // Note: dans un système réel, ces poids seraient déterminés par des experts
    const severityWeights = {};
    categories.forEach(category => {
        // Attribuer des poids basés sur le nom de la catégorie (estimation simplifiée)
        // Dans une application réelle, ces poids seraient définis plus rigoureusement
        if (category.toLowerCase().includes('vol') && category.toLowerCase().includes('arm')) {
            severityWeights[category] = 0.9; // Vol avec arme a une gravité élevée
        } else if (category.toLowerCase().includes('violence')) {
            severityWeights[category] = 0.8; // Crimes violents ont une gravité élevée
        } else if (category.toLowerCase().includes('vol')) {
            severityWeights[category] = 0.6; // Vol simple a une gravité moyenne
        } else if (category.toLowerCase().includes('drogue')) {
            severityWeights[category] = 0.5; // Crimes liés à la drogue ont une gravité moyenne
        } else {
            // Par défaut, attribuer une gravité moyenne-basse
            severityWeights[category] = 0.4;
        }
    });

    // Agréger les données par catégorie et PDQ
    const countsByCategory = {};
    const countsByCategoryAndPDQ = {};

    categories.forEach(category => {
        countsByCategory[category] = 0;
        countsByCategoryAndPDQ[category] = {};

        pdqs.forEach(pdq => {
            countsByCategoryAndPDQ[category][pdq] = 0;
        });
    });

    // Compter les occurrences
    filteredData.forEach(crime => {
        if (crime.CATEGORIE && crime.PDQ) {
            const category = crime.CATEGORIE;
            const pdq = crime.PDQ;

            countsByCategory[category]++;

            if (countsByCategoryAndPDQ[category] && countsByCategoryAndPDQ[category][pdq] !== undefined) {
                countsByCategoryAndPDQ[category][pdq]++;
            }
        }
    });

    // Calculer les scores d'impact pour chaque catégorie
    const impactScores = {};

    categories.forEach(category => {
        // Fréquence: nombre total d'occurrences normalisé
        const frequency = countsByCategory[category];
        const normalizedFrequency = frequency / filteredData.length;

        // Distribution géographique: nombre de PDQ où cette catégorie est présente
        const pdqCoverage = Object.values(countsByCategoryAndPDQ[category]).filter(count => count > 0).length;
        const geographicSpread = pdqCoverage / pdqs.length;

        // Gravité estimée (basée sur les poids définis plus haut)
        const severity = severityWeights[category];

        // Score d'impact pondéré
        let impactScore;

        if (metricType === 'frequency') {
            // Utiliser uniquement la fréquence
            impactScore = normalizedFrequency;
        } else if (metricType === 'distribution') {
            // Utiliser uniquement la distribution géographique
            impactScore = geographicSpread;
        } else {
            // Score pondéré: combinaison de fréquence, gravité et distribution
            impactScore = (0.4 * normalizedFrequency) + (0.4 * severity) + (0.2 * geographicSpread);
        }

        impactScores[category] = {
            category,
            frequency,
            normalizedFrequency,
            geographicSpread,
            severity,
            impactScore,
            pdqDistribution: countsByCategoryAndPDQ[category]
        };
    });

    // Convertir en tableau et trier par score d'impact
    const sortedImpactScores = Object.values(impactScores)
        .sort((a, b) => b.impactScore - a.impactScore);

    return {
        categories,
        pdqs,
        impactScores: sortedImpactScores,
        totalCrimes: filteredData.length,
        selectedYear
    };
}

/**
 * Crée un graphique à barres des scores d'impact
 * 
 * @param {Object} data Les données traitées
 * @param {string} metricType Le type de métrique d'évaluation
 */
function createImpactBarChart(data, metricType) {
    // Sélectionner et vider le SVG
    const svg = d3.select('#impact-chart');
    svg.selectAll('*').remove();

    // Dimensions
    const margin = { top: 30, right: 150, bottom: 70, left: 200 };
    const width = svg.node().clientWidth - margin.left - margin.right;
    const height = svg.node().clientHeight - margin.top - margin.bottom;

    // Groupe principal avec marge
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Préparer les données pour le graphique (prendre les 10 premières catégories)
    const chartData = data.impactScores.slice(0, 10);

    // Échelles
    const y = d3.scaleBand()
        .domain(chartData.map(d => d.category))
        .range([0, height])
        .padding(0.2);

    const x = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.impactScore) * 1.1])
        .range([0, width]);

    // Couleurs selon le score d'impact
    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(chartData, d => d.impactScore)])
        .interpolator(d3.interpolateOranges);

    // Barres horizontales
    g.selectAll('.impact-bar')
        .data(chartData)
        .enter().append('rect')
        .attr('class', 'impact-bar')
        .attr('y', d => y(d.category))
        .attr('height', y.bandwidth())
        .attr('x', 0)
        .attr('width', 0) // Commencer à 0 pour l'animation
        .attr('fill', d => colorScale(d.impactScore))
        .attr('rx', 3) // Coins arrondis
        .attr('ry', 3)
        .on('mouseover', function (event, d) {
            // Mettre en évidence la barre
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 0.8);

            // Afficher une infobulle
            displayImpactTooltip(event, d, metricType);
        })
        .on('mouseout', function () {
            // Restaurer l'opacité normale
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 1);

            // Masquer l'infobulle
            hideImpactTooltip();
        })
        .transition() // Animer l'apparition des barres
        .duration(800)
        .attr('width', d => x(d.impactScore));

    // Étiquettes à droite des barres
    g.selectAll('.bar-value')
        .data(chartData)
        .enter().append('text')
        .attr('class', 'bar-value')
        .attr('y', d => y(d.category) + y.bandwidth() / 2)
        .attr('x', d => x(d.impactScore) + 5)
        .attr('dy', '0.35em')
        .attr('fill', '#333')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(d => d.impactScore.toFixed(2));

    // Étiquettes des barres (noms des catégories)
    g.selectAll('.bar-label')
        .data(chartData)
        .enter().append('text')
        .attr('class', 'bar-label')
        .attr('y', d => y(d.category) + y.bandwidth() / 2)
        .attr('x', -5)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .style('font-size', '12px')
        .text(d => formatCategoryName(d.category));

    // Axe X
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll('text')
        .style('text-anchor', 'middle');

    // Titre de l'axe X
    g.append('text')
        .attr('class', 'axis-title')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(getMetricTitle(metricType));

    // Légende d'impact
    const legendGroup = g.append('g')
        .attr('class', 'impact-legend')
        .attr('transform', `translate(${width + 20}, 0)`);

    legendGroup.append('text')
        .attr('x', 0)
        .attr('y', 15)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Composantes du score:');

    // Légende pour chaque composante
    const components = [
        { name: 'Fréquence', color: '#FFA726' },
        { name: 'Gravité', color: '#EF6C00' },
        { name: 'Distribution', color: '#E65100' }
    ];

    components.forEach((component, i) => {
        const legendItem = legendGroup.append('g')
            .attr('transform', `translate(0, ${40 + i * 25})`);

        legendItem.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', component.color);

        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .style('font-size', '12px')
            .text(component.name);
    });

    // Titre du graphique
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', margin.left + width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`Impact sur la sécurité publique ${data.selectedYear !== 'all' ? `(${data.selectedYear})` : ''}`);
}

/**
 * Crée une matrice d'impact pour visualiser fréquence vs gravité
 * 
 * @param {Object} data Les données traitées
 */
function createImpactMatrix(data) {
    // Sélectionner et vider le SVG
    const svg = d3.select('#impact-matrix');
    svg.selectAll('*').remove();

    // Dimensions
    const margin = { top: 50, right: 30, bottom: 60, left: 70 };
    const width = svg.node().clientWidth - margin.left - margin.right;
    const height = svg.node().clientHeight - margin.top - margin.bottom;

    // Groupe principal avec marge
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Échelles
    const x = d3.scaleLinear()
        .domain([0, d3.max(data.impactScores, d => d.normalizedFrequency) * 1.1])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, 1]) // Gravité est entre 0 et 1
        .range([height, 0]);

    // Échelle pour la taille des bulles (basée sur la distribution géographique)
    const size = d3.scaleLinear()
        .domain([0, d3.max(data.impactScores, d => d.geographicSpread)])
        .range([5, 25]);

    // Échelle de couleur pour les bulles (basée sur le score d'impact)
    const color = d3.scaleSequential()
        .domain([0, d3.max(data.impactScores, d => d.impactScore)])
        .interpolator(d3.interpolateOranges);

    // Ajouter une grille de fond
    g.append('g')
        .attr('class', 'grid-lines')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    g.append('g')
        .attr('class', 'grid-lines')
        .attr('transform', `translate(0, ${height})`)
        .attr('opacity', 0.1)
        .call(d3.axisBottom(x).tickSize(-height).tickFormat(''));

    // Dessiner les axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5));

    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(5));

    // Titres des axes
    g.append('text')
        .attr('class', 'axis-title')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Fréquence (normalisée)');

    g.append('text')
        .attr('class', 'axis-title')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Gravité estimée');

    // Lignes de séparation des quadrants
    const midX = x(d3.median(data.impactScores, d => d.normalizedFrequency));
    const midY = y(0.5);

    g.append('line')
        .attr('class', 'quadrant-line')
        .attr('x1', midX)
        .attr('y1', 0)
        .attr('x2', midX)
        .attr('y2', height)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5');

    g.append('line')
        .attr('class', 'quadrant-line')
        .attr('x1', 0)
        .attr('y1', midY)
        .attr('x2', width)
        .attr('y2', midY)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5');

    // Étiquettes des quadrants
    g.append('text')
        .attr('class', 'quadrant-label')
        .attr('x', midX / 2)
        .attr('y', midY / 2)
        .text('Faible fréquence, haute gravité');

    g.append('text')
        .attr('class', 'quadrant-label')
        .attr('x', midX + (width - midX) / 2)
        .attr('y', midY / 2)
        .text('Haute fréquence, haute gravité');

    g.append('text')
        .attr('class', 'quadrant-label')
        .attr('x', midX / 2)
        .attr('y', midY + (height - midY) / 2)
        .text('Faible fréquence, faible gravité');

    g.append('text')
        .attr('class', 'quadrant-label')
        .attr('x', midX + (width - midX) / 2)
        .attr('y', midY + (height - midY) / 2)
        .text('Haute fréquence, faible gravité');

    // Dessiner les bulles pour chaque catégorie
    g.selectAll('.matrix-bubble')
        .data(data.impactScores)
        .enter().append('circle')
        .attr('class', 'matrix-bubble')
        .attr('cx', d => x(d.normalizedFrequency))
        .attr('cy', d => y(d.severity))
        .attr('r', d => size(d.geographicSpread))
        .attr('fill', d => color(d.impactScore))
        .attr('opacity', 0.8)
        .on('mouseover', function (event, d) {
            // Mettre en évidence la bulle
            d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke', '#333')
                .attr('stroke-width', 2);

            // Afficher une infobulle
            displayMatrixTooltip(event, d);
        })
        .on('mouseout', function () {
            // Restaurer l'apparence normale
            d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1.5);

            // Masquer l'infobulle
            hideImpactTooltip();
        });

    // Ajouter des étiquettes pour les catégories importantes
    const topCategories = data.impactScores.slice(0, 5);

    g.selectAll('.matrix-label')
        .data(topCategories)
        .enter().append('text')
        .attr('class', 'matrix-label')
        .attr('x', d => x(d.normalizedFrequency))
        .attr('y', d => y(d.severity) - size(d.geographicSpread) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(d => d.category.split(' ')[0]); // Afficher seulement le premier mot pour ne pas encombrer

    // Légende pour la taille des bulles
    const sizeLegend = svg.append('g')
        .attr('class', 'matrix-legend')
        .attr('transform', `translate(${margin.left + width - 100}, ${margin.top + 20})`);

    sizeLegend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-weight', 'bold')
        .text('Distribution');

    const sizeValues = [0.3, 0.6, 0.9];

    sizeValues.forEach((val, i) => {
        sizeLegend.append('circle')
            .attr('cx', 10)
            .attr('cy', i * 25 + 10)
            .attr('r', size(val))
            .attr('fill', 'rgba(0, 0, 0, 0.2)')
            .attr('stroke', '#666');

        sizeLegend.append('text')
            .attr('x', 25)
            .attr('y', i * 25 + 15)
            .text(`${Math.round(val * 100)}% des PDQ`);
    });

    // Titre du graphique
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', margin.left + width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`Matrice d'impact des crimes ${data.selectedYear !== 'all' ? `(${data.selectedYear})` : ''}`);
}

/**
* Génère des insights basés sur l'analyse des données d'impact
* 
* @param {Object} data Les données traitées
* @param {string} metricType Le type de métrique d'évaluation
*/
function generateImpactInsights(data, metricType) {
    const insightsContainer = document.querySelector('.insights-content');
    insightsContainer.innerHTML = '';

    // Top 3 des catégories avec le plus grand impact
    const topImpact = data.impactScores.slice(0, 3);

    // Catégories avec la plus haute fréquence
    const topFrequency = [...data.impactScores]
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 3);

    // Catégories avec la plus haute gravité
    const topSeverity = [...data.impactScores]
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 3);

    // Catégories avec la plus large distribution
    const topDistribution = [...data.impactScores]
        .sort((a, b) => b.geographicSpread - a.geographicSpread)
        .slice(0, 3);

    // Générer les insights HTML
    let insightsHTML = '<ul>';

    // Insight principal sur les catégories à plus fort impact
    insightsHTML += `
  <li>
    <strong>Catégories avec le plus grand impact sur la sécurité publique:</strong> 
    ${topImpact.map(d => formatCategoryName(d.category)).join(', ')}.
    ${metricType === 'weighted' ?
            'Ce classement tient compte de la fréquence des crimes, de leur gravité estimée et de leur répartition géographique.' :
            metricType === 'frequency' ?
                'Ce classement est basé uniquement sur la fréquence des crimes.' :
                'Ce classement est basé uniquement sur la distribution géographique des crimes.'}
  </li>
`;

    // Insight sur les catégories les plus fréquentes
    insightsHTML += `
  <li>
    <strong>Catégories les plus fréquentes:</strong> 
    ${topFrequency.map(d => `${formatCategoryName(d.category)} (${d.frequency} occurrences)`).join(', ')}.
    ${topFrequency[0].frequency > data.totalCrimes * 0.3 ?
            `La catégorie ${formatCategoryName(topFrequency[0].category)} représente à elle seule ${Math.round(topFrequency[0].frequency / data.totalCrimes * 100)}% de tous les crimes enregistrés.` : ''}
  </li>
`;

    // Insight sur les catégories les plus graves
    insightsHTML += `
  <li>
    <strong>Catégories estimées les plus graves:</strong> 
    ${topSeverity.map(d => formatCategoryName(d.category)).join(', ')}.
    Ces types de crimes sont considérés comme ayant un impact plus important sur la perception de sécurité des citoyens.
  </li>
`;

    // Insight sur les catégories les plus répandues géographiquement
    insightsHTML += `
  <li>
    <strong>Catégories les plus répandues géographiquement:</strong> 
    ${topDistribution.map(d => `${formatCategoryName(d.category)} (${Math.round(d.geographicSpread * 100)}% des PDQ)`).join(', ')}.
    ${topDistribution[0].geographicSpread > 0.9 ?
            `La catégorie ${formatCategoryName(topDistribution[0].category)} est présente dans presque tous les quartiers, indiquant un problème généralisé.` : ''}
  </li>
`;

    // Insight sur les catégories à surveiller particulièrement (quadrant haut-droite de la matrice)
    const highFreqHighSeverity = data.impactScores.filter(d =>
        d.normalizedFrequency > d3.median(data.impactScores, i => i.normalizedFrequency) &&
        d.severity > 0.5
    );

    if (highFreqHighSeverity.length > 0) {
        insightsHTML += `
    <li>
      <strong>Catégories à surveiller en priorité:</strong> 
      ${highFreqHighSeverity.map(d => formatCategoryName(d.category)).join(', ')}.
      Ces types de crimes combinent une fréquence élevée et une gravité importante, ce qui en fait des priorités pour les stratégies de sécurité publique.
    </li>
  `;
    }

    insightsHTML += '</ul>';

    insightsContainer.innerHTML = insightsHTML;
}

/**
* Affiche une infobulle pour une barre du graphique d'impact
* 
* @param {Event} event L'événement de souris
* @param {Object} data Les données associées à la barre
* @param {string} metricType Le type de métrique d'évaluation
*/
function displayImpactTooltip(event, data, metricType) {
    // Créer l'infobulle si elle n'existe pas
    if (!d3.select('.impact-tooltip').size()) {
        d3.select('body').append('div')
            .attr('class', 'impact-tooltip')
            .style('opacity', 0);
    }

    // Définir le contenu de l'infobulle
    let tooltipContent = `
  <div style="text-align: center; font-weight: bold; margin-bottom: 8px; color: #FB8C00; font-size: 14px;">
    ${formatCategoryName(data.category)}
  </div>
  <div style="margin-bottom: 5px;">
    <strong>Score d'impact:</strong> ${data.impactScore.toFixed(3)}
  </div>
  <hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;">
  <div>
    <strong>Fréquence:</strong> ${data.frequency} crimes<br>
    <strong>Gravité estimée:</strong> ${Math.round(data.severity * 100)}%<br>
    <strong>Distribution:</strong> ${Math.round(data.geographicSpread * 100)}% des PDQ
  </div>
`;

    // Afficher et positionner l'infobulle
    d3.select('.impact-tooltip')
        .html(tooltipContent)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 0.9);
}

/**
* Affiche une infobulle pour une bulle de la matrice d'impact
* 
* @param {Event} event L'événement de souris
* @param {Object} data Les données associées à la bulle
*/
function displayMatrixTooltip(event, data) {
    // Créer l'infobulle si elle n'existe pas
    if (!d3.select('.impact-tooltip').size()) {
        d3.select('body').append('div')
            .attr('class', 'impact-tooltip')
            .style('opacity', 0);
    }

    // Déterminer le quadrant
    const freqThreshold = d3.median(d3.selectAll('.matrix-bubble').data(), d => d.normalizedFrequency);
    const severityThreshold = 0.5;

    let quadrant = '';
    if (data.normalizedFrequency >= freqThreshold && data.severity >= severityThreshold) {
        quadrant = 'Haute fréquence, haute gravité';
    } else if (data.normalizedFrequency >= freqThreshold && data.severity < severityThreshold) {
        quadrant = 'Haute fréquence, faible gravité';
    } else if (data.normalizedFrequency < freqThreshold && data.severity >= severityThreshold) {
        quadrant = 'Faible fréquence, haute gravité';
    } else {
        quadrant = 'Faible fréquence, faible gravité';
    }

    // Définir le contenu de l'infobulle
    let tooltipContent = `
  <div style="text-align: center; font-weight: bold; margin-bottom: 8px; color: #FB8C00; font-size: 14px;">
    ${formatCategoryName(data.category)}
  </div>
  <div style="margin-bottom: 5px;">
    <strong>Quadrant:</strong> ${quadrant}
  </div>
  <hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;">
  <div>
    <strong>Fréquence:</strong> ${data.frequency} crimes<br>
    <strong>Gravité estimée:</strong> ${Math.round(data.severity * 100)}%<br>
    <strong>Distribution:</strong> ${Math.round(data.geographicSpread * 100)}% des PDQ
  </div>
`;

    // Afficher et positionner l'infobulle
    d3.select('.impact-tooltip')
        .html(tooltipContent)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 0.9);
}

/**
* Cache l'infobulle
*/
function hideImpactTooltip() {
    d3.select('.impact-tooltip')
        .transition()
        .duration(500)
        .style('opacity', 0);
}

/**
* Obtient le titre de la métrique en fonction du type
* 
* @param {string} metricType Le type de métrique
* @returns {string} Le titre correspondant
*/
function getMetricTitle(metricType) {
    switch (metricType) {
        case 'frequency':
            return 'Score basé sur la fréquence';
        case 'distribution':
            return 'Score basé sur la distribution géographique';
        default:
            return 'Score d\'impact pondéré';
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