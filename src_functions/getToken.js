import request from 'request';
import util from 'util';

require('dotenv').config();

const rq = util.promisify(request);

exports.handler = async function (event) {
  const { code } = event.queryStringParameters;

  const data = await rq({
    url: 'https://github.com/login/oauth/access_token',
    method: 'POST',
    json: {
      client_id: process.env.GH_CLIENT_ID,
      client_secret: process.env.GH_CLIENT_SECRET,
      code,
    },
  });

  console.log(data.body);

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
