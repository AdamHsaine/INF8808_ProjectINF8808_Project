/**
 * Generates the SVG element g which will contain the map base.
 *
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 * @returns {*} The d3 Selection for the created g element
 */
export function generateMapG(width, height) {
  return d3.select('.graph')
    .select('svg')
    .append('g')
    .attr('id', 'map-g')
    .attr('width', width)
    .attr('height', height)
}

/**
 * Generates the SVG element g which will contain the map markers.
 *
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 * @returns {*} The d3 Selection for the created g element
 */
export function generateMarkerG(width, height) {
  return d3.select('.graph')
    .select('svg')
    .append('g')
    .attr('id', 'marker-g')
    .attr('width', width)
    .attr('height', height)
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
export function setCanvasSize(width, height) {
  d3.select('#map').select('svg')
    .attr('width', width)
    .attr('height', height)
}

/**
 * Appends the labels for the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {string} title The title of the graph
 */
export function appendGraphLabels(g, title) {
  g.append('text')
    .text(title || 'Carte des PDQ de Montréal')
    .attr('class', 'title')
    .attr('fill', '#000000')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 28)
    .attr('transform', 'translate(50, 50)')

  g.append('text')
    .text('Cliquez sur un PDQ pour voir les statistiques détaillées.')
    .attr('class', 'subtitle')
    .attr('fill', '#000000')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 16)
    .attr('transform', 'translate(50, 80)')
}

/**
 * Initializes the div which will contain the information panel.
 */
export function initPanelDiv() {
  // Vérifier si le panneau existe déjà
  if (d3.select('#panel').size() === 0) {
    d3.select('.graph')
      .append('div')
      .attr('id', 'panel')
      .style('visibility', 'hidden')
  }
}

/**
 * Initializes the simulation used to place the circles
 *
 * @param {object} data The data to be displayed
 * @returns {*} The generated simulation
 */
export function getSimulation(data) {
  return d3.forceSimulation(data.features)
    .alphaDecay(0)
    .velocityDecay(0.75)
    .force('collision',
      d3.forceCollide(5)
        .strength(1)
    )
}

/**
 * Update the (x, y) position of the circles'
 * centers on each tick of the simulation.
 *
 * @param {*} simulation The simulation used to position the cirles.
 */
export function simulate(simulation) {
  simulation.on('tick', () => {
    d3.selectAll('.marker')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
  })
}

/**
 * Sets up the projection to be used.
 *
 * @returns {*} The projection to use to trace the map elements
 */
export function getProjection() {
  return d3.geoMercator()
    .center([-73.75, 45.54])   // Ajustez le centre si nécessaire
    .scale(65000)              // Réduisez l'échelle pour "zoomer out"
    .translate([450, 312.5]);
}

/**
 * Sets up the path to be used.
 *
 * @param {*} projection The projection used to trace the map elements
 * @returns {*} The path to use to trace the map elements
 */
export function getPath(projection) {
  return d3.geoPath()
    .projection(projection)
}