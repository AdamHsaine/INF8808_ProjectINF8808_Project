/**
 * Génère une carte d'évolution temporelle des crimes par quartier
 *
 * @param {object} data Les données PDQ avec statistiques
 * @param {*} path Le générateur de chemins géographiques
 * @param {Array} years Les années disponibles pour la comparaison
 * @param {object} container Le conteneur où placer la visualisation
 * @param {Array} categories Les catégories de crimes disponibles
 */
export function createEvolutionMap(data, path, years, container, categories) {
    // Créer un conteneur pour la carte d'évolution
    const evolutionDiv = document.createElement('div')
    evolutionDiv.className = 'evolution-container'
    evolutionDiv.innerHTML = `
      <h2>Évolution temporelle des crimes par quartier</h2>
      <div class="year-selector">
        <div class="year-range">
          <label for="baseYear">Année de référence:</label>
          <select id="baseYear"></select>
        </div>
        <div class="year-range">
          <label for="comparisonYear">Année de comparaison:</label>
          <select id="comparisonYear"></select>
        </div>
        <div class="crime-category">
          <label for="crimeCategory">Type de crime:</label>
          <select id="crimeCategory">
            <option value="all">Tous les crimes</option>
          </select>
        </div>
        <button id="compareButton" class="compare-button">Comparer</button>
      </div>
      <div class="evolution-map">
        <svg class="evolution-svg"></svg>
      </div>
      <div class="evolution-legend"></div>
    `

    container.appendChild(evolutionDiv)

    // Ajouter les styles pour la carte d'évolution
    addEvolutionStyles()

    // Remplir les sélecteurs d'années
    const baseYearSelect = document.getElementById('baseYear')
    const comparisonYearSelect = document.getElementById('comparisonYear')
    const crimeCategorySelect = document.getElementById('crimeCategory')

    years.forEach((year, index) => {
        const baseOption = document.createElement('option')
        baseOption.value = year
        baseOption.textContent = year
        if (index === 0) baseOption.selected = true
        baseYearSelect.appendChild(baseOption)

        const compOption = document.createElement('option')
        compOption.value = year
        compOption.textContent = year
        if (index === years.length - 1) compOption.selected = true
        comparisonYearSelect.appendChild(compOption)
    })

    // Remplir le sélecteur de catégories de crimes
    if (categories && categories.length > 0) {
        categories.forEach(category => {
            const option = document.createElement('option')
            option.value = category
            option.textContent = formatCategoryName(category)
            crimeCategorySelect.appendChild(option)
        })
    }

    // Définir les dimensions de la carte
    const width = 800
    const height = 600

    // Initialiser le SVG
    const svg = d3.select('.evolution-svg')
        .attr('width', width)
        .attr('height', height)

    // Créer un groupe pour la carte
    const mapGroup = svg.append('g')
        .attr('class', 'evolution-map-g')

    // Ajouter un titre
    svg.append('text')
        .attr('class', 'evolution-title')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .text('Évolution des crimes par PDQ')

    // Ajouter un sous-titre (années comparées)
    const subtitle = svg.append('text')
        .attr('class', 'evolution-subtitle')
        .attr('x', width / 2)
        .attr('y', 60)
        .attr('text-anchor', 'middle')
        .text('Sélectionnez les années à comparer')

    // Échelle de couleur pour l'évolution (rouge pour augmentation, bleu pour diminution)
    const colorScale = d3.scaleSequential()
        .domain([-20, 20]) // Domaine initial pour les pourcentages (ajustable)
        .interpolator(d3.interpolateRdBu)

    // Générer la légende
    createEvolutionLegend(colorScale, d3.select('.evolution-legend'))

    // Gestionnaire d'événement pour le bouton de comparaison
    document.getElementById('compareButton').addEventListener('click', function () {
        const baseYear = baseYearSelect.value
        const comparisonYear = comparisonYearSelect.value
        const selectedCategory = crimeCategorySelect.value

        if (baseYear === comparisonYear) {
            alert('Veuillez sélectionner deux années différentes pour la comparaison.')
            return
        }

        // Calculer les évolutions pour chaque PDQ
        const evolutionData = calculateEvolutionData(data, baseYear, comparisonYear, selectedCategory)

        // Mettre à jour le sous-titre
        let subtitleText = `Évolution de ${baseYear} à ${comparisonYear}`
        if (selectedCategory !== 'all') {
            subtitleText += ` - ${formatCategoryName(selectedCategory)}`
        }
        subtitle.text(subtitleText)

        // Ajuster le domaine de l'échelle de couleur en fonction des données
        const minChange = d3.min(evolutionData.features, d => d.properties.evolution) || -20
        const maxChange = d3.max(evolutionData.features, d => d.properties.evolution) || 20
        const absMax = Math.max(Math.abs(minChange), Math.abs(maxChange))

        colorScale.domain([-absMax, absMax])

        // Redessiner la légende avec la nouvelle échelle
        d3.select('.evolution-legend').html('')
        createEvolutionLegend(colorScale, d3.select('.evolution-legend'))

        // Dessiner la carte
        updateEvolutionMap(evolutionData, path, mapGroup, colorScale)
    })

    // Déclencher un clic initial pour afficher la carte
    document.getElementById('compareButton').click()
}

