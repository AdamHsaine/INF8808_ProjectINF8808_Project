/**
 * Module pour créer une carte de chaleur des hotspots criminels
 * Ce module répond aux questions I.3 (variation géographique selon l'heure) 
 * et II.1 (tendances saisonnières)
 */

/**
 * Initialise la carte de chaleur des crimes
 * 
 * @param {Array} crimeData Les données des crimes
 * @param {Object} container Le conteneur où placer la visualisation
 */
export function createCrimeHeatmap(crimeData, container) {
    // Créer un conteneur pour la carte de chaleur
    const heatmapDiv = document.createElement('div');
    heatmapDiv.className = 'heatmap-container';
    heatmapDiv.innerHTML = `
      <h2>Carte de chaleur des hotspots criminels</h2>
      <div class="heatmap-description">
        Cette visualisation montre la distribution géographique des crimes selon l'heure de la journée 
        et permet d'identifier les tendances saisonnières.
      </div>
      <div class="heatmap-filters">
        <div class="filter-group">
          <label for="time-filter">Période du jour:</label>
          <select id="time-filter">
            <option value="all">Toutes les périodes</option>
            <option value="jour">Matin (6h-12h)</option>
            <option value="apres-midi">Après-midi (12h-18h)</option>
            <option value="soir">Soir (18h-0h)</option>
            <option value="nuit">Nuit (0h-6h)</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="year-filter-heatmap">Année:</label>
          <select id="year-filter-heatmap"></select>
        </div>
        <div class="filter-group">
          <label for="month-filter">Mois:</label>
          <select id="month-filter">
            <option value="all">Tous les mois</option>
            <option value="1">Janvier</option>
            <option value="2">Février</option>
            <option value="3">Mars</option>
            <option value="4">Avril</option>
            <option value="5">Mai</option>
            <option value="6">Juin</option>
            <option value="7">Juillet</option>
            <option value="8">Août</option>
            <option value="9">Septembre</option>
            <option value="10">Octobre</option>
            <option value="11">Novembre</option>
            <option value="12">Décembre</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="crime-type-filter">Type de crime:</label>
          <select id="crime-type-filter">
            <option value="all">Tous les types</option>
          </select>
        </div>
        <button id="apply-heatmap-filters" class="apply-button">Appliquer</button>
      </div>
      <div id="heatmap-map" class="heatmap-map"></div>
      <div class="heatmap-legend"></div>
    `;

    container.appendChild(heatmapDiv);

    // Ajouter les styles pour la carte de chaleur et Leaflet
    addHeatmapStyles();

    // Extraire les années uniques des données
    const years = [...new Set(crimeData
        .map(d => d.DATE ? new Date(d.DATE).getFullYear() : null)
        .filter(y => y !== null))].sort();

    // Extraire les catégories uniques de crimes
    const crimeTypes = [...new Set(crimeData.map(d => d.CATEGORIE).filter(c => c))];
    console.log("text");
    // Remplir le sélecteur d'années
    const yearSelect = document.getElementById('year-filter-heatmap');

    // Option "Toutes les années"
    const allYearsOption = document.createElement('option');
    allYearsOption.value = 'all';
    allYearsOption.textContent = 'Toutes les années';
    yearSelect.appendChild(allYearsOption);

    // Ajouter les années disponibles
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Remplir le sélecteur de types de crimes
    const crimeTypeSelect = document.getElementById('crime-type-filter');
    crimeTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = formatCategoryName(type);
        crimeTypeSelect.appendChild(option);
    });

    // Initialiser la carte Leaflet
    initializeLeafletMap(crimeData);

    // Gestionnaire d'événement pour le bouton d'application des filtres
    document.getElementById('apply-heatmap-filters').addEventListener('click', function () {
        updateHeatmap(crimeData);
    });

    // Déclencher le chargement initial
    updateHeatmap(crimeData);
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
 * Initialise la carte Leaflet
 * 
 * @param {Array} crimeData Les données des crimes
 */
