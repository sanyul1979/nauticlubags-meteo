export default async function handler(req, res) {
  const LAT = 22.1456;
  const LON = -102.4197;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}`
      + `&hourly=temperature_2m,precipitation_probability,weathercode`
      + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max`
      + `&timezone=America%2FMexico_City&forecast_days=7`;

    const response = await fetch(url);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=1800');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
