const TITLES = {
  '1. Noyau villageois': 'Noyau villageois',
  '2. Rue commerciale de quartier, d’ambiance ou de destination': 'Rue commerciale de quartier, d’ambiance ou de destination',
  '3. Rue transversale à une rue commerciale': 'Rue transversale à une rue commerciale',
  '4. Rue bordant un bâtiment public ou institutionnel  (tels qu’une école primaire ou secondaire, un cégep ou une université, une station de métro, un musée, théâtre, marché public, une église, etc.)': 'Rue bordant un bâtiment public ou institutionnel',
  '5. Rue en bordure ou entre deux parcs ou place publique': 'Rue en bordure ou entre deux parcs ou place publique',
  '6. Rue entre un parc et un bâtiment public ou institutionnel': 'Rue entre un parc et un bâtiment public ou institutionnel',
  '7. Passage entre rues résidentielles': 'Passage entre rues résidentielles'
}

/**
 *  Uses the projection to convert longitude and latitude to xy coordinates.
 *
 * The keys for the coordinate are written to each feature object in the data.
 *
 * @param {object[]} data The data to be displayed
 * @param {*} projection The projection to use to convert the longitude and latitude
 */
export function convertCoordinates(data, projection) {
  // TODO : Add an x and y key to each feature object in the data
  // representing its x and y position according to the projection.
  // Each resulting object should be structured as :

  /*
    {
      type:'...'
      properties:{...}
      geometry:{...}
      x:...
      y:...
    }
  */
  console.log("Converting coordinates for", data.features.length, "features");

  // Parcours de chaque caractéristique dans les données
  data.features.forEach((feature, index) => {
    try {
      // Les données GeoJSON peuvent avoir différents types de géométrie
      if (!feature.geometry) {
        console.warn(`Feature ${index} has no geometry`);
        return;
      }

      if (feature.geometry.type === 'Point') {
        // Pour les points, les coordonnées sont simplement [longitude, latitude]
        const projectedCoords = projection(feature.geometry.coordinates);
        if (projectedCoords) {
          feature.x = projectedCoords[0];
          feature.y = projectedCoords[1];
        } else {
          console.warn(`Failed to project Point coordinates for feature ${index}`);
        }
      }
      else if (feature.geometry.type === 'LineString' ||
        feature.geometry.type === 'MultiPoint') {
        // Pour les lignes ou multi-points, nous calculons le centroïde
        // (moyenne des coordonnées pour simplifier)
        if (feature.geometry.coordinates.length > 0) {
          let sumX = 0, sumY = 0;
          let validPoints = 0;

          feature.geometry.coordinates.forEach(coord => {
            const projectedCoord = projection(coord);
            if (projectedCoord) {
              sumX += projectedCoord[0];
              sumY += projectedCoord[1];
              validPoints++;
            }
          });

          if (validPoints > 0) {
            feature.x = sumX / validPoints;
            feature.y = sumY / validPoints;
          } else {
            console.warn(`No valid coordinates for LineString/MultiPoint feature ${index}`);
          }
        }
      }
      else if (feature.geometry.type === 'Polygon' ||
        feature.geometry.type === 'MultiLineString') {
        // Pour les polygones, nous prenons le centroïde du premier anneau
        if (feature.geometry.coordinates.length > 0 &&
          feature.geometry.coordinates[0].length > 0) {

          let sumX = 0, sumY = 0;
          let validPoints = 0;

          feature.geometry.coordinates[0].forEach(coord => {
            const projectedCoord = projection(coord);
            if (projectedCoord) {
              sumX += projectedCoord[0];
              sumY += projectedCoord[1];
              validPoints++;
            }
          });

          if (validPoints > 0) {
            feature.x = sumX / validPoints;
            feature.y = sumY / validPoints;
          } else {
            // Fallback au premier point si aucun point valide
            const projectedCoord = projection(feature.geometry.coordinates[0][0]);
            if (projectedCoord) {
              feature.x = projectedCoord[0];
              feature.y = projectedCoord[1];
            } else {
              console.warn(`No valid coordinates for Polygon/MultiLineString feature ${index}`);
            }
          }
        }
      }
      else if (feature.geometry.type === 'MultiPolygon') {
        // Pour les multi-polygones, nous prenons le premier point du premier anneau du premier polygone
        if (feature.geometry.coordinates.length > 0 &&
          feature.geometry.coordinates[0].length > 0 &&
          feature.geometry.coordinates[0][0].length > 0) {

          const projectedCoord = projection(feature.geometry.coordinates[0][0][0]);
          if (projectedCoord) {
            feature.x = projectedCoord[0];
            feature.y = projectedCoord[1];
          } else {
            console.warn(`Failed to project MultiPolygon coordinates for feature ${index}`);
          }
        }
      }
      else {
        console.warn(`Type de géométrie non pris en charge: ${feature.geometry.type} pour feature ${index}`);
      }

      // Vérifier si les coordonnées x, y sont valides
      if (feature.x === undefined || feature.y === undefined ||
        isNaN(feature.x) || isNaN(feature.y)) {
        console.warn(`Invalid coordinates for feature ${index}: (${feature.x}, ${feature.y})`);
      }
    } catch (error) {
      console.error(`Error processing feature ${index}:`, error);
    }
  });

  console.log("Coordinate conversion complete");
}

