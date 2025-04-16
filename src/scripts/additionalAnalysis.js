// /**
//  * Module pour créer un troisième système d'onglets avec des analyses avancées
//  * Ce module répond aux questions analytiques spécifiques sur les crimes
//  */

// import { createCrimeEvolutionAnalysis } from './crimeEvolution.js';
// import { createCrimeImpactAnalysis } from './crimeImpact.js';
// import { createCrimeCorrelationAnalysis } from './crimeCorrelation.js';
// import { createSeasonalImpactAnalysis } from './seasonalImpact.js';

// /**
//  * Initialise le système d'onglets d'analyse avancée et les visualisations correspondantes
//  * 
//  * @param {Array} crimeData Les données des crimes
//  */
// export function initializeAdvancedAnalysis(crimeData) {
//     console.log("Initialisation du système d'analyse avancée...");

//     // Créer un séparateur visuel
//     createAdvancedSeparator();

//     // Créer la section des analyses avancées
//     createAdvancedSection();

//     // Initialiser chaque visualisation d'analyse
//     createCrimeEvolutionAnalysis(crimeData, document.getElementById('crime-evolution-container'));
//     createCrimeImpactAnalysis(crimeData, document.getElementById('crime-impact-container'));
//     createCrimeCorrelationAnalysis(crimeData, document.getElementById('crime-correlation-container'));
//     createSeasonalImpactAnalysis(crimeData, document.getElementById('seasonal-impact-container'));

//     console.log("Analyses avancées initialisées avec succès.");
// }

// /**
//  * Crée un séparateur visuel pour le troisième système d'onglets
//  */
// function createAdvancedSeparator() {
//     const vizContainer = document.querySelector('.viz-container');

//     const separator = document.createElement('div');
//     separator.className = 'advanced-analysis-separator';
//     separator.innerHTML = `
//     <hr style="margin: 50px 0 20px 0; border: none; height: 2px; background-color: #FB8C00;">
//     <h2 style="text-align: center; margin: 20px 0; color: #333; font-size: 24px;">Analyses Avancées</h2>
//   `;

//     vizContainer.appendChild(separator);

//     // Ajouter les styles pour le séparateur
//     addAdvancedSeparatorStyles();
// }

// /**
//  * Ajoute les styles pour le séparateur des analyses avancées
//  */
// function addAdvancedSeparatorStyles() {
//     const style = document.createElement('style');
//     style.id = 'advanced-separator-styles';
//     style.textContent = `
//     .advanced-analysis-separator {
//       width: 100%;
//       position: relative;
//       margin-top: 40px;
//     }
    
//     .advanced-analysis-separator h2 {
//       position: relative;
//       margin: 20px 0;
//       font-family: 'Roboto', sans-serif;
//     }
    
//     .advanced-analysis-separator h2:before,
//     .advanced-analysis-separator h2:after {
//       content: "";
//       position: absolute;
//       height: 2px;
//       background-color: #FB8C00;
//       top: 50%;
//       width: 50px;
//     }
    
//     .advanced-analysis-separator h2:before {
//       left: -60px;
//     }
    
//     .advanced-analysis-separator h2:after {
//       right: -60px;
//     }
//   `;

//     document.head.appendChild(style);
// }

// /**
//  * Crée la section des analyses avancées avec son propre système d'onglets
//  */
// function createAdvancedSection() {
//     const vizContainer = document.querySelector('.viz-container');

//     // Créer le conteneur principal pour les analyses avancées
//     const advancedSection = document.createElement('div');
//     advancedSection.className = 'advanced-analysis-section';

//     // Créer le système d'onglets pour les analyses avancées
//     advancedSection.innerHTML = `
//     <div class="advanced-tabs">
//       <div class="advanced-tabs-header">
//         <button class="advanced-tab-button active" data-tab="crime-evolution">
//           <i class="tab-icon evolution-icon"></i>
//           Évolution des types de crimes
//         </button>
//         <button class="advanced-tab-button" data-tab="crime-impact">
//           <i class="tab-icon impact-icon"></i>
//           Impact sur la sécurité
//         </button>
//         <button class="advanced-tab-button" data-tab="crime-correlation">
//           <i class="tab-icon correlation-icon"></i>
//           Corrélations temporelles
//         </button>
//         <button class="advanced-tab-button" data-tab="seasonal-impact">
//           <i class="tab-icon seasonal-icon"></i>
//           Impact des saisons
//         </button>
//       </div>
//     </div>
//     <div class="advanced-content-container">
//       <div id="crime-evolution-container" class="advanced-tab-content" data-tab="crime-evolution"></div>
//       <div id="crime-impact-container" class="advanced-tab-content" data-tab="crime-impact" style="display: none;"></div>
//       <div id="crime-correlation-container" class="advanced-tab-content" data-tab="crime-correlation" style="display: none;"></div>
//       <div id="seasonal-impact-container" class="advanced-tab-content" data-tab="seasonal-impact" style="display: none;"></div>
//     </div>
//   `;

