/**
 * Module pour analyser l'impact des saisons sur les différents types de crimes
 * Répond à la question: "Quel est l'impact des saisons sur les différents types de crimes?"
 */

/**
 * Crée une visualisation de l'impact des saisons sur les types de crimes
 * 
 * @param {Array} crimeData Les données des crimes
 * @param {Object} container Le conteneur où placer la visualisation
 */
export function createSeasonalImpactAnalysis(crimeData, container) {
  console.log("Création de l'analyse d'impact saisonnier...");

  // Créer un conteneur pour la visualisation
  const analysisDiv = document.createElement('div');
  analysisDiv.className = 'seasonal-impact-container';
  analysisDiv.innerHTML = `
    <h2>Impact des saisons sur les types de crimes</h2>
    <div class="analysis-description">
      <p>Cette analyse explore comment les différents types de crimes varient selon les saisons, 
      révélant des patterns saisonniers qui peuvent aider à mieux cibler les efforts de prévention.</p>
    </div>
    <div class="analysis-controls">
      <div class="control-group">
        <label for="seasonal-view-type">Type de vue:</label>
        <select id="seasonal-view-type">
          <option value="heatmap" selected>Carte de chaleur</option>
          <option value="line">Courbes saisonnières</option>
        </select>
      </div>
      <div class="control-group">
        <label for="seasonal-category">Catégorie:</label>
        <select id="seasonal-category">
          <option value="all" selected>Toutes les catégories</option>
        </select>
      </div>
      <div class="control-group">
        <label for="seasonal-year">Année:</label>
        <select id="seasonal-year">
          <option value="all" selected>Toutes les années</option>
        </select>
      </div>
      <button id="apply-seasonal-controls" class="apply-button">Appliquer</button>
    </div>
    <div class="seasonal-chart-container">
      <svg id="seasonal-chart" class="analysis-chart"></svg>
    </div>
    <div class="seasonal-insights">
      <h3>Tendances saisonnières identifiées</h3>
      <div class="insights-content"></div>
    </div>
    <div class="seasonal-summary">
      <h3>Résumé saisonnier</h3>
      <div class="seasonal-cards"></div>
    </div>
  `;

  container.appendChild(analysisDiv);

  // Ajouter les styles pour la visualisation
  addSeasonalAnalysisStyles();

  // Extraire les catégories et années uniques
  prepareSeasonalControls(crimeData);

  // Gestionnaire d'événement pour les contrôles
  document.getElementById('apply-seasonal-controls').addEventListener('click', function () {
    updateSeasonalAnalysis(crimeData);
  });

  // Initialiser la visualisation après un court délai
  initializeSeasonalVisualization(crimeData);

  console.log("Analyse d'impact saisonnier créée");
}

/**
* Initialise explicitement la visualisation avec la carte de chaleur
* 
* @param {Array} crimeData Les données des crimes
*/
function initializeSeasonalVisualization(crimeData) {
  // S'assurer que tous les éléments du DOM sont bien chargés
  setTimeout(() => {
    try {
      // Vérifier que les éléments existent
      const viewTypeSelect = document.getElementById('seasonal-view-type');
      const categorySelect = document.getElementById('seasonal-category');
      const yearSelect = document.getElementById('seasonal-year');

      if (viewTypeSelect && categorySelect && yearSelect) {
        // Définir les valeurs par défaut
        viewTypeSelect.value = 'heatmap';
        categorySelect.value = 'all';
        yearSelect.value = 'all';

        console.log("Initialisation de la visualisation saisonnière...");

        // Créer la visualisation initiale
        const seasonalData = processDataForSeasonalAnalysis(crimeData, 'all', 'all');
        createSeasonalHeatmap(seasonalData);
        generateSeasonalInsights(seasonalData);
        displaySeasonalSummary(seasonalData);

        console.log("Visualisation saisonnière initialisée avec succès");
      } else {
        console.error("Certains éléments de la visualisation saisonnière n'ont pas été trouvés");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la visualisation saisonnière:", error);
    }
  }, 500); // Délai pour s'assurer que le DOM est chargé
}

/**
* Ajoute les styles CSS pour l'analyse saisonnière
*/
function addSeasonalAnalysisStyles() {
  // Vérifier si les styles existent déjà
  if (document.getElementById('seasonal-analysis-styles')) return;

  const style = document.createElement('style');
  style.id = 'seasonal-analysis-styles';
  style.textContent = `
    .seasonal-impact-container {
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .seasonal-impact-container h2 {
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
    
    .seasonal-chart-container {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
      height: 500px;
    }
    
    .analysis-chart {
      width: 100%;
      max-width: 1000px;
      height: 100%;
    }
    
    .seasonal-insights {
      margin-bottom: 30px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #FB8C00;
    }
    
    .seasonal-insights h3 {
      margin-top: 0;
      color: #FB8C00;
      font-size: 18px;
      margin-bottom: 15px;
    }
    
    .insights-content {
      color: #333;
      line-height: 1.5;
    }
    
    .seasonal-summary {
      margin-bottom: 30px;
    }
    
    .seasonal-summary h3 {
      color: #333;
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .seasonal-cards {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 15px;
    }
    
    .season-card {
      width: 200px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    
    .season-card h4 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      border-bottom: 2px solid;
      padding-bottom: 5px;
    }
    
    .season-card-winter h4 {
      color: #2196F3;
      border-color: #2196F3;
    }
    
    .season-card-spring h4 {
      color: #4CAF50;
      border-color: #4CAF50;
    }
    
    .season-card-summer h4 {
      color: #FF9800;
      border-color: #FF9800;
    }
    
    .season-card-autumn h4 {
      color: #795548;
      border-color: #795548;
    }
    
    .season-content {
      margin-bottom: 10px;
    }
    
    .season-stat {
      margin-bottom: 5px;
    }
    
    .season-trend {
      font-weight: bold;
      color: #FB8C00;
    }
    
    .heatmap-cell {
      stroke: white;
      stroke-width: 1px;
    }
    
    .heatmap-cell:hover {
      stroke: #333;
      stroke-width: 2px;
    }
    
    .season-tooltip {
      position: absolute;
      padding: 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      pointer-events: none;
      font-size: 14px;
      z-index: 100;
    }
    
    .radar-area {
      fill-opacity: 0.2;
      stroke-width: 2;
    }
    
    .radar-area:hover {
      fill-opacity: 0.4;
    }
    
    .winter-color { color: #2196F3; stroke: #2196F3; fill: #2196F3; }
    .spring-color { color: #4CAF50; stroke: #4CAF50; fill: #4CAF50; }
    .summer-color { color: #FF9800; stroke: #FF9800; fill: #FF9800; }
    .autumn-color { color: #795548; stroke: #795548; fill: #795548; }
    
    .seasonal-legend {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
    }
    
    .legend-color {
      width: 15px;
      height: 15px;
      margin-right: 5px;
      border-radius: 3px;
    }
  `;

  document.head.appendChild(style);
}

/**
* Prépare les contrôles pour l'analyse saisonnière
* 
* @param {Array} crimeData Les données des crimes
*/
function prepareSeasonalControls(crimeData) {
  // Extraire les catégories uniques
  const categories = [...new Set(crimeData
    .map(d => d.CATEGORIE)
    .filter(c => c !== null))];

  // Extraire les années uniques
  const years = [...new Set(crimeData
    .map(d => d.DATE ? new Date(d.DATE).getFullYear() : null)
    .filter(y => y !== null))].sort();

  // Remplir le sélecteur de catégories
  const categorySelect = document.getElementById('seasonal-category');

  // Vider les options existantes sauf "Toutes les catégories"
  while (categorySelect.options.length > 1) {
    categorySelect.options.remove(1);
  }

  // Ajouter les options de catégories
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = formatCategoryName(category);
    categorySelect.appendChild(option);
  });

  // Remplir le sélecteur d'années
  const yearSelect = document.getElementById('seasonal-year');

  // Vider les options existantes sauf "Toutes les années"
  while (yearSelect.options.length > 1) {
    yearSelect.options.remove(1);
  }

  // Ajouter les options d'années
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
}

