export function compareBaseUrls(url1, url2) {
  console.log(`Comparing ${url1} with ${url2}`)
    const getBaseUrl = (url) => {
      const [beforePull, pullAndAfter] = url.split('/pull/');
      const pullNumber = pullAndAfter.split('/')[0];
      return `${beforePull}/pull/${pullNumber}`;
    };
  
    return getBaseUrl(url1) === getBaseUrl(url2);
  }