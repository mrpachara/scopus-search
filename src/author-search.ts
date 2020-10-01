import * as elsevier from './elsevier';

(async () => {
  try {
    const res = await elsevier.get('content/search/scopus', {
      params: {
        'query': 'authlastname(tinamas)',
        'cursor': '*',
        'count': 2,
      }
    });

    console.debug(res.data['search-results']);
  } catch(excp) {
    console.error(excp);
  }
})();
