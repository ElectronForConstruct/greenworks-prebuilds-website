const request = require('request');
const JSZIP = require('jszip');
const util = require('util');

const zip = new JSZIP();
const dl = util.promisify(request);

const downloadFromId = async (id, token) => {
  const url = `https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases/assets/${id}`;

  const infos = await dl({
    url,
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'Greenworks Prebuilds Downloader',
    },
    json: true,
  });

  const stream = await dl({
    url,
    encoding: null,
    headers: {
      Accept: 'application/octet-stream',
      Authorization: `token ${token}`,
      'User-Agent': 'Greenworks Prebuilds Downloader',
    },
  });

  return {
    content: stream.body,
    name: infos.body.name,
  };
};

const assoc = {
  linux: 'linux',
  darwin: 'osx',
  win32: 'win',
  x64: '64',
  ia32: '32',
};

exports.handler = async function (event) {
  const { ids: _ids, token } = event.queryStringParameters;

  if (!_ids || _ids.length === 0) {
    return {
      statusCode: 500,
      body: 'Unable to get asset ids to download',
    };
  }

  const ids = _ids.split(',');

  const pDownloads = [];

  for (let i = 0; i < ids.length; i += 1) {
    pDownloads.push(downloadFromId(ids[i], token));
  }
  const files = await Promise.all(pDownloads);
  files.forEach((file) => {
    const { name } = file;
    const regFile = /(.*)-(.*)-(.*)-(.*)-(.*)\.node/.exec(name);
    console.log(regFile);
    const [, , runtime, abi, os, arch] = regFile;
    console.log(`Adding ${name} (${runtime}, ${abi}, ${os}, ${arch})`);
    zip.file(`${runtime}/${abi}/greenworks-${assoc[os]}${assoc[arch]}.node`, file.content);
  });

  console.log('All files prepared');

  const body = await zip.generateAsync({
    type: 'base64',
    compression: 'DEFLATE',
  });

  console.log('Returning');

  return {
    headers: {
      'Content-Type': 'application/zip, application/octet-stream',
      'Content-disposition': 'attachment; filename=greenworks-prebuilds.zip',

      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    },
    body,
    isBase64Encoded: true,
    statusCode: 200,
  };
  // return {
  //   statusCode: 500,
  //   body: 'Error preparing files',
  // };
};
