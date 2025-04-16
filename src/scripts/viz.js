import * as crimeAnalysis from './crimeAnalysis.js';

/**
 * Sets the domain of the color scale. Each type of site should have its own corresponding color.
 *
 * @param {*} color The color scale to be used
 * @param {object[]} data The data to be displayed
 */
export function colorDomain(color, data) {
  // Extraire les types uniques de sites d'intervention
  const types = [...new Set(data.features.map(d => d.properties.TYPE_SITE_INTERVENTION))];

  // Définir le domaine de l'échelle de couleurs avec ces types uniques
  color.domain(types);
}

/**
 * Draws the map base of Montreal. Each neighborhood should display its name when hovered.
 *
 * @param {object[]} data The data for the map base
 * @param {*} path The path associated with the current projection
 * @param {Function} showMapLabel The function to call when a neighborhood is hovered
 */
export function mapBackground(data, path, showMapLabel) {
  // Sélectionner le groupe SVG pour la carte
  const mapG = d3.select('#map-g');

  // Dessiner les quartiers (polygones)
  mapG.selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', '#ffffff')  // Couleur de fond claire
    .attr('stroke', '#666')   // Bordure visible
    .attr('stroke-width', 1.0) // Épaisseur de la bordure
    .on('mouseover', function (event, d) {
      // Afficher le nom du quartier au survol
      showMapLabel(d, path);
      // Mettre en évidence le quartier
      d3.select(this).attr('fill', '#e0e0e0');
    })
    .on('mouseout', function () {
      // Supprimer l'étiquette du quartier quand la souris sort
      d3.select('#map-label').remove();
      // Restaurer la couleur d'origine
      d3.select(this).attr('fill', '#ffffff');
    });
}

/**
 * Draws the PDQ map of Montreal with crime data. Each PDQ is colored based on its crime rate.
 *
 * @param {object[]} data The PDQ data with crime statistics
 * @param {*} path The path associated with the current projection
 * @param {*} colorScale The color scale to be used
 * @param {Function} showPDQLabel The function to call when a PDQ area is hovered
 * @param {Object} panel The panel object to display details when clicked
 */
export function mapPDQWithCrimeData(data, path, colorScale, showPDQLabel, panel) {
  // Sélectionner le groupe SVG pour la carte
  const mapG = d3.select('#map-g');

  // Dessiner les territoires de PDQ
  mapG.selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', d => {
      if (d.properties.crimeStats && d.properties.crimeStats.total > 0) {
        return colorScale(d.properties.crimeStats.total);
      }
      return '#f5f5f5'; // Couleur grise pour les PDQ sans données
    })
    .attr('stroke', '#fff')   // Bordure blanche
    .attr('stroke-width', 1.5) // Épaisseur de la bordure
    .attr('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      // Afficher le nom du PDQ au survol
      showPDQLabel(d, path);
      // Mettre en évidence le PDQ
      d3.select(this)
        .attr('stroke', '#333')
        .attr('stroke-width', 2);
    })
    .on('mouseout', function () {
      // Supprimer l'étiquette du PDQ quand la souris sort
      d3.select('#map-label').remove();
      // Restaurer le style d'origine
      d3.select(this)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);
    })
    .on('click', function (event, d) {
      // Afficher le panneau détaillé quand on clique sur un PDQ
      panel.display = (data) => displayPDQPanel(data, panel);
      panel.display(d);
    });

  // Ajouter les étiquettes de PDQ directement sur la carte pour les territoires plus grands
  mapG.selectAll('text')
    .data(data.features)
    .enter()
    .append('text')
    .attr('x', d => {
      const centroid = path.centroid(d);
      return isNaN(centroid[0]) ? 0 : centroid[0];
    })
    .attr('y', d => {
      const centroid = path.centroid(d);
      return isNaN(centroid[1]) ? 0 : centroid[1];
    })
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')
    .attr('fill', 'black')
    .attr('pointer-events', 'none') // Éviter que le texte interfère avec les événements de la souris
    .text(d => d.properties.PDQ)
    .attr('opacity', d => {
      // Ne pas afficher le texte pour les très petits territoires
      const area = path.area(d);
      return area > 100 ? 1 : 0;
    });
}

/**
 * Affiche le panneau d'information pour un PDQ sélectionné
 * 
 * @param {Object} d Les données du PDQ
 * @param {Object} panel Le module de panneau d'information
 */
