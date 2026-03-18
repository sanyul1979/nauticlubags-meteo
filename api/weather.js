// Ambient Weather - minisite-final
// Usa variables de entorno si existen; si no, cae a las llaves nuevas que compartiste.
const API_KEY = process.env.AMBIENT_API_KEY || 'dac621dacb6746cb8419cd1a4032d4aabc299e4073d443d2847e4433c151e828';
const APP_KEY = process.env.AMBIENT_APPLICATION_KEY || '19ba80919e5f4842b3ea0eb97c0abf3241e598f4469d4cdbad58102f77978380';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  if (!API_KEY || !APP_KEY) {
    return res.status(500).json({
      error: 'Faltan credenciales de Ambient Weather',
      hasApiKey: Boolean(API_KEY),
      hasAppKey: Boolean(APP_KEY),
    });
  }

  const url = `https://api.ambientweather.net/v1/devices?applicationKey=${APP_KEY}&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    const text = await response.text();
    console.log('AWN status:', response.status);
    console.log('AWN response preview:', text.substring(0, 300));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: 'Ambient Weather no devolvió JSON válido',
        status: response.status,
        raw: text.substring(0, 300),
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Ambient Weather respondió con error',
        details: data,
      });
    }

    if (data?.error) {
      return res.status(502).json({
        error: 'Ambient Weather devolvió un error de aplicación',
        details: data,
      });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron estaciones en Ambient Weather',
        details: data,
      });
    }

    const station = data.reduce((latest, current) => {
      const latestTs = latest?.lastData?.dateutc || 0;
      const currentTs = current?.lastData?.dateutc || 0;
      return currentTs > latestTs ? current : latest;
    });

    if (!station?.lastData) {
      return res.status(404).json({
        error: 'La estación no trae lastData',
        station,
      });
    }

    return res.status(200).json({
      ...station.lastData,
      stationName: station.info?.name || station.macAddress || 'Estación Ambient Weather',
      debug: {
        pulledFrom: 'ambientweather/v1/devices',
        stationCount: data.length,
      },
    });
  } catch (error) {
    console.log('AWN fetch error:', error?.message || error);
    return res.status(500).json({
      error: 'No se pudo consultar Ambient Weather',
      details: error?.message || String(error),
    });
  }
}
