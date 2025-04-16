'use strict'

import * as helper from './scripts/helper.js'
import * as viz from './scripts/viz.js'
import * as preprocess from './scripts/preprocess.js'
import * as legend from './scripts/legend.js'
import * as panel from './scripts/panel.js'
import * as filters from './scripts/filters.js'
import * as crimeAnalysis from './scripts/crimeAnalysis.js'
import * as evolutionMap from './scripts/evolutionMap.js'
import * as crimeHeatmap from './scripts/crimeHeatmap.js'
import * as vizTabs from './scripts/vizTabs.js'
import * as harmonizedStyle from './scripts/harmonizedStyle.js'
import * as additionalViz from './scripts/additionalViz.js'
import * as advancedAnalysis from './scripts/additionalAnalysis.js'
import csvUrl from './actescriminels_avec_categorie_vol.csv';
import * as heatMap from './scripts/heatmap.js';


function styleLegend() {
  // Ajouter des styles CSS pour la légende
  const style = document.createElement('style')
  style.textContent = `
    .main-svg .legend {
      transform: translate(50px, 200px);
    }
  `
  document.head.appendChild(style)
}

/**
 * @file This file is the entry-point for the visualization of Montreal PDQ map with crime data.
 */

(function (d3) {
  const svgSize = {
    width: 900,
    height: 625
  }

  helper.setCanvasSize(svgSize.width, svgSize.height)
  helper.generateMapG(svgSize.width, svgSize.height)
  helper.generateMarkerG(svgSize.width, svgSize.height)
  helper.appendGraphLabels(d3.select('.main-svg'), 'Carte des Crimes par PDQ à Montréal')
  helper.initPanelDiv()

  // Variables globales pour stocker les données
  let pdqData = null;
  let crimeData = null;
  const currentFilters = {
    category: 'all',
    year: 'all',
    quarter: 'all'
  };

  // Initialiser les filtres vides (ils seront remplis une fois les données chargées)
  filters.initializeFilters(currentFilters, updateMainVisualization);

  // Créer un conteneur pour la visualisation d'évolution
  const evolutionContainer = document.createElement('div');
  evolutionContainer.id = 'evolution-viz-container';
  document.querySelector('.viz-container').appendChild(evolutionContainer);

  // Créer un conteneur pour la carte de chaleur des hotspots criminels
  const heatmapContainer = document.createElement('div');
  heatmapContainer.id = 'heatmap-container';
  document.querySelector('.viz-container').appendChild(heatmapContainer);
  // Créer un conteneur pour second-heatmap-container
  const secondHeatmapContainer = document.createElement('div');
  secondHeatmapContainer.id = 'second-heatmap-container';
  document.querySelector('.viz-container').appendChild(secondHeatmapContainer);
  build()

  /**
   * Cette fonction construit le graphique et charge les données.
   */
  function build() {
    var projection = helper.getProjection()
    var path = helper.getPath(projection)

    // Chargement des limites des PDQ
    d3.json('code/src/limitespdq copy.geojson').then(function (data) {
      data = preprocess.reverseGeoJsonCoordinates(data)
      pdqData = data;

      // Chargement des données criminelles
      d3.csv(csvUrl, d3.autoType).then(function (crimes) {
        crimeData = crimes;
        console.log("Crime Data:", crimes)

        // Prétraitement des données criminelles
        const processedData = crimeAnalysis.processCrimeData(crimes);

        // Mise à jour des filtres avec les valeurs disponibles
        filters.updateFilterOptions(processedData.categories,
          processedData.years,
          ['jour', 'soir', 'nuit']);

        // Fusionner les données de crime avec les données géographiques
        const mergedData = crimeAnalysis.mergeCrimeWithGeoData(pdqData, processedData.byPDQ);

        // Créer l'échelle de couleur du vert au rouge (5 niveaux)
        const colorScale = crimeAnalysis.createColorScale(processedData.byPDQ);

        // Afficher la carte avec les données de crime
        viz.mapPDQWithCrimeData(mergedData, path, colorScale, viz.showPDQLabel, panel);

        // Ajouter la légende
        legend.drawCrimeLegend(colorScale, d3.select('.main-svg'));

        // Créer la carte d'évolution en passant les catégories de crimes
        evolutionMap.createEvolutionMap(
          mergedData,
          path,
          processedData.years,
          document.getElementById('evolution-viz-container'),
          processedData.categories
        );

        // Créer la carte de chaleur des hotspots criminels
        crimeHeatmap.createCrimeHeatmap(
          crimes,
          document.getElementById('heatmap-container')
        );
        // Appeler la fonction createHeatmap pour le second heatmap
        heatMap.createHeatmap(csvUrl, 'second-heatmap-container');  // Ajout du conteneur second-heatmap-container
        console.log("Visualisation initialisée avec succès.");

        // Appliquer le style harmonisé à la carte principale
        harmonizedStyle.addHarmonizedStyles();
        harmonizedStyle.applyHarmonizedMainMapStyle();
        styleLegend();

        // Initialiser le système d'onglets APRÈS que toutes les visualisations sont créées
        vizTabs.initializeVisualizationTabs();

        // Initialiser les visualisations additionnelles avec leur propre système d'onglets
        additionalViz.initializeAdditionalVisualizations(crimes);

        // Initialiser les analyses avancées avec leur propre système d'onglets
        advancedAnalysis.initializeAdvancedAnalysis(crimes);

        // Structure des titres
        setupTitleStructure();
      }).catch(function (error) {
        console.error("Erreur lors du chargement des données criminelles:", error);
      });
    }).catch(function (error) {
      console.error("Erreur lors du chargement du fichier GeoJSON:", error);
    });
  }

  /**
   * Fonction pour mettre à jour la visualisation principale quand les filtres changent
   */
  function updateMainVisualization() {
    if (!pdqData || !crimeData) return; // Ne pas mettre à jour si les données ne sont pas chargées

    console.log("Mise à jour de la visualisation avec les filtres:", currentFilters);

    // Filtrer les données selon les filtres actuels
    const filteredCrimes = crimeAnalysis.filterCrimeData(crimeData, currentFilters);

    // Recalculer les statistiques
    const processedData = crimeAnalysis.processCrimeData(filteredCrimes);

    // Fusionner avec les données géographiques
    const mergedData = crimeAnalysis.mergeCrimeWithGeoData(pdqData, processedData.byPDQ);

    // Mettre à jour l'échelle de couleur
    const colorScale = crimeAnalysis.createColorScale(processedData.byPDQ);

    // Réinitialiser et redessiner la carte
    d3.select('#map-g').selectAll('*').remove();
    viz.mapPDQWithCrimeData(mergedData, helper.getPath(helper.getProjection()),
      colorScale, viz.showPDQLabel, panel);

    // Mettre à jour la légende
    d3.select('.legend').remove();
    legend.drawCrimeLegend(colorScale, d3.select('.main-svg'));
  }
})(d3)

