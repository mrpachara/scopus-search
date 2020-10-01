import { Readable } from 'stream';
import { createWriteStream } from 'fs';
import stringify from 'csv-stringify';

import * as elsevier from './elsevier';
import { sleep } from './util';

if(process.argv.length !== 3) {
  console.error(
`
    Usage: %s %s output_file.cs
`
    , process.argv[0], process.argv[1]
  );
  process.exit(0);
}

/* ------------------------- Start: Configuration ------------------------ */
const query = 'authlastname("tinamas")';
const field = 'dc:identifier,dc:title,prism:coverDate,citedby-count,author,authkeywords,prism:aggregationType,prism:publicationName,affiliation';
const transform  = {
  'affiliation': (affiliation: unknown) => {
    return (<Record<string, string>[]>(affiliation || [])).reduce((texts, aff) => {
      texts.push(`${aff['afid']}:${aff['affilname']}, ${aff['affiliation-city']}, ${aff['affiliation-country']}`);
      return texts;
    }, <string[]>[]).join('\n');
  },

  'author': (author: unknown) => {
    return (<Record<string, string>[]>(author || [])).reduce((texts, aff) => {
      texts.push(`${aff['authid']}:${aff['authname']}`);
      return texts;
    }, <string[]>[]).join('\n');
  },

  'author-count': (author: unknown) => (<Record<string, string>[]>(author || [])).length,
};

/* ------------------------- End: Configuration ------------------------ */

type tranformKeyType = keyof typeof transform;

 const sourceStream = new Readable({
  objectMode: true,
  read() {'dummy';},
});
sourceStream
  .pipe(stringify({
    quoted: true,
    header: true,
  }))
  .pipe(createWriteStream(process.argv[2]))
;

function processResponse(res: elsevier.ElsevierResponst, count: number) {
  const quota = (+<string>res.headers['x-ratelimit-limit']).toLocaleString();
  const remain = (+<string>res.headers['x-ratelimit-remaining']).toLocaleString();
  const nextReset = new Date(+<string>res.headers['x-ratelimit-reset']);
  console.info('Avariable quota: %s/%s, Reset on %s.',
    remain.padStart(quota.length), quota,
    nextReset.toLocaleString());

  return processResult(<Record<string, unknown>>res.data['search-results'], count);
}

function processResult(searchResult: Record<string, unknown>, count: number): number {
  const entry = (<{'entry': Record<string, unknown>[]}>searchResult)['entry'];
  if(entry) {
    const totalResults = +<string>searchResult['opensearch:totalResults'];
    const newCount = count + entry.length;
    const newCountText = newCount.toLocaleString();
    const totalResultsText = totalResults.toLocaleString();
    console.info(`Number of retrieval: %s/%s`,
      newCountText.padStart(totalResultsText.length), totalResultsText);
    //process.stdout.write(`Number of retrieval: ${newCount}/${totalResults}\n`);
    entry.map((item) => {
      return {
        ...item,
        ...Object.keys(transform).reduce((result, key) => {
          if(item[key] !== undefined) {
            result[key] = transform[<tranformKeyType>key](item[key]);
          }
          return result
        }, <Record<string, unknown>>{}),
      };
    }).forEach((item) => {
      //console.debug(item['dc:title']);
      //console.debug(item);
      sourceStream.push(item);
    });

    return entry.length;
  }

  return 0;
}

(async () => {
  try {
    let res = await elsevier.query('content/search/scopus', query, {
      'count': 200,
      'field': field,
    });

    for(let hasNext = true, count = 0; hasNext;) {
      const resultCount = processResponse(res, count);
      hasNext = (resultCount > 0);
      if(hasNext) {
        count += resultCount;
        const links = (<{'link' : elsevier.ResultLink[]}>res.data['search-results']).link;
        const nextLink = links.find((link) => link['@ref'] === 'next');
        if(nextLink) {
          await sleep(150);
          res = await elsevier.follow(nextLink['@href']);
        } else {
          hasNext = false;
        }
      }
    }
  } catch(excp) {
    console.error(excp);
  }
})();
