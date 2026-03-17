export default async function handler(req, res) {
  const LAT = 22.1456;
  const LON = -102.4197;
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LON}&date=${today}&formatted=0`
    );
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
