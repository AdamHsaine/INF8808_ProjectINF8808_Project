/**
 * Ce module gère l'analyse des données criminelles
 */

/**
 * Traite les données criminelles pour les préparer à la visualisation
 *
 * @param {Array} crimeData Les données brutes des crimes
 * @returns {object} Les données traitées avec statistiques et agrégations
 */
export function processCrimeData(crimeData) {
    // Extraire les catégories uniques
    const categories = [...new Set(crimeData.map(d => d.CATEGORIE).filter(c => c))]

    // Extraire les années uniques
    const years = [...new Set(crimeData
        .map(d => d.DATE ? new Date(d.DATE).getFullYear() : null)
        .filter(y => y !== null))].sort()

    // Agréger les crimes par PDQ
    const byPDQ = {}

    for (const crime of crimeData) {
        const pdq = crime.PDQ
        if (pdq === null || isNaN(pdq)) continue
        const category = crime.CATEGORIE
        if (!category) continue // Ignorer les crimes sans catégorie pour cette analyse

        const year = crime.DATE ? new Date(crime.DATE).getFullYear() : null
        if (year === null) continue // Ignorer les crimes sans date pour cette analyse

        if (!byPDQ[pdq]) {
            byPDQ[pdq] = {
                total: 0,
                byCategory: {},
                byYear: {},
                byCategoryAndYear: {} // Nouvelle structure pour stocker les données par catégorie et année
            }

            // Initialiser les compteurs pour chaque catégorie
            categories.forEach(cat => {
                byPDQ[pdq].byCategory[cat] = 0
                byPDQ[pdq].byCategoryAndYear[cat] = {}

                // Initialiser les compteurs pour chaque année dans chaque catégorie
                years.forEach(y => {
                    byPDQ[pdq].byCategoryAndYear[cat][y] = 0
                })
            })

            // Initialiser les compteurs pour chaque année
            years.forEach(y => {
                byPDQ[pdq].byYear[y] = 0
            })
        }

        // Incrémenter le total
        byPDQ[pdq].total += 1

        // Incrémenter par catégorie
        byPDQ[pdq].byCategory[category] = (byPDQ[pdq].byCategory[category] || 0) + 1

        // Incrémenter par année
        byPDQ[pdq].byYear[year] = (byPDQ[pdq].byYear[year] || 0) + 1

        // Incrémenter par catégorie ET année
        if (!byPDQ[pdq].byCategoryAndYear[category]) {
            byPDQ[pdq].byCategoryAndYear[category] = {}
        }
        byPDQ[pdq].byCategoryAndYear[category][year] =
            (byPDQ[pdq].byCategoryAndYear[category][year] || 0) + 1
    }

    return {
        categories,
        years,
        byPDQ
    }
}

/**
 * Fusionne les données criminelles avec les données géographiques
 *
 * @param {object} geoData Les données géographiques (GeoJSON)
 * @param {object} crimeByPDQ Les données criminelles agrégées par PDQ
 * @returns {object} Les données fusionnées
 */
export function mergeCrimeWithGeoData(geoData, crimeByPDQ) {
    // Créer une copie profonde des données géographiques
    const mergedData = JSON.parse(JSON.stringify(geoData))

    // Ajouter les statistiques de crimes à chaque feature
    for (const feature of mergedData.features) {
        const pdq = feature.properties.PDQ

        if (crimeByPDQ[pdq]) {
            feature.properties.crimeStats = crimeByPDQ[pdq]
        } else {
            // Si pas de données pour ce PDQ
            feature.properties.crimeStats = {
                total: 0,
                byCategory: {},
                byYear: {},
                byCategoryAndYear: {}
            }
        }
    }

    return mergedData
}

/**
 * Crée une échelle de couleur pour les crimes
 *
 * @param {object} crimeByPDQ Les données criminelles agrégées par PDQ
 * @returns {Function} L'échelle de couleur
 */