/**
 * Simplifies the titles for the property 'TYPE_SITE_INTERVENTION'. The names
 * to use are contained in the constant 'TITLES' above.
 *
 * @param {*} data The data to be displayed
 */
export function simplifyDisplayTitles(data) {
  // TODO : Simplify the titles as required
  data.features.forEach(feature => {
    // Récupération du titre actuel
    const currentTitle = feature.properties.TYPE_SITE_INTERVENTION;

    // Remplacement par le titre simplifié s'il existe dans le dictionnaire TITLES
    if (currentTitle && TITLES[currentTitle]) {
      feature.properties.TYPE_SITE_INTERVENTION = TITLES[currentTitle];
    }
  });
}

/**
 * Reverses the coordinates in the GeoJson data using turf's rewind function.
 * See here : https://turfjs.org/docs/#rewind
 * @param {*} data The data to be displayed
 * @returns {*} The GeoJson data with reversed coordinates.
 */
export function reverseGeoJsonCoordinates(data) {
  // TODO : Rewind the GeoJso data.
  console.log("Inversion des coordonnées GeoJSON");

  // Vérifier si turf est disponible
  if (typeof turf !== 'undefined' && typeof turf.rewind === 'function') {
    console.log("Using turf.js rewind function");
    return turf.rewind(data, { reverse: true, mutate: false });
  }

  console.log("Using manual coordinate reversal");

  // Fonction récursive spécifique pour inverser les coordonnées dans MultiPolygon
  function reverseMultiPolygonCoords(multiPolygon) {
    // Pour chaque polygone dans le multiPolygon
    return multiPolygon.map(polygon => {
      // Pour chaque anneau dans le polygone
      return polygon.map(ring => {
        // Pour chaque point [lon, lat] dans l'anneau, inverser en [lat, lon]
        return ring.map(point => [point[1], point[0]]);
      });
    });
  }

  // Fonction récursive générale pour inverser tous types de coordonnées
  function reverseCoords(coords) {
    if (!coords || !Array.isArray(coords)) return coords;

    // Cas simple: une paire de coordonnées [lon, lat]
    if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return [coords[1], coords[0]];
    }

    // Cas récursif: tableau de tableaux
    return coords.map(coord => reverseCoords(coord));
  }

  // Copie profonde des données
  const rewoundData = JSON.parse(JSON.stringify(data));

  // Parcourir toutes les features
  rewoundData.features.forEach(feature => {
    if (!feature.geometry || !feature.geometry.coordinates) return;

    // Traitement différent selon le type de géométrie
    if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates = reverseMultiPolygonCoords(feature.geometry.coordinates);
    } else {
      feature.geometry.coordinates = reverseCoords(feature.geometry.coordinates);
    }
  });

  return rewoundData;
}