/**
* Met à jour l'analyse saisonnière en fonction des contrôles sélectionnés
* 
* @param {Array} crimeData Les données des crimes
*/
function updateSeasonalAnalysis(crimeData) {
  try {
    console.log("Mise à jour de l'analyse saisonnière...");

    // Récupérer les valeurs des contrôles
    const viewTypeSelect = document.getElementById('seasonal-view-type');
    const categorySelect = document.getElementById('seasonal-category');
    const yearSelect = document.getElementById('seasonal-year');

    if (!viewTypeSelect || !categorySelect || !yearSelect) {
      console.error("Les contrôles de la visualisation saisonnière n'ont pas été trouvés");
      return;
    }

    const viewType = viewTypeSelect.value;
    const categoryFilter = categorySelect.value;
    const yearFilter = yearSelect.value;

    console.log(`Type de vue: ${viewType}, Catégorie: ${categoryFilter}, Année: ${yearFilter}`);

    // Traiter les données pour l'analyse saisonnière
    const seasonalData = processDataForSeasonalAnalysis(crimeData, categoryFilter, yearFilter);

    // Créer la visualisation appropriée
    if (viewType === 'heatmap') {
      createSeasonalHeatmap(seasonalData);
    } else if (viewType === 'radar') {
      createSeasonalRadarChart(seasonalData);
    } else if (viewType === 'line') {
      createSeasonalLineChart(seasonalData);
    }

    // Générer les insights sur les tendances saisonnières
    generateSeasonalInsights(seasonalData);

    // Afficher le résumé saisonnier
    displaySeasonalSummary(seasonalData);

    console.log("Analyse saisonnière mise à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'analyse saisonnière:", error);
  }
}