//     vizContainer.appendChild(advancedSection);

//     // Ajouter les styles pour le nouveau système d'onglets
//     addAdvancedTabsStyles();

//     // Ajouter les gestionnaires d'événements pour les onglets
//     setupAdvancedTabsEventHandlers();
// }

// /**
//  * Ajoute les styles pour le système d'onglets d'analyses avancées
//  */
// function addAdvancedTabsStyles() {
//     // Vérifier si les styles existent déjà
//     if (document.getElementById('advanced-tabs-styles')) return;

//     const style = document.createElement('style');
//     style.id = 'advanced-tabs-styles';
//     style.textContent = `
//     .advanced-analysis-section {
//       margin-top: 20px;
//       margin-bottom: 40px;
//     }
    
//     .advanced-tabs {
//       width: 100%;
//       margin-bottom: 20px;
//     }
    
//     .advanced-tabs-header {
//       display: flex;
//       border-bottom: 2px solid #FB8C00;
//       margin-bottom: 20px;
//       flex-wrap: wrap;
//       justify-content: center;
//     }
    
//     .advanced-tab-button {
//       padding: 12px 20px;
//       background-color: #f5f5f5;
//       border: none;
//       border-radius: 5px 5px 0 0;
//       margin-right: 5px;
//       margin-bottom: 5px;
//       cursor: pointer;
//       font-size: 15px;
//       transition: all 0.3s ease;
//       outline: none;
//       color: #555;
//       display: flex;
//       align-items: center;
//     }
    
//     .advanced-tab-button:hover {
//       background-color: #e0e0e0;
//     }
    
//     .advanced-tab-button.active {
//       background-color: #FB8C00;
//       color: white;
//       font-weight: bold;
//     }
    
//     .advanced-content-container {
//       background-color: #fff;
//       border-radius: 0 0 5px 5px;
//       padding: 10px;
//       box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//     }
    
//     .advanced-tab-content {
//       transition: opacity 0.3s ease;
//     }
    
//     /* Icônes pour les onglets */
//     .tab-icon {
//       display: inline-block;
//       width: 20px;
//       height: 20px;
//       margin-right: 8px;
//       background-size: contain;
//       background-repeat: no-repeat;
//       background-position: center;
//     }
    
//     .evolution-icon {
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FB8C00'%3E%3Cpath d='M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z'/%3E%3C/svg%3E");
//     }
    
//     .impact-icon {
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FB8C00'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
//     }
    
//     .correlation-icon {
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FB8C00'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'/%3E%3C/svg%3E");
//     }
    
//     .seasonal-icon {
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FB8C00'%3E%3Cpath d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'/%3E%3C/svg%3E");
//     }
    
//     .active .evolution-icon,
//     .active .impact-icon,
//     .active .correlation-icon,
//     .active .seasonal-icon {
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z'/%3E%3C/svg%3E");
//     }
    
//     .active .impact-icon {
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
//     }
    
//     .active .correlation-icon {
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'/%3E%3C/svg%3E");
//     }
    
//     .active .seasonal-icon {
//       background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'/%3E%3C/svg%3E");
//     }
    
//     /* Styles pour les vues mobiles */
//     @media (max-width: 768px) {
//       .advanced-tabs-header {
//         flex-direction: column;
//       }
      
//       .advanced-tab-button {
//         width: 100%;
//         margin-right: 0;
//         border-radius: 0;
//       }
      
//       .advanced-tab-button:first-child {
//         border-radius: 5px 5px 0 0;
//       }
//     }
//   `;

//     document.head.appendChild(style);
// }

// /**
//  * Configure les gestionnaires d'événements pour les onglets d'analyses avancées
//  */
// function setupAdvancedTabsEventHandlers() {
//     // Sélectionner tous les boutons d'onglets
//     const advancedTabButtons = document.querySelectorAll('.advanced-tab-button');

//     // Ajouter un gestionnaire d'événement pour chaque bouton
//     advancedTabButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             // Récupérer l'ID de l'onglet à afficher
//             const tabId = button.dataset.tab;

//             // Masquer tous les contenus d'onglets
//             document.querySelectorAll('.advanced-tab-content').forEach(content => {
//                 content.style.display = 'none';
//             });

//             // Afficher le contenu de l'onglet sélectionné
//             document.querySelector(`.advanced-tab-content[data-tab="${tabId}"]`).style.display = 'block';

//             // Mettre à jour la classe active des boutons
//             advancedTabButtons.forEach(btn => btn.classList.remove('active'));
//             button.classList.add('active');

//             // Déclencher un redimensionnement si nécessaire
//             window.dispatchEvent(new Event('resize'));
//         });
//     });
// }