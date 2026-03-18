// Claves AWN - Minisite
// Application Key (con etiqueta "application key"): 94e71a40ce...
// API Key (sin etiqueta, la de abajo): 5eedc069ca...
const API_KEY = '5eedc069ca614d339f4a29adb23257a0d486ea27b6544569aa5117d6ea2bfda5';
const APP_KEY = '94e71a40ce544f578aa00d3a495b1cc2f4a713f04a024b0f94c738f8566a6df9';

export default async function handler(req, res) {
  const url = `https://api.ambientweather.net/v1/devices?applicationKey=${APP_KEY}&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Log para diagnóstico
    console.log('AWN status:', response.status);
    console.log('AWN response preview:', text.substring(0, 200));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(502).json({ error: 'AWN no devolvió JSON válido', raw: text.substring(0, 200) });
    }

    // Si AWN devuelve error
    if (data.error) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json({ error: 'AWN error: ' + JSON.stringify(data) });
    }

    // Buscar la estación más reciente
    if (Array.isArray(data) && data.length > 0) {
      const station = data.reduce((a, b) =>
        ((a.lastData?.dateutc || 0) > (b.lastData?.dateutc || 0) ? a : b));

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
      return res.status(200).json(station.lastData);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ error: 'No se encontraron estaciones', data });

  } catch (error) {
    console.log('AWN fetch error:', error.message);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: error.message });
  }
}
