/**
 * @file harmonizedStyle.js - Module pour harmoniser le style des visualisations
 */

/**
 * Ajoute les styles CSS pour le graphe principal, harmonisé avec les autres visualisations
 */
export function addHarmonizedStyles() {
  // Vérifier si les styles existent déjà
  if (document.getElementById('harmonized-styles')) return;

  const style = document.createElement('style');
  style.id = 'harmonized-styles';
  style.textContent = `
      /* Styles communs pour tous les onglets */
      .tab-content {
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      
      /* Styles pour les titres de visualisation */
      .visualization-title {
        margin-top: 0;
        margin-bottom: 10px;
        text-align: center;
        font-size: 24px;
        color: #333;
      }
      
      /* Styles pour les descriptions de visualisation */
      .visualization-description {
        text-align: center;
        margin-bottom: 20px;
        color: #666;
        font-size: 16px;
      }
      
      /* Styles pour le conteneur de carte principale */
      .main-map-container {
        background-color: white;
        border-radius: 5px;
        padding: 15px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        position: relative; /* Pour le positionnement des filtres */
      }
      
      /* Styles pour le panel d'information */
      #panel {
        border: 1px solid #ddd;
        background-color: white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        padding: 15px;
        border-radius: 5px;
        max-width: 300px;
      }
      
      /* Styles pour la légende */
      .legend {
        margin-top: 10px;
        padding: 10px;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      /* Styles pour les filtres à l'intérieur de .graph */
      .graph .filter-container {
        background-color: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        position: absolute;
        top: 10px;
        left: 10px;
        width: calc(100% - 20px);
        max-width: 300px;
        z-index: 1000;
        background-color: rgba(255, 255, 255, 0.9);
      }
      
      .graph .filter-title {
        margin: 0 0 10px 0;
        text-align: center;
        font-size: 16px;
        color: #333;
      }
      
      .graph .filter-flex {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 10px;
      }
      
      .graph .filter-group {
        display: flex;
        flex-direction: column;
      }
      
      .graph .filter-group label {
        margin-bottom: 3px;
        font-weight: bold;
        font-size: 13px;
        color: #555;
      }
      
      .graph .filter-group select {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 13px;
      }
      
      .graph .reset-button {
        background-color: #4285F4;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        display: block;
        margin: 0 auto;
        transition: background-color 0.3s;
      }
      
      .graph .reset-button:hover {
        background-color: #3367D6;
      }
      
      /* Style pour le conteneur principal */
      .viz-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      /* Style spécifique pour la carte SVG */
      .graph svg {
        background-color: white;
        border-radius: 5px;
      }
    `;

  document.head.appendChild(style);
}

/**
 * Applique un style harmonisé à la carte principale
 */
export function applyHarmonizedMainMapStyle() {
  // Créer un conteneur stylisé pour la carte principale si ce n'est pas déjà fait
  let mainMapContainer = document.querySelector('.main-map-container');

  if (!mainMapContainer) {
    // Sélectionner le conteneur de la carte
    const graphElement = document.querySelector('.graph');
    const parentElement = graphElement.parentElement;

    // Créer le nouveau conteneur
    mainMapContainer = document.createElement('div');
    mainMapContainer.className = 'main-map-container';

    // Déplacer la carte dans le nouveau conteneur
    parentElement.insertBefore(mainMapContainer, graphElement);
    mainMapContainer.appendChild(graphElement);
  }

  // Mettre à jour le titre et la description
  let titleHeader = document.querySelector('.main-map-title');
  if (!titleHeader) {
    titleHeader = document.createElement('h2');
    titleHeader.className = 'visualization-title main-map-title';
    titleHeader.textContent = 'Carte des Crimes par PDQ à Montréal';
    mainMapContainer.insertBefore(titleHeader, mainMapContainer.firstChild);
  } else {
    titleHeader.className = 'visualization-title main-map-title';
  }

  let description = document.querySelector('.main-map-description');
  if (!description) {
    description = document.createElement('div');
    description.className = 'visualization-description main-map-description';
    description.textContent = 'Cliquez sur un PDQ pour voir les statistiques détaillées.';
    mainMapContainer.insertBefore(description, mainMapContainer.children[1]);
  } else {
    description.className = 'visualization-description main-map-description';
  }

  // Supprimer les anciens titres s'ils existent
  const oldTitles = document.querySelectorAll('.title, .subtitle');
  oldTitles.forEach(title => title.remove());
}