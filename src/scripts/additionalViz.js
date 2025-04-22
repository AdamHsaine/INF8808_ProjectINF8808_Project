/**
 * Module pour l'intégration des visualisations additionnelles
 * Ce module permet d'ajouter un second système d'onglets pour les visualisations supplémentaires
 */

import { createCrimeCategoriesChart } from './crimeCategories.js'
import { createCrimeTrendsChart } from './crimeTrends.js'
import { createMonthlyHeatmap } from './monthlyHeatmap.js'

/**
 * Initialise toutes les visualisations additionnelles dans un système d'onglets séparé
 *
 * @param {Array} crimeData Les données des crimes
 */
export function initializeAdditionalVisualizations (crimeData) {
  console.log("Initialisation des visualisations additionnelles avec système d'onglets séparé...")

  // Créer un séparateur visuel
  createSeparator()

  // Créer la section des visualisations additionnelles
  createAdditionalSection()

  // Initialiser chaque visualisation
  createCrimeCategoriesChart(crimeData, document.getElementById('categories-chart-container'))
  createCrimeTrendsChart(crimeData, document.getElementById('trends-chart-container'))
  createMonthlyHeatmap(crimeData, document.getElementById('monthly-heatmap-container'))

  console.log('Visualisations additionnelles initialisées avec succès.')
}

/**
 * Crée un séparateur visuel entre les deux systèmes d'onglets
 */
function createSeparator () {
  const vizContainer = document.querySelector('.viz-container')

  const separator = document.createElement('div')
  separator.className = 'visualizations-separator'
  separator.innerHTML = `
    <hr style="margin: 40px 0 20px 0; border: none; height: 2px; background-color: #4285F4;">
    <h2 style="text-align: center; margin: 20px 0; color: #333; font-size: 24px;">Analyses temporelles</h2>
  `

  vizContainer.appendChild(separator)

  // Ajouter les styles pour le séparateur
  addSeparatorStyles()
}

/**
 * Ajoute les styles pour le séparateur
 */
function addSeparatorStyles () {
  const style = document.createElement('style')
  style.id = 'separator-styles'
  style.textContent = `
    .visualizations-separator {
      width: 100%;
      position: relative;
      margin-top: 30px;
    }
    
    .visualizations-separator h2 {
      position: relative;
      margin: 20px 0;
      font-family: 'Roboto', sans-serif;
    }
    
    .visualizations-separator h2:before,
    .visualizations-separator h2:after {
      content: "";
      position: absolute;
      height: 2px;
      background-color: #4285F4;
      top: 50%;
      width: 50px;
    }
    
    .visualizations-separator h2:before {
      left: -60px;
    }
    
    .visualizations-separator h2:after {
      right: -60px;
    }
  `

  document.head.appendChild(style)
}

/**
 * Crée la section des visualisations additionnelles avec son propre système d'onglets
 */
function createAdditionalSection () {
  const vizContainer = document.querySelector('.viz-container')

  // Créer le conteneur principal pour les visualisations supplémentaires
  const additionalSection = document.createElement('div')
  additionalSection.className = 'additional-visualizations'

  // Créer le système d'onglets supplémentaire
  additionalSection.innerHTML = `
    <div class="additional-tabs">
      <div class="additional-tabs-header">
        <button class="additional-tab-button active" data-tab="categories">Évolution annuelle</button>
        <button class="additional-tab-button" data-tab="trends">Tendances temporelles</button>
        <button class="additional-tab-button" data-tab="monthly-heatmap">Évolution par quartier</button>
      </div>
    </div>
    <div class="additional-content-container">
      <div id="categories-chart-container" class="additional-tab-content" data-tab="categories"></div>
      <div id="trends-chart-container" class="additional-tab-content" data-tab="trends" style="display: none;"></div>
      <div id="monthly-heatmap-container" class="additional-tab-content" data-tab="monthly-heatmap" style="display: none;"></div>
    </div>
  `

  vizContainer.appendChild(additionalSection)

  // Ajouter les styles pour le nouveau système d'onglets
  addAdditionalTabsStyles()

  // Ajouter les gestionnaires d'événements pour les onglets supplémentaires
  setupAdditionalTabsEventHandlers()
}

/**
 * Ajoute les styles pour le système d'onglets supplémentaire
 */
function addAdditionalTabsStyles () {
  // Vérifier si les styles existent déjà
  if (document.getElementById('additional-tabs-styles')) return

  const style = document.createElement('style')
  style.id = 'additional-tabs-styles'
  style.textContent = `
    .additional-visualizations {
      margin-top: 20px;
      margin-bottom: 40px;
    }
    
    .additional-tabs {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .additional-tabs-header {
      display: flex;
      border-bottom: 2px solid #34A853;
      margin-bottom: 20px;
    }
    
    .additional-tab-button {
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
    
    .additional-tab-button:hover {
      background-color: #e0e0e0;
    }
    
    .additional-tab-button.active {
      background-color: #34A853;
      color: white;
      font-weight: bold;
    }
    
    .additional-content-container {
      background-color: #fff;
      border-radius: 0 0 5px 5px;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .additional-tab-content {
      transition: opacity 0.3s ease;
    }
    
    /* Style différent pour distinguer des onglets principaux */
    .additional-tabs-header {
      justify-content: center;
    }
    
    .additional-tab-button {
      min-width: 160px;
      text-align: center;
    }
  `

  document.head.appendChild(style)
}

/**
 * Configure les gestionnaires d'événements pour les onglets supplémentaires
 */
function setupAdditionalTabsEventHandlers () {
  // Sélectionner tous les boutons d'onglets supplémentaires
  const additionalTabButtons = document.querySelectorAll('.additional-tab-button')

  // Ajouter un gestionnaire d'événement pour chaque bouton
  additionalTabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Récupérer l'ID de l'onglet à afficher
      const tabId = button.dataset.tab

      // Masquer tous les contenus d'onglets
      document.querySelectorAll('.additional-tab-content').forEach(content => {
        content.style.display = 'none'
      })

      // Afficher le contenu de l'onglet sélectionné
      document.querySelector(`.additional-tab-content[data-tab="${tabId}"]`).style.display = 'block'

      // Mettre à jour la classe active des boutons
      additionalTabButtons.forEach(btn => btn.classList.remove('active'))
      button.classList.add('active')

      // Déclencher un redimensionnement si nécessaire
      window.dispatchEvent(new Event('resize'))
    })
  })
}
