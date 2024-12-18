export function getBaseUrl(url) {
  const [beforePull, pullAndAfter] = url.split('/pull/');
  const pullNumber = pullAndAfter.split('/')[0];
  return `${beforePull}/pull/${pullNumber}`;
}