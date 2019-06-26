import got from 'got';
import JSZIP from 'jszip';

exports.handler = async function (event, context, callback) {
  const { ids: _ids } = event.queryStringParameters;
  const ids = _ids.split(',');

  const zip = new JSZIP();

  console.log('ids', ids);

  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    const url = `https://api.github.com/repos/ElectronForConstruct/greenworks-prebuilds/releases/assets/${id}`;

    // eslint-disable-next-line
    const infos = await got(url, { json: true });
    // console.log('infos', infos.body);

    // eslint-disable-next-line
    const stream = got(url, {
      stream: true,
      headers: {
        Accept: 'application/octet-stream',
      },
    });

    console.log(`File ${i}`);

    zip.file(`${infos.body.name}.node`, stream);
  }

  zip
    .generateAsync({
      type: 'base64',
      compression: 'DEFLATE',
    })
    .then((zipFile) => {
      console.log('No errors');
      callback(null, {
        headers: {
          'Content-Type': 'application/zip, application/octet-stream',
          'Content-disposition': 'attachment; filename=greenworks-binaries.zip',

          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
        body: zipFile,
        isBase64Encoded: true,
        statusCode: 200,
      });
    }, (error) => {
      console.log('Error', error);
      callback(error);
    });
};
