const API_KEY = 'c5c793111502405f9e8c8cc6b5431f33ab04157fe77d4d7d81698ca62d1cd2de';
const APP_KEY = 'ebecbcaba91c401a85db9f168c594bad4d5bf84afb8e4e1b99b1602633072070';
const STATION_NAME = 'Nauticlub';

export default async function handler(req, res) {
  const url = `https://api.ambientweather.net/v1/devices?applicationKey=${APP_KEY}&apiKey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(200).json({ error: 'AWN no devolvió estaciones: ' + JSON.stringify(data).substring(0, 100) });
    }

    let station = data.find(s => s.info && s.info.name && s.info.name.includes(STATION_NAME));
    if (!station) {
      station = data.reduce((a, b) =>
        ((a.lastData?.dateutc || 0) > (b.lastData?.dateutc || 0) ? a : b));
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(200).json(station.lastData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
