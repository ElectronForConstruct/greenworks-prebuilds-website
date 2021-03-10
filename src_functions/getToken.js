import request from 'request';
import util from 'util';

// const isDev = process.env.NODE_ENV === 'production';

const rq = util.promisify(request);

exports.handler = async function (event) {
  const { code } = event.queryStringParameters;

  const data = await rq({
    url: 'https://github.com/login/oauth/access_token',
    method: 'POST',
    json: {
      client_id: process.env.VUE_APP_GH_CLIENT_ID,
      client_secret: process.env.VUE_APP_GH_CLIENT_SECRET,
      code,
    },
  });

  return {
    headers: {
      'Content-Type': 'application/json',

      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    },
    body: JSON.stringify(data.body),
    statusCode: 200,
  };
};
