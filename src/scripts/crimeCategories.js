/**
 * Module pour créer un graphique d'évolution des types de crimes au fil des années
 * Ce module répond à la question: "Quelle est l'évolution des différents types de crimes sur plusieurs années?"
 */

/**
 * Crée un graphique d'évolution des types de crimes
 *
 * @param {Array} crimeData Les données des crimes
 * @param {object} container Le conteneur où placer la visualisation
 */
export function createCrimeCategoriesChart (crimeData, container) {
  // Créer un conteneur pour le graphique d'évolution
  const evolutionDiv = document.createElement('div')
  evolutionDiv.className = 'crime-categories-container'
  evolutionDiv.innerHTML = `
      <h2>Évolution des types de crimes au fil des années</h2>
      <div class="chart-description">
        Cette visualisation montre comment les différents types de crimes ont évolué au cours du temps, permettant d'identifier les tendances à la hausse ou à la baisse pour chaque catégorie.
      </div>
      <div class="chart-filters">
        <div class="filter-group">
          <label for="pdq-filter-categories">PDQ:</label>
          <select id="pdq-filter-categories">
            <option value="all">Tous les PDQ</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="display-mode">Mode d'affichage:</label>
          <select id="display-mode">
            <option value="absolute">Valeurs absolues</option>
            <option value="percentage">Pourcentages</option>
            <option value="growth">Taux de croissance</option>
          </select>
        </div>
        <button id="apply-categories-filters" class="apply-button">Appliquer</button>
      </div>
      <div class="categories-chart-area">
        <svg class="categories-chart-svg"></svg>
      </div>
      <div class="categories-legend"></div>
    `

  container.appendChild(evolutionDiv)

  // Ajouter les styles pour le graphique d'évolution
  addCategoriesChartStyles()

  // Extraire les PDQ uniques
  const pdqs = [...new Set(crimeData
    .map(d => d.PDQ)
    .filter(p => p !== null))].sort((a, b) => a - b)

  // Remplir le sélecteur de PDQ
  const pdqSelect = document.getElementById('pdq-filter-categories')
  pdqs.forEach(pdq => {
    const option = document.createElement('option')
    option.value = pdq
    option.textContent = `PDQ ${pdq}`
    pdqSelect.appendChild(option)
  })

  // Gestionnaire d'événement pour le bouton d'application des filtres
  document.getElementById('apply-categories-filters').addEventListener('click', function () {
    updateCategoriesChart(crimeData)
  })

  // Déclencher le chargement initial
  updateCategoriesChart(crimeData)
}

/**
 * Ajoute les styles CSS pour le graphique d'évolution des catégories
 */
function addCategoriesChartStyles () {
  // Vérifier si les styles existent déjà
  if (document.getElementById('categories-chart-styles')) return

  const style = document.createElement('style')
  style.id = 'categories-chart-styles'
  style.textContent = `
      .crime-categories-container {
        margin-top: 40px;
        padding: 20px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .crime-categories-container h2 {
        margin-top: 0;
        margin-bottom: 10px;
        text-align: center;
        font-size: 24px;
        color: #333;
      }
      
      .chart-description {
        text-align: center;
        margin-bottom: 20px;
        color: #666;
        font-size: 16px;
      }
      
      .chart-filters {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .chart-filters .filter-group {
        display: flex;
        flex-direction: column;
      }
      
      .chart-filters label {
        margin-bottom: 5px;
        font-weight: bold;
        font-size: 14px;
      }
      
      .chart-filters select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        min-width: 150px;
      }
      
      .chart-filters .apply-button {
        background-color: #4285F4;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        align-self: flex-end;
      }
      
      .chart-filters .apply-button:hover {
        background-color: #3367D6;
      }
      
      .categories-chart-area {
        display: flex;
        justify-content: center;
        overflow-x: auto;
        margin-bottom: 20px;
      }
      
      .categories-chart-svg {
        width: 100%;
        height: 500px;
        max-width: 1000px;
      }
      
      .categories-legend {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        margin-right: 15px;
        margin-bottom: 8px;
      }
      
      .legend-color {
        width: 20px;
        height: 3px;
        margin-right: 5px;
      }
      
      .legend-label {
        font-size: 14px;
      }
      
      .categories-tooltip {
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
      
      .axis-title {
        font-size: 12px;
        font-weight: bold;
      }
      
      .chart-title {
        font-size: 16px;
        font-weight: bold;
      }
      
      .empty-data-message {
        text-align: center;
        font-size: 18px;
        color: #666;
        margin: 40px 0;
      }
      
      .categories-line {
        fill: none;
        stroke-width: 3;
      }
      
      .categories-line:hover {
        stroke-width: 5;
      }
      
      .categories-point {
        cursor: pointer;
      }
    `

  document.head.appendChild(style)
}

