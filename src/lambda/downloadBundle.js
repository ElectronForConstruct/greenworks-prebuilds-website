import JSZIP from 'jszip';
import fetch from 'node-fetch';

const zip = new JSZIP();

const downloadFromId = async (id, token) => {
  const url = `https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases/assets/${id}`;

  const headers = new Headers();
  headers.append('Authorization', `token ${token}`);
  headers.append('User-Agent', 'Greenworks Prebuilds Downloader');
  headers.append('Accept', 'application/json');
  headers.append('Content-Type', 'application/json');
  const infosRAW = await fetch(url, {
    headers,
  });

  const infos = await infosRAW.json();

  const headers2 = new Headers();
  headers2.append('Authorization', `token ${token}`);
  headers2.append('Accept', 'application/octet-stream');
  headers2.append('User-Agent', 'Greenworks Prebuilds Downloader');
  headers2.append('Content-Type', 'application/json');

  const stream = await fetch(url, {
    headers: headers2,
  });

  return {
    content: stream.body,
    name: infos.name,
  };
};

const assoc = {
  linux: 'linux',
  darwin: 'osx',
  win32: 'win',
  x64: '64',
  ia32: '32',
};

const handler = async (event) => {
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
    pDownloads.push(() => downloadFromId(ids[i], token));
  }
  const files = await Promise.all(pDownloads.map((x) => x()));
  files.forEach((file) => {
    const { name } = file;
    const regFile = /(.*)-(.*)-(.*)-(.*)-(.*)\.node/.exec(name);
    const [, , runtime, abi, os, arch] = regFile;
    zip.file(`${runtime}/${abi}/greenworks-${assoc[os]}${assoc[arch]}.node`, file.content);
  });

  const body = await zip.generateAsync({
    type: 'base64',
    compression: 'DEFLATE',
  });

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

// eslint-disable-next-line import/prefer-default-export
export { handler };
