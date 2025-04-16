import * as d3 from 'd3';

// Ajouter dynamiquement le CSS
const style = document.createElement('style');
style.innerHTML = `
  #tooltip {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 5px;
      display: none;
      pointer-events: none;
  }

  #tooltip.hidden {
      display: none;
  }
`;
document.head.appendChild(style);

/**
 * Crée une heatmap interactive à partir d'un fichier CSV et l'affiche dans un conteneur spécifié.
 * @param {string} csvUrl - L'URL du fichier CSV contenant les données.
 * @param {string} containerId - L'ID du conteneur HTML où la heatmap sera affichée.
 */
export function createHeatmap(csvUrl, containerId) {
    const container = document.getElementById(containerId);

    const heatmapDiv = document.createElement('div');
    heatmapDiv.className = 'heatmap-container';
    heatmapDiv.innerHTML = `
      <h2>Distribution des types de crimes par mois</h2>
      <div class="year-selector">
        <label for="year">Sélectionner l'année :</label>
        <select id="year-dropdown">
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
          <option value="2018">2018</option>
          <option value="2017">2017</option>
          <option value="2016">2016</option>
          <option value="2015">2015</option>
        </select>
      </div>

      <div class="season-selector">
        <label for="season">Sélectionner la saison :</label>
        <select id="season-dropdown">
          <option value="summer">Été</option>
          <option value="fall">Automne</option>
          <option value="winter">Hiver</option>
          <option value="spring">Printemps</option>
        </select>
      </div>
    `;
    container.appendChild(heatmapDiv);

    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.classList.add('hidden');
    tooltip.innerHTML = `
      <p><strong>Type de crime : </strong><span id="crime-type"></span></p>
      <p><strong>Mois : </strong><span id="month"></span></p>
      <p><strong>Nombre de crimes : </strong><span id="value"></span></p>
    `;
    document.body.appendChild(tooltip);

    const yearDropdown = document.getElementById('year-dropdown');
    const seasonDropdown = document.getElementById('season-dropdown');

    // Mapping des saisons aux mois
    const seasons = {
        summer: ['Jun', 'Jul', 'Aug'],
        fall: ['Sep', 'Oct', 'Nov'],
        winter: ['Dec', 'Jan', 'Feb'],
        spring: ['Mar', 'Apr', 'May']
    };

    // Fonction pour charger et afficher la heatmap pour une année et une saison données
    function loadHeatmap(year, season) {
        container.querySelector('svg')?.remove()
        const monthsToShow = seasons[season];  // Mois correspondant à la saison sélectionnée

        d3.csv(csvUrl).then(data => {
            const crimeTypes = ['Introduction', 'Infractions entrainant la mort', 'Méfait', 'Vol de véhicule à moteur'];
            const values = [];

            // Transformer les données pour les mois et les types de crimes
            for (let i = 0; i < crimeTypes.length; i++) {
                values.push([]);
                for (let j = 0; j < monthsToShow.length; j++) {
                    const crimeCount = data.filter(d => {
                        const date = new Date(d.DATE);
                        const month = monthsToShow[j];
                        const year = date.getFullYear();

                        return d.SOUS_CATEGORIE === crimeTypes[i] && month === monthsToShow[j] && year === parseInt(yearDropdown.value);
                    });
                    values[i].push(crimeCount.length > 0 ? crimeCount.length : 0);
                }
            }

            const margin = { top: 40, right: 20, bottom: 40, left: 60 };
            const width = 800 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            const svg = d3.select(container)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
                .range([0, width])
                .domain(monthsToShow)
                .padding(0.05);

            const y = d3.scaleBand()
                .range([height, 0])
                .domain(crimeTypes)
                .padding(0.05);

            const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
                .domain([0, d3.max(values, row => d3.max(row))]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x));

            svg.append('g')
                .call(d3.axisLeft(y));

            svg.selectAll('.cell')
                .data(d3.merge(values))
                .enter()
                .append('rect')
                .attr('x', (d, i) => x(monthsToShow[i % monthsToShow.length]))
                .attr('y', (d, i) => y(crimeTypes[Math.floor(i / monthsToShow.length)]))
                .attr('width', x.bandwidth())
                .attr('height', y.bandwidth())
                .attr('fill', d => colorScale(d))
                .on('mouseover', function (event, d) {
                    const xPosition = event.pageX + 5;
                    const yPosition = event.pageY - 28;

                    const monthIndex = Math.floor(i % monthsToShow.length);
                    const crimeTypeIndex = Math.floor(i / monthsToShow.length);

                    const month = monthsToShow[monthIndex];
                    const crimeType = crimeTypes[crimeTypeIndex];

                    d3.select('#tooltip')
                        .style('left', `${xPosition}px`)
                        .style('top', `${yPosition}px`)
                        .select('#crime-type')
                        .text(crimeType);

                    d3.select('#tooltip')
                        .select('#month')
                        .text(month);

                    d3.select('#tooltip')
                        .select('#value')
                        .text(d);

                    d3.select('#tooltip').classed('hidden', false);
                })
                .on('mouseout', function () {
                    d3.select('#tooltip').classed('hidden', true);
                });
        });
    }

    // Charger la heatmap initiale
    loadHeatmap(yearDropdown.value, seasonDropdown.value);

    // Mettre à jour la heatmap lorsque l'année ou la saison change
    yearDropdown.addEventListener('change', (event) => {
        loadHeatmap(event.target.value, seasonDropdown.value);
    });

    seasonDropdown.addEventListener('change', (event) => {
        loadHeatmap(yearDropdown.value, event.target.value);
    });
}