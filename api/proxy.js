export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { clientId, clientSecret, anthropicKey, body: apiBody, endpoint } = req.body;

    if (endpoint === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(apiBody)
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    const urlMap = {
      'search': 'https://openapi.naver.com/v1/datalab/search',
      'shopping/category/keyword/rank': 'https://openapi.naver.com/v1/datalab/shopping/category/keyword/rank',
    };
    const url = urlMap[endpoint] || `https://openapi.naver.com/v1/datalab/${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(apiBody)
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
