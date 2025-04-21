/**
 * @file vizTabs.js - Module pour gérer les onglets de visualisation
 * Ce fichier crée un système d'onglets pour basculer entre les différentes visualisations
 */

/**
 * Initialise le système d'onglets pour les visualisations
 */
export function initializeVisualizationTabs() {
  console.log("Initialisation du système d'onglets...");

  // Créer le conteneur principal pour toutes les visualisations
  const vizContainer = document.querySelector('.viz-container');

  // Récupérer le conteneur de filtres existant
  const filterContainer = document.getElementById('filter-container');

  // Créer le conteneur des onglets
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'visualization-tabs';
  tabsContainer.innerHTML = `
    <div class="tabs-header">
      <button class="tab-button active" data-viz="main-map">Carte des PDQ</button>
      <button class="tab-button" data-viz="evolution-map">Évolution Temporelle</button>
      <button class="tab-button" data-viz="heatmap">Carte de Chaleur</button>
    </div>
  `;

  // 1. Conteneur pour la carte principale (déjà existant)
  const mainMapContainer = document.querySelector('.graph').parentElement;

  // Si un conteneur de filtres existe, le déplacer à l'intérieur du conteneur .graph
  if (filterContainer) {
    // Le retirer de sa position actuelle
    if (filterContainer.parentElement) {
      filterContainer.parentElement.removeChild(filterContainer);
    }

    // Récupérer l'élément .graph
    const graphElement = document.querySelector('.graph');

    // L'insérer au début de l'élément .graph
    if (graphElement) {
      graphElement.insertBefore(filterContainer, graphElement.firstChild);

      // Ajuster le style du conteneur de filtres pour qu'il s'intègre bien dans .graph
      filterContainer.style.position = 'absolute';
      filterContainer.style.zIndex = '1000';
      filterContainer.style.top = '10px';
      filterContainer.style.left = '10px';
      filterContainer.style.width = 'calc(100% - 20px)';
      filterContainer.style.maxWidth = '300px';
      filterContainer.style.background = 'rgba(255, 255, 255, 0.9)';
    }
  }

  mainMapContainer.classList.add('tab-content', 'main-map-tab');
  mainMapContainer.dataset.viz = 'main-map';

  // 2. Conteneur pour la carte d'évolution
  const evolutionMapContainer = document.getElementById('evolution-viz-container');
  evolutionMapContainer.classList.add('tab-content', 'evolution-map-tab');
  evolutionMapContainer.dataset.viz = 'evolution-map';
  evolutionMapContainer.style.display = 'none';

  // 3. Conteneur pour la carte de chaleur
  const heatmapContainer = document.getElementById('heatmap-container');
  heatmapContainer.classList.add('tab-content', 'heatmap-tab');
  heatmapContainer.dataset.viz = 'heatmap';
  heatmapContainer.style.display = 'none';

  // Réorganisation des éléments dans le DOM
  vizContainer.insertBefore(tabsContainer, vizContainer.firstChild);

  // Ajouter les gestionnaires d'événements pour les onglets
  addTabEventListeners();

  // Ajouter les styles CSS pour les onglets
  addTabStyles();

  console.log("Système d'onglets initialisé avec succès!");
}

/**
 * Ajoute les gestionnaires d'événements pour les onglets
 */
function addTabEventListeners() {
  // Sélectionner tous les boutons d'onglets
  const tabButtons = document.querySelectorAll('.tab-button');

  // Ajouter un gestionnaire d'événement pour chaque bouton
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Récupérer l'ID de la visualisation à afficher
      const vizId = button.dataset.viz;

      // Masquer toutes les visualisations
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
      });

      // Afficher la visualisation sélectionnée
      document.querySelector(`.tab-content[data-viz="${vizId}"]`).style.display = 'block';

      // Mettre à jour la classe active des boutons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Déclencher un événement de redimensionnement pour assurer que la carte se redessine correctement
      window.dispatchEvent(new Event('resize'));

      // Si l'onglet actif est la carte de chaleur, redimensionner la carte Leaflet
      if (vizId === 'heatmap' && window.crimeHeatmap && window.crimeHeatmap.map) {
        // Attendre un court délai pour s'assurer que la carte est visible
        setTimeout(() => {
          window.crimeHeatmap.map.invalidateSize();
        }, 100);
      }
    });
  });
}

/**
 * Ajoute les styles CSS pour les onglets
 */
function addTabStyles() {
  // Vérifier si les styles existent déjà
  if (document.getElementById('viz-tabs-styles')) return;

  const style = document.createElement('style');
  style.id = 'viz-tabs-styles';
  style.textContent = `
    .visualization-tabs {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .tabs-header {
      display: flex;
      border-bottom: 2px solid #4285F4;
      margin-bottom: 20px;
    }
    
    .tab-button {
      padding: 12px 24px;
      background-color: #f5f5f5;
      border: none;
      border-radius: 5px 5px 0 0;
      margin-right: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
      outline: none;
      color: #555;
    }
    
    .tab-button:hover {
      background-color: #e0e0e0;
      color: blue;
    }
    
    .tab-button.active {
      background-color: #4285F4;
      color: white;
      font-weight: bold;
    }
    
    .tab-content {
      background-color: #fff;
      border-radius: 0 0 5px 5px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    /* Styles spécifiques pour chaque type de visualisation */
    .main-map-tab, .evolution-map-tab, .heatmap-tab {
      transition: opacity 0.3s ease;
    }
    
    /* Assurez-vous que les SVG remplissent correctement leur conteneur */
    .tab-content svg {
      max-width: 100%;
      height: auto;
    }
    
    /* Style pour le conteneur principal */
    .viz-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    /* Styles pour le conteneur de filtres dans .graph */
    .graph .filter-container {
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .graph .filter-title {
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .graph .filter-group {
      margin-bottom: 10px;
    }
    
    .graph .filter-group label {
      font-size: 13px;
    }
    
    .graph .filter-group select {
      font-size: 13px;
      padding: 5px;
    }
    
    .graph .reset-button {
      font-size: 13px;
      padding: 5px 10px;
    }
  `;

  document.head.appendChild(style);
}