export function createColorScale(crimeByPDQ) {
    // Extraire les totaux de crimes par PDQ
    const crimeCounts = Object.values(crimeByPDQ).map(d => d.total)

    // Déterminer les seuils pour 5 niveaux d'intensité
    // Si moins de 5 PDQ, utiliser les valeurs directement
    const sortedCounts = [...crimeCounts].sort((a, b) => a - b)

    // Créer une échelle à 5 niveaux
    let thresholds
    if (sortedCounts.length >= 5) {
        const quintileSize = Math.floor(sortedCounts.length / 5)
        thresholds = [
            0, // Valeur minimale (inclure 0 pour les PDQ sans crimes)
            sortedCounts[Math.floor(quintileSize * 1)],
            sortedCounts[Math.floor(quintileSize * 2)],
            sortedCounts[Math.floor(quintileSize * 3)],
            sortedCounts[Math.floor(quintileSize * 4)]
        ]
    } else {
        // Si peu de PDQ, créer une échelle linéaire simple
        const min = Math.min(0, ...sortedCounts)
        const max = Math.max(...sortedCounts)
        const step = (max - min) / 5
        thresholds = [
            min,
            min + step,
            min + step * 2,
            min + step * 3,
            min + step * 4
        ]
    }

    // Descriptions textuelles des niveaux
    const levelDescriptions = [
        "Très faible",
        "Faible",
        "Moyen",
        "Élevé",
        "Très élevé"
    ];

    // Créer l'échelle de couleur
    const colorScale = d3.scaleThreshold()
        .domain(thresholds)
        .range([
            '#2ca02c', // Vert foncé - Très peu de crimes
            '#98df8a', // Vert clair
            '#ffff99', // Jaune - Moyen
            '#ff9896', // Rouge clair
            '#d62728' // Rouge foncé - Beaucoup de crimes
        ]);

    // Ajouter une propriété pour les descriptions textuelles
    colorScale.labels = levelDescriptions;

    return colorScale;
}

/**
 * Filtre les données criminelles selon les critères sélectionnés
 *
 * @param {Array} crimeData Les données brutes des crimes
 * @param {object} filters Les filtres à appliquer
 * @returns {Array} Les données filtrées
 */
export function filterCrimeData(crimeData, filters) {
    return crimeData.filter(crime => {
        // Filtre par catégorie
        if (filters.category !== 'all' && crime.CATEGORIE !== filters.category) {
            return false
        }

        // Filtre par année
        if (filters.year !== 'all') {
            const year = crime.DATE ? new Date(crime.DATE).getFullYear() : null
            if (year !== parseInt(filters.year)) {
                return false
            }
        }

        // Filtre par quart de travail
        if (filters.quarter !== 'all' && crime.QUART !== filters.quarter) {
            return false
        }

        return true
    })
}

/**
 * Génère un résumé des statistiques pour un PDQ spécifique
 *
 * @param {object} pdqData Les données du PDQ
 * @returns {string} HTML formaté pour le panneau d'information
 */
export function generatePDQSummary(pdqData) {
    const stats = pdqData.properties.crimeStats
    if (!stats) return '<p>Aucune donnée disponible pour ce PDQ</p>'

    let html = `
      <h3>PDQ ${pdqData.properties.PDQ} - ${pdqData.properties.NOM_PDQ || ''}</h3>
      <div class="stat-total">Total des crimes: <strong>${stats.total}</strong></div>
      
      <h4>Par catégorie</h4>
      <ul class="stat-list">
    `

    // Ajouter les statistiques par catégorie
    for (const category in stats.byCategory) {
        const count = stats.byCategory[category]
        const percentage = Math.round((count / stats.total) * 100)
        html += `<li>${category}: ${count} (${percentage}%)</li>`
    }

    html += `</ul>
      
      <h4>Par année</h4>
      <ul class="stat-list">
    `

    // Ajouter les statistiques par année
    for (const year in stats.byYear) {
        const count = stats.byYear[year]
        html += `<li>${year}: ${count}</li>`
    }

    html += '</ul>'

    return html
}