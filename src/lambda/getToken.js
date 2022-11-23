const handler = async function (event) {
  const { code } = event.queryStringParameters;

  const myHeaders = new Headers();
  myHeaders.append('Accept', 'application/json');
  myHeaders.append('Content-Type', 'application/json');

  const postData = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({
      client_id: process.env.VITE_APP_GH_CLIENT_ID,
      client_secret: process.env.VITE_APP_GH_CLIENT_SECRET,
      code,
    }),
  };

  const dataRAW = await fetch('https://github.com/login/oauth/access_token', postData);

  const data = await dataRAW.json();

  return {
    headers: {
      'Content-Type': 'application/json',

      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    },
    body: JSON.stringify(data),
    statusCode: 200,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { handler };