/**
 * Formate le nom d'une catégorie pour l'affichage
 *
 * @param {string} category La catégorie à formater
 * @returns {string} Le nom formaté
 */
function formatCategoryName(category) {
    // Première lettre en majuscule, reste en minuscule
    if (!category) return 'Non spécifié'

    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
}

/**
 * Calcule les évolutions de criminalité entre deux années
 *
 * @param {object} data Les données PDQ
 * @param {string} baseYear L'année de référence
 * @param {string} comparisonYear L'année de comparaison
 * @param {string} category La catégorie de crime à comparer (ou 'all' pour tous)
 * @returns {object} Les données avec les évolutions calculées
 */
function calculateEvolutionData(data, baseYear, comparisonYear, category = 'all') {
    // Créer une copie profonde des données
    const evolutionData = JSON.parse(JSON.stringify(data))

    // Calculer l'évolution pour chaque PDQ
    evolutionData.features.forEach(feature => {
        const stats = feature.properties.crimeStats

        if (stats) {
            if (category === 'all') {
                // Calculer l'évolution pour tous les crimes
                if (stats.byYear && stats.byYear[baseYear] !== undefined && stats.byYear[comparisonYear] !== undefined) {
                    const baseCrimes = stats.byYear[baseYear]
                    const comparisonCrimes = stats.byYear[comparisonYear]

                    if (baseCrimes === 0) {
                        feature.properties.evolution = comparisonCrimes > 0 ? 100 : 0
                    } else {
                        // Calcul du pourcentage d'évolution
                        feature.properties.evolution = ((comparisonCrimes - baseCrimes) / baseCrimes) * 100
                    }
                } else {
                    feature.properties.evolution = 0 // Pas de données pour calculer l'évolution
                }
            } else {
                // Calculer l'évolution pour une catégorie spécifique
                // Utiliser la nouvelle structure byCategoryAndYear
                if (stats.byCategoryAndYear &&
                    stats.byCategoryAndYear[category] &&
                    stats.byCategoryAndYear[category][baseYear] !== undefined &&
                    stats.byCategoryAndYear[category][comparisonYear] !== undefined) {

                    const baseCrimes = stats.byCategoryAndYear[category][baseYear]
                    const comparisonCrimes = stats.byCategoryAndYear[category][comparisonYear]

                    if (baseCrimes === 0) {
                        feature.properties.evolution = comparisonCrimes > 0 ? 100 : 0
                    } else {
                        // Calcul du pourcentage d'évolution
                        feature.properties.evolution = ((comparisonCrimes - baseCrimes) / baseCrimes) * 100
                    }
                } else {
                    feature.properties.evolution = 0 // Pas de données pour cette catégorie ou ces années
                }
            }
        } else {
            feature.properties.evolution = 0 // Pas de statistiques disponibles
        }
    })

    return evolutionData
}

/**
 * Met à jour la carte d'évolution
 *
 * @param {object} data Les données avec les évolutions
 * @param {*} path Le générateur de chemins géographiques
 * @param {*} mapGroup Le groupe SVG pour la carte
 * @param {*} colorScale L'échelle de couleur pour l'évolution
 */
function updateEvolutionMap(data, path, mapGroup, colorScale) {
    // Effacer la carte existante
    mapGroup.selectAll('*').remove()

    // Dessiner les territoires de PDQ avec les couleurs d'évolution
    mapGroup.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', d => {
            if (d.properties.evolution !== undefined) {
                return colorScale(d.properties.evolution)
            }
            return '#ccc' // Couleur par défaut si pas de données
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .on('mouseover', function (event, d) {
            // Mise en évidence au survol
            d3.select(this)
                .attr('stroke', '#333')
                .attr('stroke-width', 2)

            // Afficher les informations d'évolution
            showEvolutionTooltip(event, d)
        })
        .on('mouseout', function () {
            // Restaurer le style original
            d3.select(this)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1)

            // Masquer l'infobulle
            hideEvolutionTooltip()
        })

    // Ajouter les étiquettes des PDQ
    mapGroup.selectAll('text')
        .data(data.features)
        .enter()
        .append('text')
        .attr('x', d => {
            const centroid = path.centroid(d)
            return isNaN(centroid[0]) ? 0 : centroid[0]
        })
        .attr('y', d => {
            const centroid = path.centroid(d)
            return isNaN(centroid[1]) ? 0 : centroid[1]
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', d => {
            // Choisir la couleur du texte en fonction de la luminosité du fond
            const evolution = d.properties.evolution
            return Math.abs(evolution) > 15 ? '#fff' : '#000'
        })
        .attr('pointer-events', 'none')
        .text(d => d.properties.PDQ)
        .attr('opacity', d => {
            // Ne pas afficher le texte pour les très petits territoires
            const area = path.area(d)
            return area > 100 ? 1 : 0
        })
}