function displayPDQPanel(d, panel) {
  // Utiliser la fonction display du module panel
  const panelDiv = d3.select('#panel');

  // Vider le panneau
  panelDiv.html('')
    .style('visibility', 'visible');

  // Ajouter un en-tête avec titre et bouton de fermeture
  const header = panelDiv.append('div')
    .style('display', 'flex')
    .style('justify-content', 'space-between')
    .style('align-items', 'center')
    .style('margin-bottom', '15px')
    .style('padding-bottom', '10px')
    .style('border-bottom', '1px solid #eee');

  header.append('h3')
    .text(`PDQ ${d.properties.PDQ}${d.properties.NOM_PDQ ? ' - ' + d.properties.NOM_PDQ : ''}`)
    .style('margin', '0')
    .style('color', '#333');

  header.append('button')
    .text('✕')
    .style('background', 'none')
    .style('border', 'none')
    .style('cursor', 'pointer')
    .style('font-size', '18px')
    .style('padding', '2px 8px')
    .style('border-radius', '4px')
    .style('transition', 'background-color 0.2s')
    .on('mouseover', function () {
      d3.select(this).style('background-color', '#f0f0f0');
    })
    .on('mouseout', function () {
      d3.select(this).style('background-color', 'transparent');
    })
    .on('click', () => panelDiv.style('visibility', 'hidden'));

  // Ajouter le contenu du panneau
  const content = panelDiv.append('div')
    .attr('class', 'panel-content');

  // Obtenir les statistiques
  const stats = d.properties.crimeStats;

  if (!stats) {
    content.append('p')
      .text('Aucune donnée disponible pour ce PDQ.')
      .style('color', '#666');
    return;
  }

  // Ajouter le nombre total de crimes
  content.append('div')
    .attr('class', 'stat-total')
    .html(`Total des crimes: <strong>${stats.total}</strong>`)
    .style('font-size', '18px')
    .style('margin', '10px 0 20px 0')
    .style('padding', '10px')
    .style('background-color', '#f5f5f5')
    .style('border-radius', '4px')
    .style('text-align', 'center');

  // Section des catégories
  const categorySection = content.append('div')
    .style('margin-bottom', '20px');

  categorySection.append('h4')
    .text('Par catégorie')
    .style('margin', '15px 0 10px 0')
    .style('font-size', '16px')
    .style('color', '#333')
    .style('border-bottom', '2px solid #4285F4')
    .style('padding-bottom', '5px');

  // Créer un wrapper pour les statistiques par catégorie avec une barre de défilement
  const categoryList = categorySection.append('div')
    .style('max-height', '150px')
    .style('overflow-y', 'auto')
    .style('border', '1px solid #eee')
    .style('border-radius', '4px')
    .style('padding', '5px');

  const categoryUl = categoryList.append('ul')
    .attr('class', 'stat-list')
    .style('margin', '0')
    .style('padding-left', '20px')
    .style('line-height', '1.5');

  // Ajouter les statistiques par catégorie
  const categoryEntries = Object.entries(stats.byCategory);
  categoryEntries.sort((a, b) => b[1] - a[1]); // Trier par nombre décroissant

  categoryEntries.forEach(([category, count]) => {
    const percentage = Math.round((count / stats.total) * 100);
    categoryUl.append('li')
      .html(`<strong>${category}</strong>: ${count} (${percentage}%)`)
      .style('margin-bottom', '5px');
  });

  // Section des années
  const yearSection = content.append('div');

  yearSection.append('h4')
    .text('Par année')
    .style('margin', '15px 0 10px 0')
    .style('font-size', '16px')
    .style('color', '#333')
    .style('border-bottom', '2px solid #4285F4')
    .style('padding-bottom', '5px');

  // Créer un graphique simple pour les années
  const yearData = Object.entries(stats.byYear);
  yearData.sort((a, b) => a[0] - b[0]); // Trier par année croissante

  const chartHeight = 120;
  const chartWidth = 240;
  const margin = { top: 10, right: 10, bottom: 30, left: 40 };
  const width = chartWidth - margin.left - margin.right;
  const height = chartHeight - margin.top - margin.bottom;

  const svg = yearSection.append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .style('display', 'block')
    .style('margin', '0 auto');

  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Créer les échelles
  const x = d3.scaleBand()
    .domain(yearData.map(d => d[0]))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(yearData, d => d[1])])
    .nice()
    .range([height, 0]);

  // Ajouter les barres
  chart.selectAll('.bar')
    .data(yearData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d[0]))
    .attr('y', d => y(d[1]))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d[1]))
    .attr('fill', '#4285F4');

  // Ajouter l'axe X
  chart.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-45)');

  // Ajouter l'axe Y
  chart.append('g')
    .call(d3.axisLeft(y).ticks(5));

  // Ajouter la liste des années en dessous du graphique
  const yearList = yearSection.append('ul')
    .attr('class', 'stat-list year-list')
    .style('columns', '2')
    .style('margin', '10px 0')
    .style('padding-left', '20px')
    .style('line-height', '1.5');

  yearData.forEach(([year, count]) => {
    yearList.append('li')
      .html(`<strong>${year}</strong>: ${count}`)
      .style('margin-bottom', '5px');
  });

  // Appliquer les styles généraux au panneau
  panelDiv
    .style('width', '300px')
    .style('border', '1px solid #ddd')
    .style('background-color', 'white')
    .style('box-shadow', '0 4px 8px rgba(0,0,0,0.1)')
    .style('padding', '15px')
    .style('border-radius', '8px')
    .style('position', 'absolute')
    .style('top', '100px')
    .style('right', '20px')
    .style('z-index', '1000')
    .style('max-height', '80vh')
    .style('overflow-y', 'auto');
}