/**
 * Met à jour le graphique d'évolution des catégories en fonction des filtres sélectionnés
 *
 * @param {Array} crimeData Les données des crimes
 */
function updateCategoriesChart (crimeData) {
  // Récupérer les valeurs des filtres
  const pdqFilter = document.getElementById('pdq-filter-categories').value
  const displayMode = document.getElementById('display-mode').value

  // Filtrer les données selon les critères
  const filteredData = crimeData.filter(crime => {
    // Filtre par PDQ
    if (pdqFilter !== 'all' && crime.PDQ !== parseInt(pdqFilter)) {
      return false
    }

    // Vérifier que la date et la catégorie existent
    return crime.DATE && crime.CATEGORIE
  })

  // Traiter les données pour le graphique
  const processedData = processDataForCategoriesChart(filteredData, displayMode)

  // Créer le graphique
  drawCategoriesChart(processedData, displayMode)
}

/**
 * Traite les données pour le graphique d'évolution des catégories
 *
 * @param {Array} filteredData Les données filtrées
 * @param {string} displayMode Le mode d'affichage (absolute, percentage, growth)
 * @returns {object} Les données formatées pour le graphique
 */
function processDataForCategoriesChart (filteredData, displayMode) {
  // 1. Extraire les années et catégories uniques
  const years = [...new Set(filteredData
    .map(d => d.DATE ? new Date(d.DATE).getFullYear() : null)
    .filter(y => y !== null && y >= 2015))].sort()

  const categories = [...new Set(filteredData
    .map(d => d.CATEGORIE)
    .filter(c => c !== null))]

  // 2. Agréger les données par année et catégorie
  const countsByYearAndCategory = {}

  // Initialiser la structure
  years.forEach(year => {
    countsByYearAndCategory[year] = {}
    categories.forEach(category => {
      countsByYearAndCategory[year][category] = 0
    })
  })

  // Remplir avec les données
  filteredData.forEach(crime => {
    if (crime.DATE && crime.CATEGORIE) {
      const year = new Date(crime.DATE).getFullYear()
      const category = crime.CATEGORIE

      if (countsByYearAndCategory[year] && countsByYearAndCategory[year][category] !== undefined) {
        countsByYearAndCategory[year][category]++
      }
    }
  })

  // 3. Calculer les totaux par année pour les pourcentages
  const totalsByYear = {}
  years.forEach(year => {
    totalsByYear[year] = Object.values(countsByYearAndCategory[year]).reduce((sum, count) => sum + count, 0)
  })

  // 4. Préparer les séries pour chaque catégorie selon le mode d'affichage
  const series = categories.map(category => {
    const yearValues = years.map((year, index) => {
      const count = countsByYearAndCategory[year][category]

      if (displayMode === 'absolute') {
        // Valeurs absolues
        return { year, value: count }
      } else if (displayMode === 'percentage') {
        // Pourcentages
        const total = totalsByYear[year]
        const percentage = total > 0 ? (count / total) * 100 : 0
        return { year, value: percentage }
      } else if (displayMode === 'growth') {
        // Taux de croissance (par rapport à l'année précédente)
        if (index === 0) {
          return { year, value: 0 } // Premier point à 0
        } else {
          const previousYear = years[index - 1]
          const previousCount = countsByYearAndCategory[previousYear][category]

          if (previousCount === 0) {
            return { year, value: count > 0 ? 100 : 0 } // Si précédent = 0, et actuel > 0: 100%
          } else {
            const growthRate = ((count - previousCount) / previousCount) * 100
            return { year, value: growthRate }
          }
        }
      }
    })

    return {
      category,
      values: yearValues
    }
  })

  return {
    years,
    categories,
    series
  }
}

