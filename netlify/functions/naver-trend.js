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
    const { clientId, clientSecret, anthropicKey, body: apiBody, endpoint } = JSON.parse(event.body);

    // Anthropic API 호출 (타오바오 검색어 자동 생성)
    if (endpoint === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(apiBody)
      });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // 네이버 API 호출
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

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch(e) { return { statusCode: 200, headers, body: JSON.stringify({ error: 'JSON 파싱 오류', raw: text.slice(0, 500) }) }; }

    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