/**
 * Affiche une infobulle avec les détails d'évolution
 *
 * @param {Event} event L'événement de souris
 * @param {object} d Les données de l'élément survolé
 */
function showEvolutionTooltip(event, d) {
    d3.select('.evolution-tooltip').remove();

    // Récupérer la catégorie sélectionnée
    const selectedCategory = document.getElementById('crimeCategory').value;
    const categoryText = selectedCategory === 'all' ? 'Tous les crimes' : formatCategoryName(selectedCategory);

    // Récupérer les années sélectionnées
    const baseYear = document.getElementById('baseYear').value;
    const comparisonYear = document.getElementById('comparisonYear').value;

    // Créer une nouvelle infobulle
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'evolution-tooltip')
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 30) + 'px')
        .style('background-color', 'white')
        .style('color', 'black')
        .style('padding', '10px')
        .style('border-radius', '4px')
        .style('border', '1px solid #ddd')
        .style('box-shadow', '0 2px 5px rgba(0,0,0,0.2)')
        .style('z-index', '1000')
        .style('max-width', '300px')
        .style('position', 'absolute')
        .style('pointer-events', 'none');

    // Ajouter l'en-tête
    tooltip.append('div')
        .style('font-weight', 'bold')
        .style('margin-bottom', '5px')
        .text(`PDQ ${d.properties.PDQ}`);

    tooltip.append('div')
        .style('font-weight', 'bold')
        .style('margin-bottom', '5px')
        .text(categoryText);

    // Calculer les valeurs absolues (nombre de crimes)
    let baseCrimeCount = 0;
    let comparisonCrimeCount = 0;

    if (d.properties.crimeStats) {
        if (selectedCategory === 'all') {
            // Pour tous les crimes, utiliser les totaux par année
            baseCrimeCount = d.properties.crimeStats.byYear[baseYear] || 0;
            comparisonCrimeCount = d.properties.crimeStats.byYear[comparisonYear] || 0;

            // Ajouter le résumé global
            tooltip.append('div')
                .text(`${baseYear}: ${baseCrimeCount} crimes`);

            tooltip.append('div')
                .text(`${comparisonYear}: ${comparisonCrimeCount} crimes`);

            tooltip.append('div')
                .style('font-weight', 'bold')
                .style('margin', '5px 0')
                .text(`Évolution globale: ${d.properties.evolution.toFixed(1)}%`);

            // Ajouter un séparateur
            tooltip.append('hr')
                .style('margin', '8px 0')
                .style('border', 'none')
                .style('height', '1px')
                .style('background-color', '#ddd');

            tooltip.append('div')
                .style('font-weight', 'bold')
                .style('margin-bottom', '5px')
                .text('Détail par type de crime:');

            // Vérifier que la structure des données nécessaire existe
            if (d.properties.crimeStats.byCategoryAndYear) {
                // Obtenir toutes les catégories disponibles
                const categories = Object.keys(d.properties.crimeStats.byCategoryAndYear);

                // Pour chaque catégorie, calculer et afficher l'évolution
                categories.forEach(category => {
                    // S'assurer que les données pour les deux années existent
                    if (d.properties.crimeStats.byCategoryAndYear[category]) {
                        const catBaseCount = d.properties.crimeStats.byCategoryAndYear[category][baseYear] || 0;
                        const catCompCount = d.properties.crimeStats.byCategoryAndYear[category][comparisonYear] || 0;

                        // Calculer l'évolution pour cette catégorie
                        let catEvolution = 0;
                        if (catBaseCount > 0) {
                            catEvolution = ((catCompCount - catBaseCount) / catBaseCount) * 100;
                        } else if (catCompCount > 0) {
                            catEvolution = 100; // Si base est 0 et comp > 0
                        }

                        // Ajouter cette catégorie à l'infobulle si elle a des données
                        if (catBaseCount > 0 || catCompCount > 0) {
                            tooltip.append('div')
                                .style('margin', '3px 0')
                                .style('display', 'flex')
                                .style('justify-content', 'space-between')
                                .html(`
                                    <span>${formatCategoryName(category)}</span>
                                    <span style="color: ${catEvolution > 0 ? 'red' : 'blue'}; font-weight: bold;">
                                        ${catEvolution.toFixed(1)}%
                                    </span>
                                `);
                        }
                    }
                });
            }
        } else {
            // Pour une catégorie spécifique, utiliser les données par catégorie et année
            if (d.properties.crimeStats.byCategoryAndYear &&
                d.properties.crimeStats.byCategoryAndYear[selectedCategory]) {
                baseCrimeCount = d.properties.crimeStats.byCategoryAndYear[selectedCategory][baseYear] || 0;
                comparisonCrimeCount = d.properties.crimeStats.byCategoryAndYear[selectedCategory][comparisonYear] || 0;
            }

            // Afficher les informations standard pour une catégorie spécifique
            tooltip.append('div')
                .text(`${baseYear}: ${baseCrimeCount} crimes`);

            tooltip.append('div')
                .text(`${comparisonYear}: ${comparisonCrimeCount} crimes`);

            tooltip.append('div')
                .style('font-weight', 'bold')
                .style('margin-top', '5px')
                .text(`Évolution: ${d.properties.evolution.toFixed(1)}%`);
        }
    }
}

