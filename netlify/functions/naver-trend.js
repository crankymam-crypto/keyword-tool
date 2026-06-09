exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { clientId, clientSecret, body: apiBody, endpoint } = JSON.parse(event.body);

    const url = endpoint === 'search'
      ? 'https://openapi.naver.com/v1/datalab/search'
      : `https://openapi.naver.com/v1/datalab/${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(apiBody)
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'JSON 파싱 오류', raw: text.slice(0, 500) }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