/**
 * Dessine le graphique d'évolution des catégories
 *
 * @param {object} data Les données formatées pour le graphique
 * @param {string} displayMode Le mode d'affichage
 */
function drawCategoriesChart (data, displayMode) {
  // Vérifier si des données sont disponibles
  if (data.years.length === 0 || data.categories.length === 0) {
    const chartArea = document.querySelector('.categories-chart-area')
    chartArea.innerHTML = '<div class="empty-data-message">Aucune donnée disponible pour les filtres sélectionnés</div>'
    document.querySelector('.categories-legend').innerHTML = ''
    return
  }

  // Réinitialiser la zone du graphique
  const chartArea = document.querySelector('.categories-chart-area')
  chartArea.innerHTML = '<svg class="categories-chart-svg"></svg>'

  // Dimensions
  const margin = { top: 50, right: 80, bottom: 60, left: 80 }
  const width = 960 - margin.left - margin.right
  const height = 500 - margin.top - margin.bottom

  // Créer le SVG
  const svg = d3.select('.categories-chart-svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // Échelles
  const x = d3.scalePoint()
    .domain(data.years)
    .range([0, width])
    .padding(0.5)

  // Déterminer les valeurs min et max pour l'échelle Y
  let yMin = 0
  let yMax = 0

  data.series.forEach(serie => {
    serie.values.forEach(point => {
      if (point.value < yMin) yMin = point.value
      if (point.value > yMax) yMax = point.value
    })
  })

  // Ajouter une marge de 10% pour yMax
  yMax = yMax * 1.1

  // Si mode croissance, avoir une plage symétrique pour faciliter la lecture
  if (displayMode === 'growth') {
    const absMax = Math.max(Math.abs(yMin), Math.abs(yMax))
    yMin = -absMax
    yMax = absMax
  }

  const y = d3.scaleLinear()
    .domain([yMin, yMax])
    .nice()
    .range([height, 0])

  // Couleurs pour les catégories
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(data.categories)

  // Créer les lignes
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX) // Lissage des courbes

  // Titres des axes
  const xAxisTitle = 'Année'
  let yAxisTitle

  if (displayMode === 'absolute') {
    yAxisTitle = 'Nombre de crimes'
  } else if (displayMode === 'percentage') {
    yAxisTitle = 'Pourcentage (%)'
  } else if (displayMode === 'growth') {
    yAxisTitle = 'Taux de croissance (%)'
  }

  // Dessiner les axes
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('text-anchor', 'middle')

  svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).ticks(10))

  // Titres des axes
  svg.append('text')
    .attr('class', 'axis-title')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .attr('text-anchor', 'middle')
    .text(xAxisTitle)

  svg.append('text')
    .attr('class', 'axis-title')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 20)
    .attr('text-anchor', 'middle')
    .text(yAxisTitle)

  // Titre du graphique
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', -margin.top / 2)
    .attr('text-anchor', 'middle')
    .text('Évolution des types de crimes au fil des années')

  // Lignes de référence horizontales
  svg.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y)
      .tickSize(-width)
      .tickFormat('')
      .ticks(10))
    .selectAll('line')
    .style('stroke', '#e0e0e0')
    .style('stroke-opacity', 0.7)
    .style('shape-rendering', 'crispEdges')

  // Ligne de référence à 0 pour le mode croissance
  if (displayMode === 'growth') {
    svg.append('line')
      .attr('x1', 0)
      .attr('y1', y(0))
      .attr('x2', width)
      .attr('y2', y(0))
      .style('stroke', '#666')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4,4')
  }

  // Infobulle
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'categories-tooltip')
    .style('opacity', 0)

  // Dessiner les lignes pour chaque série
  data.series.forEach(serie => {
    // Ne dessiner la ligne que si elle a des valeurs
    if (serie.values.some(v => v.value !== 0)) {
      svg.append('path')
        .datum(serie.values)
        .attr('class', 'categories-line')
        .attr('stroke', colorScale(serie.category))
        .attr('d', line)
        .on('mouseover', function () {
          d3.select(this)
            .attr('stroke-width', 5)
        })
        .on('mouseout', function () {
          d3.select(this)
            .attr('stroke-width', 3)
        })

      // Ajouter les points pour chaque donnée
      svg.selectAll(`.point-${serie.category.replace(/\s+/g, '-')}`)
        .data(serie.values)
        .enter()
        .append('circle')
        .attr('class', `categories-point point-${serie.category.replace(/\s+/g, '-')}`)
        .attr('cx', d => x(d.year))
        .attr('cy', d => y(d.value))
        .attr('r', 5)
        .attr('fill', colorScale(serie.category))
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .on('mouseover', function (event, d) {
          // Effet de survol
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)

          // Contenu de l'infobulle selon le mode d'affichage
          let tooltipContent = `
              <div style="text-align: center; font-weight: bold; margin-bottom: 5px; color: ${colorScale(serie.category)}">
                ${formatCategoryName(serie.category)}
              </div>
              <div>
                Année: <strong>${d.year}</strong>
              </div>
            `

          if (displayMode === 'absolute') {
            tooltipContent += `<div>Nombre: <strong>${d.value}</strong></div>`
          } else if (displayMode === 'percentage') {
            tooltipContent += `<div>Pourcentage: <strong>${d.value.toFixed(1)}%</strong></div>`
          } else if (displayMode === 'growth') {
            tooltipContent += `<div>Croissance: <strong>${d.value.toFixed(1)}%</strong></div>`
          }

          // Afficher l'infobulle
          tooltip.transition()
            .duration(200)
            .style('opacity', 0.9)

          tooltip.html(tooltipContent)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px')
        })
        .on('mouseout', function () {
          // Restaurer le point normal
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 5)

          // Masquer l'infobulle
          tooltip.transition()
            .duration(500)
            .style('opacity', 0)
        })
    }
  })

  // Créer la légende
  createCategoriesLegend(data.series, colorScale)
}