/**
 * When a PDQ area is hovered, displays its name and number. The center of the text
 * is positioned at the centroid of the shape representing the PDQ on the map.
 *
 * @param {object[]} d The data to be displayed
 * @param {*} path The path used to draw the map elements
 */
export function showPDQLabel(d, path) {
  // Supprimer toute étiquette existante
  d3.select('#map-label').remove();

  // Calculer le centroïde du territoire de PDQ
  const centroid = path.centroid(d);

  // S'assurer que le centroid est valide
  if (isNaN(centroid[0]) || isNaN(centroid[1])) return;

  // Ajouter une étiquette de fond pour meilleure lisibilité
  d3.select('#map-g')
    .append('g')
    .attr('id', 'map-label')
    .attr('transform', `translate(${centroid[0]}, ${centroid[1]})`)
    .append('rect')
    .attr('x', -60)
    .attr('y', -30)
    .attr('width', 120)
    .attr('height', 60)
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('fill', 'rgba(0, 0, 0, 0.7)');

  // Informations à afficher
  const pdqInfo = d3.select('#map-label');

  // Ajouter le numéro du PDQ
  pdqInfo.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('y', -15)
    .style('font-family', 'sans-serif')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', 'white')
    .style('pointer-events', 'none')
    .text(`PDQ-${d.properties.PDQ}`);

  // Ajouter le nom du PDQ s'il est disponible
  if (d.properties.NOM_PDQ) {
    pdqInfo.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', 5)
      .style('font-family', 'sans-serif')
      .style('font-size', '12px')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .text(d.properties.NOM_PDQ);
  }

  // Ajouter le nombre de crimes
  if (d.properties.crimeStats) {
    pdqInfo.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', 25)
      .style('font-family', 'sans-serif')
      .style('font-size', '12px')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .text(`${d.properties.crimeStats.total} crimes`);
  }
}

/**
 * When a neighborhood is hovered, displays its name. The center of its
 * name is positioned at the centroid of the shape representing the neighborhood
 * on the map. Called when the neighborhood is hovered.
 *
 * @param {object[]} d The data to be displayed
 * @param {*} path The path used to draw the map elements
 */
export function showMapLabel(d, path) {
  // Supprimer toute étiquette existante
  d3.select('#map-label').remove();

  // Calculer le centroïde du quartier
  const centroid = path.centroid(d);

  // S'assurer que le centroid est valide
  if (isNaN(centroid[0]) || isNaN(centroid[1])) return;

  // Ajouter l'étiquette au centre du quartier
  d3.select('#map-g')
    .append('text')
    .attr('id', 'map-label')
    .attr('x', centroid[0])
    .attr('y', centroid[1])
    .attr('text-anchor', 'middle')  // Centrer le texte horizontalement
    .attr('dominant-baseline', 'middle')  // Centrer le texte verticalement
    .style('font-family', 'sans-serif')
    .style('font-size', '12px')
    .style('pointer-events', 'none')  // Éviter que le texte interfère avec les événements de la souris
    .style('user-select', 'none')     // Empêcher la sélection du texte
    .text(d.properties.NOM);  // Afficher le nom du quartier
}

/**
 * Displays the markers for each street on the map.
 *
 * @param {object[]} data The street data to be displayed
 * @param {*} color The color scaled used to determine the color of the circles
 * @param {*} panel The display panel, which should be dislayed when a circle is clicked
 */
export function mapMarkers(data, color, panel) {
  // Sélectionner le groupe SVG pour les marqueurs
  const markerG = d3.select('#marker-g');

  // Dessiner les cercles représentant les rues piétonnes
  markerG.selectAll('circle')
    .data(data.features)
    .enter()
    .append('circle')
    .attr('class', 'marker')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 5)  // Rayon normal de 5
    .attr('fill', d => color(d.properties.TYPE_SITE_INTERVENTION))  // Couleur basée sur le type de site
    .attr('stroke', 'white')  // Contour blanc
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')  // Changer le curseur au survol
    .on('mouseover', function () {
      // Augmenter le rayon à 6 au survol
      d3.select(this).attr('r', 6);
    })
    .on('mouseout', function () {
      // Restaurer le rayon normal
      d3.select(this).attr('r', 5);
    })
    .on('click', function (event, d) {
      // Afficher le panneau d'information quand on clique sur un cercle
      panel.display(d, color);
    });
}
export function fitMapToSvg(geoData, projection, width, height, padding = 40) {
  // Calculer les limites du GeoJSON
  const path = d3.geoPath().projection(projection);
  const bounds = path.bounds(geoData);

  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;

  // Calculer l'échelle et la translation
  const scale = 0.9 / Math.max(dx / width, dy / height);
  const translate = [width / 2 - scale * x, height / 2 - scale * y];

  // Mettre à jour la projection
  projection
    .scale(scale)
    .translate(translate);

  return projection;
}