function hideEvolutionTooltip() {
    // Supprimer l'infobulle
    d3.select('.evolution-tooltip').remove();
}

/**
 * Formatage du nom de catégorie (si cette fonction n'existe pas déjà ailleurs)
 */
function formatCategoryName(category) {
    if (!category) return 'Non spécifié';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}
/**
 * Crée la légende pour la carte d'évolution
 *
 * @param {*} colorScale L'échelle de couleur
 * @param {*} container Le conteneur pour la légende
 */
function createEvolutionLegend(colorScale, container) {
    const width = 400
    const height = 60

    // Créer le SVG pour la légende
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)

    // Récupérer le domaine de l'échelle
    const domain = colorScale.domain()
    const min = domain[0]
    const max = domain[1]

    // Créer une échelle pour la position horizontale
    const xScale = d3.scaleLinear()
        .domain([min, max])
        .range([50, width - 50])

    // Générer les dégradés de couleur
    const numSteps = 100
    const step = (max - min) / numSteps

    // Dessiner les rectangles de couleur
    for (let i = 0; i < numSteps; i++) {
        const value = min + i * step

        svg.append('rect')
            .attr('x', xScale(value))
            .attr('y', 20)
            .attr('width', (width - 100) / numSteps)
            .attr('height', 15)
            .attr('fill', colorScale(value))
    }

    // Ajouter les étiquettes
    svg.append('text')
        .attr('x', xScale(min))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(min.toFixed(0) + '%')

    svg.append('text')
        .attr('x', xScale(0))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('0%')

    svg.append('text')
        .attr('x', xScale(max))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('+' + max.toFixed(0) + '%')

    // Ajouter le titre de la légende
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text('Pourcentage d\'évolution des crimes')
}

/**
 * Ajoute les styles CSS pour la carte d'évolution
 */
function addEvolutionStyles() {
    // Vérifier si les styles existent déjà
    if (document.getElementById('evolution-styles')) return

    const style = document.createElement('style')
    style.id = 'evolution-styles'
    style.textContent = `
      .evolution-container {
        margin-top: 40px;
        padding: 20px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .evolution-container h2 {
        margin-top: 0;
        margin-bottom: 20px;
        text-align: center;
        font-size: 24px;
        color: #333;
      }
      
      .year-selector {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
        gap: 20px;
        flex-wrap: wrap;
      }
      
      .year-range, .crime-category {
        display: flex;
        align-items: center;
      }
      
      .year-range label, .crime-category label {
        margin-right: 10px;
        font-weight: bold;
      }
      
      .year-range select, .crime-category select {
        padding: 5px 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .compare-button {
        background-color: #4285F4;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .compare-button:hover {
        background-color: #3367D6;
        color: blue;
      }
      
      .evolution-map {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }
      
      .evolution-svg {
        background-color: white;
        border-radius: 4px;
      }
      
      .evolution-legend {
        display: flex;
        justify-content: center;
      }
      
      .evolution-title {
        font-size: 20px;
        font-weight: bold;
      }
      
      .evolution-subtitle {
        font-size: 16px;
        fill: #666;
      }
      
      .evolution-tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 4px;
        pointer-events: none;
        font-size: 14px;
        z-index: 1000;
      }

      .evolution-tooltip {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.95);
    color: black;
    padding: 10px;
    border-radius: 4px;
    pointer-events: none;
    font-size: 14px;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    border: 1px solid #ddd;
}

.tooltip-header {
    margin-bottom: 8px;
}

.tooltip-summary {
    margin-top: 5px;
}

.evolution-value {
    font-weight: bold;
    margin-top: 3px;
}

.tooltip-details table {
    margin-top: 5px;
}

.tooltip-details th {
    border-bottom: 1px solid #ddd;
    padding-bottom: 3px;
}

.tooltip-details tr:hover {
    background-color: #f5f5f5;
    `

    document.head.appendChild(style)
}