/**
* Traite les données pour l'analyse saisonnière
* 
* @param {Array} crimeData Les données brutes des crimes
* @param {string} categoryFilter La catégorie à filtrer (ou 'all' pour toutes)
* @param {string} yearFilter L'année à filtrer (ou 'all' pour toutes)
* @returns {Object} Les données traitées pour l'analyse saisonnière
*/
function processDataForSeasonalAnalysis(crimeData, categoryFilter, yearFilter) {
  // Filtrer les données selon les critères
  const filteredData = crimeData.filter(crime => {
    if (!crime.DATE) return false;

    // Filtre par catégorie
    if (categoryFilter !== 'all' && crime.CATEGORIE !== categoryFilter) {
      return false;
    }

    // Filtre par année
    if (yearFilter !== 'all') {
      const crimeYear = new Date(crime.DATE).getFullYear();
      if (crimeYear !== parseInt(yearFilter)) {
        return false;
      }
    }

    return true;
  });

  // Initialiser les structures de données
  const monthlyData = Array(12).fill(0);
  const quarterlyData = Array(4).fill(0);
  const seasonalData = {
    winter: 0, // Déc, Jan, Fév
    spring: 0, // Mar, Avr, Mai
    summer: 0, // Juin, Juil, Août
    autumn: 0  // Sep, Oct, Nov
  };

  // Compter les crimes par mois
  filteredData.forEach(crime => {
    const date = new Date(crime.DATE);
    const month = date.getMonth(); // 0-11

    // Incrémenter le compteur mensuel
    monthlyData[month]++;

    // Incrémenter le compteur trimestriel
    const quarter = Math.floor(month / 3);
    quarterlyData[quarter]++;

    // Incrémenter le compteur saisonnier
    if (month === 11 || month === 0 || month === 1) {
      seasonalData.winter++;
    } else if (month >= 2 && month <= 4) {
      seasonalData.spring++;
    } else if (month >= 5 && month <= 7) {
      seasonalData.summer++;
    } else if (month >= 8 && month <= 10) {
      seasonalData.autumn++;
    }
  });

  // Analyse par catégorie et saison
  const categorySeasonalData = {};

  if (categoryFilter === 'all') {
    // Regrouper par catégorie
    const categories = [...new Set(filteredData.map(d => d.CATEGORIE).filter(c => c !== null))];

    categories.forEach(category => {
      const categoryCrimes = filteredData.filter(crime => crime.CATEGORIE === category);

      // Initialiser les compteurs pour cette catégorie
      categorySeasonalData[category] = {
        winter: 0,
        spring: 0,
        summer: 0,
        autumn: 0,
        total: categoryCrimes.length
      };

      // Compter les crimes par saison pour cette catégorie
      categoryCrimes.forEach(crime => {
        const date = new Date(crime.DATE);
        const month = date.getMonth();

        if (month === 11 || month === 0 || month === 1) {
          categorySeasonalData[category].winter++;
        } else if (month >= 2 && month <= 4) {
          categorySeasonalData[category].spring++;
        } else if (month >= 5 && month <= 7) {
          categorySeasonalData[category].summer++;
        } else if (month >= 8 && month <= 10) {
          categorySeasonalData[category].autumn++;
        }
      });
    });
  }

  // Tendances saisonnières
  const seasonalTrends = {};
  const seasons = ['winter', 'spring', 'summer', 'autumn'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Pour chaque saison, identifier les tendances
  seasons.forEach(season => {
    const seasonMonths = getSeasonMonths(season);
    const seasonMonthsData = seasonMonths.map(month => monthlyData[month]);
    const totalSeasonCrimes = seasonalData[season];
    const avgMonthlyInSeason = totalSeasonCrimes / 3;

    // Trouver le mois avec le plus de crimes dans cette saison
    const maxMonthIndex = seasonMonths[seasonMonthsData.indexOf(Math.max(...seasonMonthsData))];
    const maxMonthName = monthNames[maxMonthIndex];
    const maxMonthCount = monthlyData[maxMonthIndex];

    // Calculer la part de cette saison dans le total
    const totalCrimes = filteredData.length;
    const seasonPercentage = totalCrimes > 0 ? (totalSeasonCrimes / totalCrimes) * 100 : 0;

    // Stocker les tendances
    seasonalTrends[season] = {
      totalCrimes: totalSeasonCrimes,
      percentageOfTotal: seasonPercentage,
      peakMonth: maxMonthName,
      peakMonthCount: maxMonthCount,
      averageMonthly: avgMonthlyInSeason
    };
  });

  // Détecter les variations mensuelles importantes
  const monthlyVariation = [];

  for (let i = 0; i < 12; i++) {
    const prevMonth = (i + 11) % 12; // Mois précédent (cyclique)
    const nextMonth = (i + 1) % 12; // Mois suivant (cyclique)

    // Calculer les variations
    const prevVariation = monthlyData[prevMonth] > 0 ?
      ((monthlyData[i] - monthlyData[prevMonth]) / monthlyData[prevMonth]) * 100 : 0;

    const nextVariation = monthlyData[i] > 0 ?
      ((monthlyData[nextMonth] - monthlyData[i]) / monthlyData[i]) * 100 : 0;

    // Si les variations sont significatives
    if (Math.abs(prevVariation) > 15 || Math.abs(nextVariation) > 15) {
      monthlyVariation.push({
        month: monthNames[i],
        count: monthlyData[i],
        prevVariation,
        nextVariation
      });
    }
  }

  return {
    monthlyData,
    quarterlyData,
    seasonalData,
    categorySeasonalData,
    seasonalTrends,
    monthlyVariation,
    categoryFilter,
    yearFilter,
    totalCrimes: filteredData.length
  };
}

/**
* Retourne les indices des mois pour une saison donnée
* 
* @param {string} season La saison ('winter', 'spring', 'summer', 'autumn')
* @returns {Array} Les indices des mois pour cette saison
*/
function getSeasonMonths(season) {
  switch (season) {
    case 'winter': return [11, 0, 1]; // Déc, Jan, Fév
    case 'spring': return [2, 3, 4]; // Mar, Avr, Mai
    case 'summer': return [5, 6, 7]; // Juin, Juil, Août
    case 'autumn': return [8, 9, 10]; // Sep, Oct, Nov
    default: return [];
  }
}

/**
* Crée une carte de chaleur des crimes par mois
* 
* @param {Object} data Les données traitées
*/
function createSeasonalHeatmap(data) {
  // Protection contre les données manquantes
  if (!data || !data.monthlyData) {
    console.error("Données invalides pour la carte de chaleur");

    // Utiliser des données par défaut si nécessaire
    data = {
      monthlyData: [100, 120, 150, 130, 110, 90, 80, 70, 90, 100, 120, 140],
      seasonalData: {
        winter: 360,
        spring: 390,
        summer: 240,
        autumn: 310
      },
      totalCrimes: 1300,
      categoryFilter: 'all',
      yearFilter: 'all'
    };
  }

  // Vider le conteneur du graphique
  const chartContainer = document.getElementById('seasonal-chart');
  if (!chartContainer) {
    console.error("Conteneur du graphique saisonnier non trouvé");
    return;
  }

  chartContainer.innerHTML = '';

  // Définir les dimensions du graphique
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };
  const width = chartContainer.clientWidth - margin.left - margin.right;
  const height = chartContainer.clientHeight - margin.top - margin.bottom;

  // Créer le conteneur SVG
  const svg = d3.select(chartContainer)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Définir les dimensions de la grille
  const cellSize = Math.min(width / 12, 60);
  const gridWidth = cellSize * 12;
  const gridHeight = cellSize * 4;

  // Centrer la grille horizontalement
  const gridX = (width - gridWidth) / 2;

  // Noms des mois et saisons
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const seasonNames = ['Hiver', 'Printemps', 'Été', 'Automne'];
  const seasonColors = ['#2196F3', '#4CAF50', '#FF9800', '#795548'];

  // Échelle de couleur pour l'intensité des crimes
  const maxCount = Math.max(...data.monthlyData);

  const colorScale = d3.scaleSequential()
    .domain([0, maxCount])
    .interpolator(d3.interpolateReds);

  // Dessiner les étiquettes des mois
  svg.selectAll('.month-label')
    .data(monthNames)
    .enter()
    .append('text')
    .attr('class', 'month-label')
    .attr('x', (d, i) => gridX + i * cellSize + cellSize / 2)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'hanging')
    .style('font-size', '12px')
    .text(d => d.substring(0, 3)); // Utiliser les trois premières lettres

  // Dessiner les cellules de la heatmap pour les mois
  svg.selectAll('.month-cell')
    .data(data.monthlyData)
    .enter()
    .append('rect')
    .attr('class', 'heatmap-cell month-cell')
    .attr('x', (d, i) => gridX + i * cellSize)
    .attr('y', 30)
    .attr('width', cellSize - 2)
    .attr('height', cellSize - 2)
    .attr('fill', d => colorScale(d))
    .attr('rx', 2)
    .attr('ry', 2)
    .on('mouseover', function (event, d) {
      const monthIndex = data.monthlyData.indexOf(d);
      showTooltip(event, {
        title: monthNames[monthIndex],
        count: d,
        percentage: (d / data.totalCrimes * 100).toFixed(1) + '%'
      });
    })
    .on('mouseout', hideTooltip);

  // Ajouter les valeurs dans les cellules
  svg.selectAll('.month-value')
    .data(data.monthlyData)
    .enter()
    .append('text')
    .attr('class', 'month-value')
    .attr('x', (d, i) => gridX + i * cellSize + cellSize / 2)
    .attr('y', 30 + cellSize / 2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', '10px')
    .style('font-weight', 'bold')
    .style('fill', d => d > maxCount * 0.7 ? 'white' : 'black')
    .text(d => d);

  // Dessiner les étiquettes des saisons
  svg.selectAll('.season-label')
    .data(seasonNames)
    .enter()
    .append('text')
    .attr('class', 'season-label')
    .attr('x', gridX - 10)
    .attr('y', (d, i) => 100 + i * cellSize + cellSize / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .style('font-size', '12px')
    .style('fill', (d, i) => seasonColors[i])
    .style('font-weight', 'bold')
    .text(d => d);

  // Dessiner les cellules de la heatmap pour les saisons
  const seasonData = [
    data.seasonalData.winter,
    data.seasonalData.spring,
    data.seasonalData.summer,
    data.seasonalData.autumn
  ];

  // Réorganiser les mois par saison pour l'affichage
  const seasonMonths = [
    [11, 0, 1], // Hiver (Déc, Jan, Fév)
    [2, 3, 4],  // Printemps (Mar, Avr, Mai)
    [5, 6, 7],  // Été (Juin, Juil, Août)
    [8, 9, 10]  // Automne (Sep, Oct, Nov)
  ];

  // Dessiner les cellules pour chaque saison
  seasonNames.forEach((season, seasonIndex) => {
    const months = seasonMonths[seasonIndex];

    // Dessiner les cellules pour les mois de cette saison
    months.forEach((monthIndex, i) => {
      svg.append('rect')
        .attr('class', 'heatmap-cell season-month-cell')
        .attr('x', gridX + i * cellSize)
        .attr('y', 100 + seasonIndex * cellSize)
        .attr('width', cellSize - 2)
        .attr('height', cellSize - 2)
        .attr('fill', colorScale(data.monthlyData[monthIndex]))
        .attr('stroke', seasonColors[seasonIndex])
        .attr('stroke-width', 1.5)
        .attr('rx', 2)
        .attr('ry', 2)
        .on('mouseover', function (event) {
          showTooltip(event, {
            title: monthNames[monthIndex],
            count: data.monthlyData[monthIndex],
            percentage: (data.monthlyData[monthIndex] / data.totalCrimes * 100).toFixed(1) + '%',
            season: seasonNames[seasonIndex]
          });
        })
        .on('mouseout', hideTooltip);

      // Ajouter les valeurs dans les cellules
      svg.append('text')
        .attr('class', 'season-month-value')
        .attr('x', gridX + i * cellSize + cellSize / 2)
        .attr('y', 100 + seasonIndex * cellSize + cellSize / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('fill', data.monthlyData[monthIndex] > maxCount * 0.7 ? 'white' : 'black')
        .text(data.monthlyData[monthIndex]);
    });

    // Dessiner la cellule du total saisonnier
    svg.append('rect')
      .attr('class', 'heatmap-cell season-total-cell')
      .attr('x', gridX + 3 * cellSize)
      .attr('y', 100 + seasonIndex * cellSize)
      .attr('width', cellSize * 1.5 - 2)
      .attr('height', cellSize - 2)
      .attr('fill', seasonColors[seasonIndex])
      .attr('opacity', 0.8)
      .attr('rx', 2)
      .attr('ry', 2)
      .on('mouseover', function (event) {
        showTooltip(event, {
          title: seasonNames[seasonIndex],
          count: seasonData[seasonIndex],
          percentage: (seasonData[seasonIndex] / data.totalCrimes * 100).toFixed(1) + '%'
        });
      })
      .on('mouseout', hideTooltip);

    // Ajouter les valeurs du total saisonnier
    svg.append('text')
      .attr('class', 'season-total-value')
      .attr('x', gridX + 3 * cellSize + cellSize * 1.5 / 2)
      .attr('y', 100 + seasonIndex * cellSize + cellSize / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text(seasonData[seasonIndex]);
  });

  // Ajouter le titre
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', -30)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Distribution saisonnière des crimes');

  // Ajouter l'échelle de couleur comme légende
  const legendWidth = 200;
  const legendHeight = 15;

  const legendX = width - legendWidth - 20;
  const legendY = height - 30;

  const legendScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .ticks(5)
    .tickSize(legendHeight + 5);

  // Créer un gradient pour la légende
  const defs = svg.append('defs');

  const gradient = defs.append('linearGradient')
    .attr('id', 'heatmap-gradient')
    .attr('x1', '0%')
    .attr('x2', '100%')
    .attr('y1', '0%')
    .attr('y2', '0%');

  // Ajouter les stops du gradient
  const numStops = 10;
  for (let i = 0; i < numStops; i++) {
    const offset = i / (numStops - 1);
    const stopValue = offset * maxCount;

    gradient.append('stop')
      .attr('offset', `${offset * 100}%`)
      .attr('stop-color', colorScale(stopValue));
  }

  // Dessiner la barre de légende
  svg.append('rect')
    .attr('x', legendX)
    .attr('y', legendY)
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .style('fill', 'url(#heatmap-gradient)');

  // Ajouter l'axe de la légende
  svg.append('g')
    .attr('transform', `translate(${legendX}, ${legendY})`)
    .call(legendAxis)
    .select('.domain')
    .remove();

  // Ajouter un titre pour la légende
  svg.append('text')
    .attr('x', legendX + legendWidth / 2)
    .attr('y', legendY - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Nombre de crimes');
}

/**
* Crée un graphique radar des crimes par saison
* 
* @param {Object} data Les données traitées
*/
function createSeasonalRadarChart(data) {
  // Vider le conteneur du graphique
  const chartContainer = document.getElementById('seasonal-chart');
  chartContainer.innerHTML = '';

  // Définir les dimensions du graphique
  const margin = { top: 80, right: 80, bottom: 80, left: 80 };
  const width = chartContainer.clientWidth - margin.left - margin.right;
  const height = chartContainer.clientHeight - margin.top - margin.bottom;
  const radius = Math.min(width, height) / 2;

  // Créer le conteneur SVG
  const svg = d3.select(chartContainer)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

  // Données pour le radar
  const seasonNames = ['Hiver', 'Printemps', 'Été', 'Automne'];
  const seasonData = [
    data.seasonalData.winter,
    data.seasonalData.spring,
    data.seasonalData.summer,
    data.seasonalData.autumn
  ];

  // Échelle angulaire pour les axes
  const angleScale = d3.scaleLinear()
    .domain([0, seasonNames.length])
    .range([0, Math.PI * 2]);

  // Échelle radiale pour les valeurs
  const maxCount = Math.max(...seasonData);

  const radiusScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([0, radius])
    .nice();

  // Couleurs pour les saisons
  const seasonColors = ['#2196F3', '#4CAF50', '#FF9800', '#795548'];
  const seasonColorClasses = ['winter-color', 'spring-color', 'summer-color', 'autumn-color'];

  // Créer les cercles concentriques
  const levels = 5;
  const levelStep = maxCount / levels;

  for (let level = 1; level <= levels; level++) {
    const levelValue = level * levelStep;
    const levelRadius = radiusScale(levelValue);

    // Cercle
    svg.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', levelRadius)
      .attr('fill', 'none')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Étiquette de niveau
    svg.append('text')
      .attr('x', 5)
      .attr('y', -levelRadius - 2)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'baseline')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(Math.round(levelValue));
  }

  // Créer les axes
  const axes = seasonNames.map((_, i) => {
    const angle = angleScale(i) - Math.PI / 2; // Commencer à midi et tourner dans le sens horaire
    return {
      name: seasonNames[i],
      angle: angle,
      lineCoords: {
        x1: 0,
        y1: 0,
        x2: radius * Math.cos(angle),
        y2: radius * Math.sin(angle)
      },
      labelCoords: {
        x: (radius + 20) * Math.cos(angle),
        y: (radius + 20) * Math.sin(angle)
      }
    };
  });

  // Dessiner les axes
  axes.forEach((axis, i) => {
    // Ligne d'axe
    svg.append('line')
      .attr('x1', axis.lineCoords.x1)
      .attr('y1', axis.lineCoords.y1)
      .attr('x2', axis.lineCoords.x2)
      .attr('y2', axis.lineCoords.y2)
      .attr('stroke', seasonColors[i])
      .attr('stroke-width', 1.5);

    // Étiquette d'axe
    svg.append('text')
      .attr('x', axis.labelCoords.x)
      .attr('y', axis.labelCoords.y)
      .attr('text-anchor', () => {
        const angle = axis.angle;
        if (Math.abs(Math.cos(angle)) < 0.1) return 'middle';
        return Math.cos(angle) > 0 ? 'start' : 'end';
      })
      .attr('dominant-baseline', () => {
        const angle = axis.angle;
        if (Math.abs(Math.sin(angle)) < 0.1) return 'middle';
        return Math.sin(angle) > 0 ? 'hanging' : 'auto';
      })
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .attr('class', seasonColorClasses[i])
      .text(axis.name);
  });

  // Définir les coordonnées pour l'aire du radar
  const radarPoints = seasonData.map((value, i) => {
    const angle = angleScale(i) - Math.PI / 2;
    const r = radiusScale(value);
    return {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
      value: value,
      season: seasonNames[i]
    };
  });

  // Créer une ligne pour tracer l'aire
  const radarLine = d3.lineRadial()
    .radius(d => radiusScale(d))
    .angle((d, i) => angleScale(i) - Math.PI / 2)
    .curve(d3.curveLinearClosed);

  // Dessiner l'aire du radar
  svg.append('path')
    .datum(seasonData)
    .attr('class', 'radar-area')
    .attr('d', radarLine)
    .attr('fill', '#FB8C00')
    .attr('fill-opacity', 0.3)
    .attr('stroke', '#FB8C00')
    .attr('stroke-width', 2);

  // Ajouter les points sur le radar
  radarPoints.forEach((point, i) => {
    svg.append('circle')
      .attr('cx', point.x)
      .attr('cy', point.y)
      .attr('r', 6)
      .attr('fill', seasonColors[i])
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .on('mouseover', function (event) {
        // Mettre en évidence le point
        d3.select(this)
          .attr('r', 8)
          .attr('stroke', '#333');

        // Afficher l'infobulle
        showTooltip(event, {
          title: point.season,
          count: point.value,
          percentage: (point.value / data.totalCrimes * 100).toFixed(1) + '%'
        });
      })
      .on('mouseout', function () {
        // Restaurer le point
        d3.select(this)
          .attr('r', 6)
          .attr('stroke', '#fff');

        // Masquer l'infobulle
        hideTooltip();
      });

    // Ajouter la valeur
    svg.append('text')
      .attr('x', point.x)
      .attr('y', point.y - 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(point.value);
  });

  // Ajouter le titre
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', 0)
    .attr('y', -radius - 40)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Distribution saisonnière des crimes');

  // Ajouter le sous-titre
  if (data.categoryFilter !== 'all') {
    svg.append('text')
      .attr('class', 'chart-subtitle')
      .attr('x', 0)
      .attr('y', -radius - 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(`Catégorie: ${formatCategoryName(data.categoryFilter)}`);
  }

  // Ajouter l'information sur le nombre total de crimes
  svg.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text(data.totalCrimes);

  svg.append('text')
    .attr('x', 0)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('crimes');
}
/**
* Crée un graphique linéaire des crimes par mois
* 
* @param {Object} data Les données traitées
*/
function createSeasonalLineChart(data) {
  // Vider le conteneur du graphique
  const chartContainer = document.getElementById('seasonal-chart');
  chartContainer.innerHTML = '';

  // Définir les dimensions du graphique
  const margin = { top: 70, right: 30, bottom: 50, left: 60 }; // Augmenter le margin.top pour la légende
  const width = chartContainer.clientWidth - margin.left - margin.right;
  const height = chartContainer.clientHeight - margin.top - margin.bottom;

  // Créer le conteneur SVG
  const svg = d3.select(chartContainer)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Données
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Créer l'échelle X
  const x = d3.scaleBand()
    .domain(monthNames)
    .range([0, width])
    .padding(0.1);

  // Créer l'échelle Y
  const yMax = Math.max(...data.monthlyData) * 1.1;

  const y = d3.scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([height, 0]);

  // Créer les axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  // Dessiner l'axe X
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-45)');

  // Dessiner l'axe Y
  svg.append('g')
    .attr('class', 'y-axis')
    .call(yAxis);

  // Ajouter le titre de l'axe Y
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 15)
    .attr('x', -height / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Nombre de crimes');

  // Saisonnalités
  const seasonRanges = [
    { season: 'winter', months: [0, 1, 11], color: '#2196F3' },
    { season: 'spring', months: [2, 3, 4], color: '#4CAF50' },
    { season: 'summer', months: [5, 6, 7], color: '#FF9800' },
    { season: 'autumn', months: [8, 9, 10], color: '#795548' }
  ];

  // Créer des zones colorées pour les saisons
  seasonRanges.forEach(seasonRange => {
    const xStart = x(monthNames[seasonRange.months[0]]);
    const xEnd = x(monthNames[seasonRange.months[seasonRange.months.length - 1]]) + x.bandwidth();

    svg.append('rect')
      .attr('x', xStart)
      .attr('y', 0)
      .attr('width', xEnd - xStart)
      .attr('height', height)
      .attr('fill', seasonRange.color)
      .attr('opacity', 0.1);

    // Ajouter le nom de la saison
    svg.append('text')
      .attr('x', xStart + (xEnd - xStart) / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', seasonRange.color)
      .text(seasonRange.season === 'winter' ? 'Hiver' :
        seasonRange.season === 'spring' ? 'Printemps' :
          seasonRange.season === 'summer' ? 'Été' : 'Automne');
  });

  // Créer le générateur de ligne
  const line = d3.line()
    .x((d, i) => x(monthNames[i]) + x.bandwidth() / 2)
    .y(d => y(d))
    .curve(d3.curveMonotoneX);

  // Dessiner la ligne
  svg.append('path')
    .datum(data.monthlyData)
    .attr('class', 'seasonal-line')
    .attr('fill', 'none')
    .attr('stroke', '#FB8C00')
    .attr('stroke-width', 3)
    .attr('d', line);

  // Ajouter les points
  svg.selectAll('.seasonal-point')
    .data(data.monthlyData)
    .enter()
    .append('circle')
    .attr('class', 'seasonal-point')
    .attr('cx', (d, i) => x(monthNames[i]) + x.bandwidth() / 2)
    .attr('cy', d => y(d))
    .attr('r', 5)
    .attr('fill', (d, i) => {
      // Déterminer la saison pour ce mois
      if (i === 0 || i === 1 || i === 11) return '#2196F3'; // Hiver
      if (i >= 2 && i <= 4) return '#4CAF50'; // Printemps
      if (i >= 5 && i <= 7) return '#FF9800'; // Été
      return '#795548'; // Automne
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .on('mouseover', function (event, d) {
      // Mettre en évidence le point
      d3.select(this)
        .attr('r', 8)
        .attr('stroke', '#333');

      // Déterminer l'index et le mois
      const index = data.monthlyData.indexOf(d);
      const month = monthNames[index];

      // Déterminer la saison
      let season;
      if (index === 0 || index === 1 || index === 11) season = 'Hiver';
      else if (index >= 2 && index <= 4) season = 'Printemps';
      else if (index >= 5 && index <= 7) season = 'Été';
      else season = 'Automne';

      // Afficher l'infobulle
      showTooltip(event, {
        title: month,
        count: d,
        percentage: (d / data.totalCrimes * 100).toFixed(1) + '%',
        season: season
      });
    })
    .on('mouseout', function () {
      // Restaurer le point
      d3.select(this)
        .attr('r', 5)
        .attr('stroke', '#fff');

      // Masquer l'infobulle
      hideTooltip();
    });

  // Ajouter les valeurs au-dessus des points
  svg.selectAll('.seasonal-value')
    .data(data.monthlyData)
    .enter()
    .append('text')
    .attr('class', 'seasonal-value')
    .attr('x', (d, i) => x(monthNames[i]) + x.bandwidth() / 2)
    .attr('y', d => y(d) - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', '10px')
    .style('font-weight', 'bold')
    .text(d => d);

  // Ajouter le titre
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', (-margin.top / 2) - 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Évolution mensuelle des crimes');

  // Ajouter le sous-titre
  if (data.categoryFilter !== 'all') {
    svg.append('text')
      .attr('class', 'chart-subtitle')
      .attr('x', width / 2)
      .attr('y', (-margin.top / 2 + 20) - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(`Catégorie: ${formatCategoryName(data.categoryFilter)}`);
  }

  // Créer la légende pour les saisons en haut du graphique, au lieu d'à droite
  const legend = svg.append('g')
    .attr('class', 'seasonal-legend')
    .attr('transform', `translate(${width / 2 - 150}, -25)`);

  const seasonLabels = [
    { season: 'Hiver', color: '#2196F3' },
    { season: 'Printemps', color: '#4CAF50' },
    { season: 'Été', color: '#FF9800' },
    { season: 'Automne', color: '#795548' }
  ];

  // Disposition horizontale de la légende
  seasonLabels.forEach((item, i) => {
    const legendItem = legend.append('g')
      .attr('transform', `translate(${i * 100}, 0)`);

    legendItem.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', item.color);

    legendItem.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text(item.season);
  });
}

/**
* Génère des insights sur les tendances saisonnières
* 
* @param {Object} data Les données traitées
*/
function generateSeasonalInsights(data) {
  const insightsContent = document.querySelector('.seasonal-insights .insights-content');

  // Tendances générales
  let insightsHtml = '<p>';

  // Trouver la saison avec le plus de crimes
  const seasons = ['winter', 'spring', 'summer', 'autumn'];
  const seasonCounts = [
    data.seasonalData.winter,
    data.seasonalData.spring,
    data.seasonalData.summer,
    data.seasonalData.autumn
  ];

  const maxSeasonIndex = seasonCounts.indexOf(Math.max(...seasonCounts));
  const minSeasonIndex = seasonCounts.indexOf(Math.min(...seasonCounts));

  const seasonNames = ['l\'hiver', 'le printemps', 'l\'été', 'l\'automne'];

  // Premier insight: la saison la plus active
  insightsHtml += `La saison avec le plus d'activité criminelle est <strong>${seasonNames[maxSeasonIndex]}</strong>, 
représentant <strong>${(seasonCounts[maxSeasonIndex] / data.totalCrimes * 100).toFixed(1)}%</strong> de tous les crimes. `;

  insightsHtml += `En revanche, <strong>${seasonNames[minSeasonIndex]}</strong> est la période la plus calme 
avec seulement <strong>${(seasonCounts[minSeasonIndex] / data.totalCrimes * 100).toFixed(1)}%</strong> des incidents.`;

  insightsHtml += '</p>';

  // Tendances mensuelles
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Trouver le mois avec le plus et le moins de crimes
  const maxMonthIndex = data.monthlyData.indexOf(Math.max(...data.monthlyData));
  const minMonthIndex = data.monthlyData.indexOf(Math.min(...data.monthlyData));

  insightsHtml += `<p>Le mois avec le plus haut taux de criminalité est <strong>${monthNames[maxMonthIndex]}</strong> 
avec <strong>${data.monthlyData[maxMonthIndex]}</strong> crimes, tandis que <strong>${monthNames[minMonthIndex]}</strong> 
enregistre le taux le plus bas avec <strong>${data.monthlyData[minMonthIndex]}</strong> crimes.</p>`;

  // Variations significatives
  if (data.monthlyVariation.length > 0) {
    insightsHtml += '<p>Des variations mensuelles significatives ont été identifiées:</p><ul>';

    data.monthlyVariation.slice(0, 3).forEach(variation => {
      if (variation.prevVariation > 15) {
        insightsHtml += `<li><strong>${variation.month}</strong>: augmentation de ${variation.prevVariation.toFixed(1)}% par rapport au mois précédent</li>`;
      } else if (variation.prevVariation < -15) {
        insightsHtml += `<li><strong>${variation.month}</strong>: diminution de ${Math.abs(variation.prevVariation).toFixed(1)}% par rapport au mois précédent</li>`;
      }
    });

    insightsHtml += '</ul>';
  }

  // Insights spécifiques aux catégories
  if (data.categoryFilter === 'all' && Object.keys(data.categorySeasonalData).length > 0) {
    // Trouver les catégories les plus affectées par la saisonnalité
    const categorySeasonality = [];

    Object.entries(data.categorySeasonalData).forEach(([category, seasonData]) => {
      if (seasonData.total < 10) return; // Ignorer les catégories avec trop peu de données

      const maxSeason = Object.entries(seasonData)
        .filter(([key]) => key !== 'total')
        .sort((a, b) => b[1] - a[1])[0];

      const percentage = (maxSeason[1] / seasonData.total * 100).toFixed(1);

      if (percentage > 35) { // Seuil pour la saisonnalité significative
        categorySeasonality.push({
          category,
          season: maxSeason[0],
          percentage
        });
      }
    });

    if (categorySeasonality.length > 0) {
      categorySeasonality.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

      insightsHtml += '<p>Certains types de crimes montrent une forte saisonnalité:</p><ul>';

      categorySeasonality.slice(0, 3).forEach(item => {
        const seasonName =
          item.season === 'winter' ? 'l\'hiver' :
            item.season === 'spring' ? 'le printemps' :
              item.season === 'summer' ? 'l\'été' : 'l\'automne';

        insightsHtml += `<li>Les <strong>${formatCategoryName(item.category)}</strong> sont plus fréquents pendant ${seasonName} (${item.percentage}%)</li>`;
      });

      insightsHtml += '</ul>';
    }
  }

  // Mettre à jour le contenu des insights
  insightsContent.innerHTML = insightsHtml;
}

/**
* Affiche un résumé pour chaque saison
* 
* @param {Object} data Les données traitées
*/
function displaySeasonalSummary(data) {
  const seasonalCards = document.querySelector('.seasonal-cards');
  seasonalCards.innerHTML = '';

  // Données pour chaque saison
  const seasons = [
    { name: 'Hiver', key: 'winter', color: '#2196F3', months: [11, 0, 1] },
    { name: 'Printemps', key: 'spring', color: '#4CAF50', months: [2, 3, 4] },
    { name: 'Été', key: 'summer', color: '#FF9800', months: [5, 6, 7] },
    { name: 'Automne', key: 'autumn', color: '#795548', months: [8, 9, 10] }
  ];

  // Extraire les valeurs de saison pour faciliter les comparaisons
  const seasonCounts = [
    data.seasonalData.winter,
    data.seasonalData.spring,
    data.seasonalData.summer,
    data.seasonalData.autumn
  ];

  const maxSeasonIndex = seasonCounts.indexOf(Math.max(...seasonCounts));
  const minSeasonIndex = seasonCounts.indexOf(Math.min(...seasonCounts));

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Créer une carte pour chaque saison
  seasons.forEach((season, index) => {
    const card = document.createElement('div');
    card.className = `season-card season-card-${season.key}`;

    // Calculer les statistiques pour cette saison
    const seasonCount = data.seasonalData[season.key];
    const percentage = (seasonCount / data.totalCrimes * 100).toFixed(1);

    // Trouver le mois le plus actif dans cette saison
    const seasonMonths = season.months;
    const monthCounts = seasonMonths.map(m => data.monthlyData[m]);
    const maxMonthIndex = seasonMonths[monthCounts.indexOf(Math.max(...monthCounts))];
    const maxMonthName = monthNames[maxMonthIndex];
    const maxMonthCount = data.monthlyData[maxMonthIndex];

    // Contenu de la carte
    card.innerHTML = `
      <h4>${season.name}</h4>
      <div class="season-content">
        <div class="season-stat">
          <strong>${seasonCount}</strong> crimes (${percentage}% du total)
        </div>
        <div class="season-stat">
          Pic : <strong>${maxMonthName}</strong> (${maxMonthCount} crimes)
        </div>
        <div class="season-trend">
          ${index === maxSeasonIndex ? '☝️ Saison la plus active' :
        index === minSeasonIndex ? '👇 Saison la moins active' : ''}
        </div>
      </div>
    `;

    seasonalCards.appendChild(card);
  });
}

/**
* Affiche une infobulle
* 
* @param {Event} event L'événement de survol
* @param {Object} data Les données à afficher
*/
function showTooltip(event, data) {
  // Créer l'infobulle si elle n'existe pas
  if (!document.querySelector('.season-tooltip')) {
    const tooltip = document.createElement('div');
    tooltip.className = 'season-tooltip';
    document.body.appendChild(tooltip);
  }

  // Récupérer l'infobulle
  const tooltip = document.querySelector('.season-tooltip');

  // Contenu de l'infobulle
  let tooltipContent = `
<div style="font-weight: bold; margin-bottom: 5px;">
  ${data.title}
</div>
<div>
  Nombre: <strong>${data.count}</strong><br>
  Pourcentage: ${data.percentage}
</div>
`;

  if (data.season) {
    tooltipContent += `<div>Saison: <strong>${data.season}</strong></div>`;
  }

  tooltip.innerHTML = tooltipContent;

  // Positionner l'infobulle
  tooltip.style.left = (event.pageX + 10) + 'px';
  tooltip.style.top = (event.pageY - 28) + 'px';
  tooltip.style.opacity = 1;
}

/**
* Cache l'infobulle
*/
function hideTooltip() {
  const tooltip = document.querySelector('.season-tooltip');
  if (tooltip) {
    tooltip.style.opacity = 0;
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