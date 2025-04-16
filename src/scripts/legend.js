/**
 * Draws the legend for crime data visualization with a higher position.
 *
 * @param {*} colorScale The color scale used in the visualization
 * @param {*} g The d3 Selection of the SVG g element containing the visualization
 */
export function drawCrimeLegend(colorScale, g) {
  // Supprimer toute légende existante
  g.select('.legend').remove();

  // Récupérer les seuils de l'échelle de couleurs
  const thresholds = colorScale.domain();
  const colors = colorScale.range();

  // Utiliser les descriptions des niveaux de criminalité fournies par l'échelle de couleur
  // Si non disponibles, utiliser des valeurs par défaut
  const crimeLabels = colorScale.labels || [
    "Très faible",
    "Faible",
    "Moyen",
    "Élevé",
    "Très élevé"
  ];

  // Créer un groupe pour la légende - position ajustée plus haut (50, 50)
  const legend = g.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(50, 100)'); // Position élevée

  // Ajouter un fond blanc pour la légende
  legend.append('rect')
    .attr('x', -10)
    .attr('y', -25)
    .attr('width', 220) // Largeur augmentée pour accommoder les valeurs
    .attr('height', colors.length * 25 + 30)
    .attr('fill', 'white')
    .attr('stroke', '#ddd')
    .attr('stroke-width', 1)
    .attr('rx', 5)
    .attr('ry', 5);

  // Ajouter un titre à la légende
  legend.append('text')
    .attr('x', 0)
    .attr('y', -5)
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .text('Niveau de criminalité');

  // Créer chaque entrée de la légende
  colors.forEach((color, i) => {
    // Ne pas afficher la première entrée si le seuil est 0
    if (i === 0 && thresholds[0] === 0) return;

    const actualIndex = (thresholds[0] === 0) ? i - 1 : i;
    const y = i * 25; // Espacement vertical

    // Ajouter un rectangle coloré
    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('y', y)
      .attr('fill', color)
      .attr('stroke', '#888')
      .attr('stroke-width', 0.5);

    // Ajouter le texte descriptif
    legend.append('text')
      .attr('x', 25)
      .attr('y', y + 12)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(crimeLabels[actualIndex]);

    // Ajouter le texte numérique
    let valueText;
    if (i === 0) {
      valueText = `< ${thresholds[i]}`;
    } else if (i === colors.length - 1) {
      valueText = `${thresholds[i - 1]}+`;
    } else {
      valueText = `${thresholds[i - 1]} - ${thresholds[i] - 1}`;
    }

    legend.append('text')
      .attr('x', 130) // Position ajustée pour meilleur alignement
      .attr('y', y + 12)
      .attr('font-size', '11px')
      .attr('text-anchor', 'start')
      .style('fill', '#666')
      .text(valueText);
  });
}