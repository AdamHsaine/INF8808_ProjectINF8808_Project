/**
 * Displays the information panel when a marker is clicked.
 *
 * @param {object} d The data bound to the clicked marker
 * @param {*} color The color scale used to select the title's color
 */
export function display(d, color) {
  const panel = d3.select('#panel').style('visibility', 'visible')

  panel.selectAll('*').remove()

  panel.append('div')
    .style('text-align', 'right')
    .style('font-family', 'Open Sans Condensed')
    .style('font-size', '12px')
    .style('cursor', 'pointer')
    .text('FERMER')
    .on('click', () => panel.style('visibility', 'hidden'))

  const title = panel
    .append('div')
    .style('font-family', 'Oswald')
    .style('font-size', '24px')

  setTitle(title, d, color)

  const mode = panel
    .append('div')
    .style('font-family', 'Oswald')
    .style('font-size', '16px')

  setMode(mode, d)

  if (d.properties.OBJECTIF_THEMATIQUE) {
    const theme = panel
      .append('div')
      .attr('class', 'theme')
      .style('font-family', 'Open Sans Condensed')
      .style('font-size', '16px')
      .text('Thématique : ')

    const list = theme.append('ul')
    d.properties.OBJECTIF_THEMATIQUE.split('\n').forEach(element => {
      setTheme(list, element)
    })
  }
}

/**
 * Displays the title of the information panel. Its color matches the color of the
 * corresponding marker on the map.
 *
 * @param {*} g The d3 selection of the SVG g element containing the title
 * @param {object} d The data to display
 * @param {*} color The color scale to select the title's color
 */
function setTitle(g, d, color) {
  // TODO : Set the title
  // Récupérer le nom du projet
  const projectName = d.properties.NOM_PROJET || 'Projet sans nom';

  // Obtenir la couleur correspondante au type de site
  const siteColor = color(d.properties.TYPE_SITE_INTERVENTION);

  // Définir le titre avec la même couleur que le marqueur
  g.text(projectName)
    .style('color', siteColor)
    .style('border-bottom', `2px solid ${siteColor}`)
    .style('padding-bottom', '5px')
    .style('margin-bottom', '10px');
}

/**
 * Displays the mode in the information panel.
 *
 * @param {*} g The d3 selection of the SVG g element containing the mode
 * @param {object} d The data to display
 */
function setMode(g, d) {
  // TODO : Set the mode
  const mode = d.properties.MODE || 'Non spécifié';

  // Afficher le mode comme sous-titre
  g.text(`Mode: ${mode}`)
    .style('margin-top', '10px')
    .style('margin-bottom', '15px');
}

/**
 * Displays the themes in the information panel. Each theme is appended
 * as an HTML list item element.
 *
 * @param {*} g The d3 selection of the SVG g element containing the themes
 * @param {object} d The data to display
 */
function setTheme(g, d) {
  // TODO : Append a list element representing the given theme
  g.append('li')
    .text(d)
    .style('margin-bottom', '5px');
}
