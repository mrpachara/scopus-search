import { Readable } from 'stream';
//import { createWriteStream } from 'fs';
import stringify from 'csv-stringify';

import { sleep } from './util';

const sourceStream = new Readable({
  objectMode: true,
  read() {'dummy';},
});

sourceStream
  .pipe(stringify({
    quoted: true,
    header: true,
  }))
  .pipe(process.stdout)
;

(async () => {
  await sleep(1000);
  sourceStream.push({a: 1, b: 2});
  await sleep(1000);
  sourceStream.push({a: 3, b: 4});
  await sleep(1000);
  sourceStream.push({a: 5, b: 6});
})();