function initializeLeafletMap(crimeData) {
    // Créer une carte Leaflet centrée sur Montréal
    const map = L.map('heatmap-map').setView([45.50, -73.65], 12);

    // Ajouter une couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Stocker l'instance de carte pour y accéder plus tard
    window.crimeHeatmap = {
        map: map,
        heatLayer: null,
        markers: L.layerGroup().addTo(map)
    };

    // Charger les limites des PDQ avec GeoJSON
    fetch('./limitespdq.geojson')
        .then(response => response.json())
        .then(data => {
            // Ajouter les PDQ à la carte
            L.geoJSON(data, {
                style: {
                    color: '#4285F4',
                    weight: 2,
                    fillOpacity: 0.1,
                    fillColor: '#4285F4'
                },
                onEachFeature: function (feature, layer) {
                    // Ajouter une popup avec les informations détaillées du PDQ
                    if (feature.properties && feature.properties.PDQ) {
                        // Créer une popup avec un contenu plus détaillé
                        const pdqId = feature.properties.PDQ;
                        const pdqName = feature.properties.NOM_PDQ || 'Non spécifié';

                        // Obtenir le nombre de crimes pour ce PDQ (sera mis à jour dans updateHeatmap)
                        layer.crimeCount = 0;

                        // Popup avec plus de détails
                        const popupContent = `
                            <div style="min-width: 200px;">
                                <h3 style="margin: 0 0 8px 0; color: #4285F4; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                                    PDQ ${pdqId}
                                </h3>
                                <p style="margin: 5px 0; font-weight: bold;">${pdqName}</p>
                                <div class="pdq-crime-stats" id="pdq-stats-${pdqId}">
                                    <p style="margin: 5px 0;">Chargement des statistiques...</p>
                                </div>
                            </div>
                        `;

                        layer.bindPopup(popupContent);

                        // Stocker une référence à la couche pour la mise à jour des stats
                        if (!window.pdqLayers) window.pdqLayers = {};
                        window.pdqLayers[pdqId] = layer;

                        // Ajouter un événement pour mettre à jour les stats quand la popup s'ouvre
                        layer.on('popupopen', function () {
                            updatePDQPopupStats(pdqId);
                        });
                    }
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error('Erreur lors du chargement du GeoJSON:', error);
        });
}

/**
 * Met à jour les statistiques dans la popup d'un PDQ
 * 
 * @param {string} pdqId L'identifiant du PDQ
 */
function updatePDQPopupStats(pdqId) {
    // Récupérer l'élément de statistiques pour ce PDQ
    const statsElement = document.getElementById(`pdq-stats-${pdqId}`);
    if (!statsElement) return;

    // Récupérer les filtres actuels (pour garder la cohérence avec les données affichées)
    const timeFilter = document.getElementById('time-filter').value;
    const yearFilter = document.getElementById('year-filter-heatmap').value;
    const monthFilter = document.getElementById('month-filter').value;
    const crimeTypeFilter = document.getElementById('crime-type-filter').value;

    // Formater les valeurs des filtres pour l'affichage (pour le titre)
    const timeText = timeFilter === 'all' ? 'Toutes les périodes' :
        timeFilter === 'jour' ? 'Matin (6h-12h)' :
            timeFilter === 'apres-midi' ? 'Après-midi (12h-18h)' :
                timeFilter === 'soir' ? 'Soir (18h-0h)' : 'Nuit (0h-6h)';

    const yearText = yearFilter === 'all' ? 'Toutes les années' : yearFilter;
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthText = monthFilter === 'all' ? 'Tous les mois' : monthNames[parseInt(monthFilter) - 1];
    const crimeTypeText = crimeTypeFilter === 'all' ? 'Tous les types' : formatCategoryName(crimeTypeFilter);

    // Obtenir le nombre total de crimes pour ce PDQ avec les filtres actuels
    const crimeCount = window.pdqLayers[pdqId]?.crimeCount || 0;

    // Obtenir le nombre de crimes par quart de travail
    const quartStats = window.pdqLayers[pdqId]?.quartStats || { jour: 0, soir: 0, nuit: 0 };

    // Calculer les pourcentages pour chaque quart
    const total = quartStats.jour + quartStats.soir + quartStats.nuit;
    const jourPercent = total > 0 ? Math.round((quartStats.jour / total) * 100) : 0;
    const soirPercent = total > 0 ? Math.round((quartStats.soir / total) * 100) : 0;
    const nuitPercent = total > 0 ? Math.round((quartStats.nuit / total) * 100) : 0;

    // Créer les barres de progression
    const jourBar = `<div style="background:#4285F4;height:10px;width:${jourPercent}%;border-radius:2px;"></div>`;
    const soirBar = `<div style="background:#FFC107;height:10px;width:${soirPercent}%;border-radius:2px;"></div>`;
    const nuitBar = `<div style="background:#673AB7;height:10px;width:${nuitPercent}%;border-radius:2px;"></div>`;

    // Mettre à jour le contenu avec les statistiques
    statsElement.innerHTML = `
      <div style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px;">
          <p style="margin: 5px 0; font-weight: bold;">Statistiques des crimes:</p>
          <p style="margin: 5px 0;">Nombre total: <strong>${crimeCount}</strong></p>
          
          <div style="margin-top: 10px;">
              <h4 style="margin: 5px 0; font-size: 14px;">Répartition par période:</h4>
              
              <div style="margin-top: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span style="font-size: 12px;">Jour</span>
                      <span style="font-size: 12px;">${quartStats.jour} (${jourPercent}%)</span>
                  </div>
                  ${jourBar}
              </div>
              
              <div style="margin-top: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span style="font-size: 12px;">Soir</span>
                      <span style="font-size: 12px;">${quartStats.soir} (${soirPercent}%)</span>
                  </div>
                  ${soirBar}
              </div>
              
              <div style="margin-top: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span style="font-size: 12px;">Nuit</span>
                      <span style="font-size: 12px;">${quartStats.nuit} (${nuitPercent}%)</span>
                  </div>
                  ${nuitBar}
              </div>
          </div>
          
          <div style="margin-top: 8px; font-size: 11px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 5px;">
              Filtres: ${timeText} | ${yearText} | ${monthText} | ${crimeTypeText}
          </div>
      </div>
  `;
}

/**
 * Ajoute les styles CSS pour la carte de chaleur et Leaflet
 */
function addHeatmapStyles() {
    // Vérifier si les styles existent déjà
    if (document.getElementById('heatmap-styles')) return;

    // Ajouter les feuilles de style Leaflet
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    const style = document.createElement('style');
    style.id = 'heatmap-styles';
    style.textContent = `
      .heatmap-container {
        margin-top: 40px;
        padding: 20px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .heatmap-container h2 {
        margin-top: 0;
        margin-bottom: 10px;
        text-align: center;
        font-size: 24px;
        color: #333;
      }
      
      .heatmap-description {
        text-align: center;
        margin-bottom: 20px;
        color: #666;
        font-size: 16px;
      }
      
      .heatmap-filters {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .heatmap-filters .filter-group {
        display: flex;
        flex-direction: column;
      }
      
      .heatmap-filters label {
        margin-bottom: 5px;
        font-weight: bold;
        font-size: 14px;
      }
      
      .heatmap-filters select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        min-width: 150px;
      }
      
      .heatmap-filters .apply-button {
        background-color: #4285F4;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        align-self: center;
        margin-top: 4px;
      }
      
      .heatmap-filters .apply-button:hover {
        background-color: #3367D6;
        color: blue;
      }
      
      .heatmap-map {
        width: 100%;
        height: 500px;
        margin-bottom: 20px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .heatmap-legend {
        display: flex;
        justify-content: center;
        margin-top: 10px;
      }
      
      .heatmap-legend-content {
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 1px 5px rgba(0,0,0,0.2);
        text-align: center;
      }
      
      .heatmap-legend-content h4 {
        margin: 0 0 10px 0;
        font-size: 16px;
      }
      
      .gradient-bar {
        height: 10px;
        width: 200px;
        background: linear-gradient(to right, blue, cyan, lime, yellow, red);
        border-radius: 2px;
        margin: 0 auto;
      }
      
      .gradient-labels {
        display: flex;
        justify-content: space-between;
        width: 200px;
        margin: 5px auto;
        font-size: 12px;
        color: #666;
      }
      
      .legend-note {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
      }
      
      .leaflet-subtitle {
        position: absolute;
        bottom: 10px;
        left: 10px;
        padding: 5px 10px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 4px;
        z-index: 1000;
        font-size: 12px;
        box-shadow: 0 1px 5px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(style);
}

/**
 * Met à jour la carte de chaleur en fonction des filtres sélectionnés
 * 
 * @param {Array} crimeData Les données des crimes
 */
function updateHeatmap(crimeData) {
    // Récupérer les valeurs des filtres
    const timeFilter = document.getElementById('time-filter').value;
    const yearFilter = document.getElementById('year-filter-heatmap').value;
    const monthFilter = document.getElementById('month-filter').value;
    const crimeTypeFilter = document.getElementById('crime-type-filter').value;

    // Filtrer les données selon les critères
    const filteredData = crimeData.filter(crime => {
        // Filtre par période du jour
        if (timeFilter !== 'all' && crime.QUART !== timeFilter) {
            return false;
        }

        // Filtre par année
        if (yearFilter !== 'all') {
            const crimeYear = crime.DATE ? new Date(crime.DATE).getFullYear() : null;
            if (crimeYear !== parseInt(yearFilter)) {
                return false;
            }
        }

        // Filtre par mois
        if (monthFilter !== 'all') {
            const crimeMonth = crime.DATE ? new Date(crime.DATE).getMonth() + 1 : null;
            if (crimeMonth !== parseInt(monthFilter)) {
                return false;
            }
        }

        // Filtre par type de crime
        if (crimeTypeFilter !== 'all' && crime.CATEGORIE !== crimeTypeFilter) {
            return false;
        }

        return true;
    });

    // Mettre à jour le sous-titre avec les informations de filtre
    updateHeatmapSubtitle(timeFilter, yearFilter, monthFilter, crimeTypeFilter);

    // Générer les points pour la carte de chaleur
    generateHeatmapData(filteredData);
}

/**
 * Met à jour le sous-titre de la carte de chaleur
 * 
 * @param {string} time Période du jour sélectionnée
 * @param {string} year Année sélectionnée
 * @param {string} month Mois sélectionné
 * @param {string} crimeType Type de crime sélectionné
 */
function updateHeatmapSubtitle(time, year, month, crimeType) {
    // Formatter les textes des filtres
    const timeText = time === 'all' ? 'Toutes les périodes' :
        time === 'jour' ? 'Matin (6h-12h)' :
            time === 'apres-midi' ? 'Après-midi (12h-18h)' :
                time === 'soir' ? 'Soir (18h-0h)' : 'Nuit (0h-6h)';

    const yearText = year === 'all' ? 'Toutes les années' : year;

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthText = month === 'all' ? 'Tous les mois' : monthNames[parseInt(month) - 1];

    const crimeTypeText = crimeType === 'all' ? 'Tous les types' : formatCategoryName(crimeType);

    // Créer le sous-titre
    const subtitle = document.createElement('div');
    subtitle.className = 'leaflet-subtitle';
    subtitle.innerHTML = `Filtres: ${timeText} | ${yearText} | ${monthText} | ${crimeTypeText}`;

    // Supprimer le sous-titre précédent s'il existe
    const existingSubtitle = document.querySelector('.leaflet-subtitle');
    if (existingSubtitle) {
        existingSubtitle.remove();
    }

    // Ajouter le nouveau sous-titre
    document.getElementById('heatmap-map').appendChild(subtitle);
}

/**
 * Génère les points de données pour la carte de chaleur
 * 
 * @param {Array} filteredData Les données filtrées
 */
function generateHeatmapData(filteredData) {
    const map = window.crimeHeatmap.map;

    // Effacer les couches existantes
    if (window.crimeHeatmap.heatLayer) {
        map.removeLayer(window.crimeHeatmap.heatLayer);
    }
    window.crimeHeatmap.markers.clearLayers();

    // Centres approximatifs des PDQ (coordonnées simplifiées pour l'exemple)
    const pdqCenters = {
        1: [45.52, -73.57], 2: [45.53, -73.58], 3: [45.51, -73.56],
        4: [45.50, -73.59], 5: [45.51, -73.60], 7: [45.52, -73.61],
        8: [45.54, -73.62], 9: [45.55, -73.63], 10: [45.51, -73.64],
        11: [45.52, -73.65], 12: [45.53, -73.67], 13: [45.49, -73.66],
        15: [45.48, -73.65], 16: [45.47, -73.64], 20: [45.46, -73.63],
        21: [45.45, -73.62], 22: [45.46, -73.61], 23: [45.47, -73.60],
        24: [45.48, -73.59], 26: [45.49, -73.58], 27: [45.50, -73.57],
        30: [45.51, -73.55], 31: [45.52, -73.54], 33: [45.53, -73.53],
        35: [45.54, -73.52], 38: [45.55, -73.51], 39: [45.56, -73.50],
        42: [45.57, -73.52], 44: [45.58, -73.54], 45: [45.59, -73.56],
        46: [45.60, -73.58], 48: [45.61, -73.60], 49: [45.62, -73.62]
    };

    // Données pour la carte de chaleur
    const heatData = [];

    // Version simplifiée - utiliser d'abord directement les coordonnées réelles quand disponibles
    filteredData.forEach(crime => {
        // Si le crime a des coordonnées directes, les utiliser
        if (crime.LONGITUDE && crime.LATITUDE &&
            !isNaN(crime.LONGITUDE) && !isNaN(crime.LATITUDE)) {
            heatData.push([crime.LATITUDE, crime.LONGITUDE, 1.0]);
        }
    });

    // Agréger les crimes par PDQ pour les points sans coordonnées
    const crimesByPDQ = {};
    filteredData.forEach(crime => {
        const pdq = crime.PDQ;
        if (pdq) {
            if (!crimesByPDQ[pdq]) {
                crimesByPDQ[pdq] = 0;
            }
            crimesByPDQ[pdq]++;
        }
    });
    // Calculer les statistiques par quart pour chaque PDQ
    const quartStatsByPDQ = {};
    filteredData.forEach(crime => {
        const pdq = crime.PDQ;
        const quart = crime.QUART;

        if (pdq && quart) {
            if (!quartStatsByPDQ[pdq]) {
                quartStatsByPDQ[pdq] = {
                    jour: 0,
                    soir: 0,
                    nuit: 0
                };
            }

            // Incrémenter le compteur pour le quart approprié
            if (quart === 'jour') quartStatsByPDQ[pdq].jour++;
            else if (quart === 'soir') quartStatsByPDQ[pdq].soir++;
            else if (quart === 'nuit') quartStatsByPDQ[pdq].nuit++;
        }
    });

    // Mettre à jour les compteurs de crimes dans les couches PDQ
    Object.keys(crimesByPDQ).forEach(pdq => {
        if (window.pdqLayers && window.pdqLayers[pdq]) {
            window.pdqLayers[pdq].crimeCount = crimesByPDQ[pdq];
            window.pdqLayers[pdq].quartStats = quartStatsByPDQ[pdq] || { jour: 0, soir: 0, nuit: 0 };
        }
    });
    // Mettre à jour les compteurs de crimes dans les couches PDQ
    Object.keys(crimesByPDQ).forEach(pdq => {
        if (window.pdqLayers && window.pdqLayers[pdq]) {
            window.pdqLayers[pdq].crimeCount = crimesByPDQ[pdq];
        }
    });

    // Générer des points pour chaque PDQ basés sur le nombre de crimes
    Object.keys(crimesByPDQ).forEach(pdq => {
        const center = pdqCenters[pdq];
        const count = crimesByPDQ[pdq];

        if (center) {
            // Nous ne créons plus de marqueurs ici

            // Générer des points autour du centre pour la carte de chaleur
            // Uniquement pour les crimes sans coordonnées précises
            const numPoints = Math.min(Math.max(count / 5, 5), 50);
            for (let i = 0; i < numPoints; i++) {
                // Répartir les points autour du centre
                const radius = 0.01 + (count / 1000) * 0.01;
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.sqrt(Math.random()) * radius;

                const lat = center[0] + distance * Math.cos(angle);
                const lng = center[1] + distance * Math.sin(angle);

                // Ajouter un point avec une intensité basée sur le nombre de crimes
                heatData.push([lat, lng, 0.7]); // Intensité réduite pour les points générés
            }
        }
    });

    // Créer la couche de carte de chaleur
    if (heatData.length > 0) {
        window.crimeHeatmap.heatLayer = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
        }).addTo(map);

        // Ajuster la vue de la carte pour inclure tous les points
        const bounds = L.latLngBounds(heatData.map(point => [point[0], point[1]]));
        map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        // Pas de données, centrer sur Montréal
        map.setView([45.50, -73.65], 12);
    }

    // Mettre à jour la légende
    updateHeatmapLegend();
}

/**
 * Met à jour la légende de la carte de chaleur
 */
function updateHeatmapLegend() {
    const legendContainer = document.querySelector('.heatmap-legend');
    legendContainer.innerHTML = '';

    const legend = document.createElement('div');
    legend.className = 'heatmap-legend-content';
    legend.innerHTML = `
            <h4>Densité de crimes</h4>
            <div class="legend-gradient">
                <div class="gradient-bar"></div>
                <div class="gradient-labels">
                    <span>Faible</span>
                    <span>Moyenne</span>
                    <span>Élevée</span>
                </div>
            </div>
            <div class="legend-note">
                <small>La densité des couleurs indique la concentration des crimes.<br>
                Cliquez sur un PDQ pour voir ses statistiques détaillées.</small>
            </div>
        `;

    legendContainer.appendChild(legend);
}