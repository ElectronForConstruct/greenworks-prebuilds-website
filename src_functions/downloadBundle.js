import got from 'got';
import JSZIP from 'jszip';

exports.handler = async function (event) {
  const { ids: _ids } = event.queryStringParameters;

  if (!_ids || _ids.length === 0) {
    return {
      statusCode: 500,
      body: 'Unable to get asset ids to download',
    };
  }

  const ids = _ids.split(',');

  const zip = new JSZIP();

  console.log('ids', ids);

  const pDownloads = [];

  try {
    for (let i = 0; i < ids.length; i += 1) {
      pDownloads.push(new Promise(async (resolve, reject) => {
        const id = ids[i];
        const url = `https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases/assets/${id}`;

        const infos = await got(url, {
          json: true,
          headers: {
            Authorization: `token ${'49f5687fc74189014c37fedce2fc2d85dda344f1'}`,
          },
        });
        // console.log('infos', infos.body);

        const stream = got(url, {
          stream: true,
          headers: {
            Accept: 'application/octet-stream',
            Authorization: `token ${'49f5687fc74189014c37fedce2fc2d85dda344f1'}`,
          },
        });

        console.log(`File ${i}`);

        zip.file(infos.body.name, stream);
        resolve(true);
      }));
    }
    try {
      await Promise.all(pDownloads);
    } catch (e) {
      console.log('Error', e);
    }
  } catch (e) {
    console.error('error', e);
    return {
      statusCode: 500,
      body: e,
    };
  }

  const body = await zip.generateAsync({
    type: 'base64',
    compression: 'DEFLATE',
  });

  try {
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
  } catch (e) {
    console.log('Error', e);
    return {
      statusCode: 500,
      body: e,
    };
  }
};