function setupTitleStructure() {
  // Supprimer les anciens titres créés par helper.appendGraphLabels
  d3.select('.main-svg .title').remove();
  d3.select('.main-svg .subtitle').remove();

  // Récupérer la div .graph
  const graphElement = document.querySelector('.graph');
  if (!graphElement) return;

  // Créer le titre principal (avant les filtres)
  const mainTitle = document.createElement('div');
  mainTitle.className = 'main-title';
  mainTitle.style.textAlign = 'center';
  mainTitle.style.fontSize = '20px';
  mainTitle.style.fontWeight = 'bold';
  mainTitle.style.margin = '10px 0 20px 0';
  mainTitle.textContent = 'Carte des Crimes par PDQ à Montréal';

  // Créer le conteneur pour les filtres
  const filtersBar = document.getElementById('filters-bar');

  // Créer le sous-titre et sous-sous-titre (après les filtres)
  const subTitle = document.createElement('div');
  subTitle.className = 'sub-title';
  subTitle.style.textAlign = 'center';
  subTitle.style.fontSize = '18px';
  subTitle.style.fontWeight = 'bold';
  subTitle.style.margin = '20px 0 5px 0';
  subTitle.textContent = 'Crimes par PDQ';

  const subSubtitle = document.createElement('div');
  subSubtitle.className = 'sub-subtitle';
  subSubtitle.style.textAlign = 'center';
  subSubtitle.style.fontSize = '14px';
  subSubtitle.style.color = '#666';
  subSubtitle.style.margin = '0 0 20px 0';
  subSubtitle.textContent = 'Cliquez sur un PDQ pour voir les statistiques détaillées.';

  // Ajouter le titre principal au début du conteneur
  if (graphElement.firstChild) {
    graphElement.insertBefore(mainTitle, graphElement.firstChild);
  } else {
    graphElement.appendChild(mainTitle);
  }

  // Après les filtres, ajouter le sous-titre et sous-sous-titre
  if (filtersBar) {
    // Insérer après les filtres
    if (filtersBar.nextSibling) {
      graphElement.insertBefore(subTitle, filtersBar.nextSibling);
      graphElement.insertBefore(subSubtitle, subTitle.nextSibling);
    } else {
      // Ou à la fin si les filtres sont le dernier élément
      graphElement.appendChild(subTitle);
      graphElement.appendChild(subSubtitle);
    }
  }
}