/**
 * Crée la légende pour le graphique d'évolution des catégories
 *
 * @param {Array} series Les séries de données
 * @param {Function} colorScale L'échelle de couleur utilisée
 */
function createCategoriesLegend (series, colorScale) {
  const legendContainer = document.querySelector('.categories-legend')
  legendContainer.innerHTML = ''

  // Trier les séries par ordre alphabétique de catégorie pour la légende
  const sortedSeries = [...series].sort((a, b) => a.category.localeCompare(b.category))

  sortedSeries.forEach(serie => {
    // Vérifier si la série a des valeurs non nulles
    if (serie.values.some(v => v.value !== 0)) {
      const legendItem = document.createElement('div')
      legendItem.className = 'legend-item'

      const colorBox = document.createElement('div')
      colorBox.className = 'legend-color'
      colorBox.style.backgroundColor = colorScale(serie.category)

      const label = document.createElement('span')
      label.className = 'legend-label'
      label.textContent = formatCategoryName(serie.category)

      legendItem.appendChild(colorBox)
      legendItem.appendChild(label)
      legendContainer.appendChild(legendItem)
    }
  })
}

/**
 * Formate le nom d'une catégorie pour l'affichage
 *
 * @param {string} category La catégorie à formater
 * @returns {string} Le nom formaté
 */
function formatCategoryName (category) {
  if (!category) return 'Non spécifié'
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
}
