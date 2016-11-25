const config = require('./config');

export async function getDataFromTypeAndId(type, id) {
  const url = `http://api.football-data.org/v1/${type}/${id}`;
  return await fetchData(url);
}

export async function getDataFromLink(url) {
  const prop = url.split('/')[6];
  const json = await fetchData(url);
  return json[prop];
}

export async function getDataWithFilters(type, id, filters) {
  const baseurl = `http://api.football-data.org/v1/${type}/${id}?`;
  let qParams = '';
  Object.keys(filters).forEach(key => qParams += `${key}=${filters[key]}&`);
  const url = baseurl + qParams.substring(0, qParams.length - 1);
  return await fetchData(url);
}

export async function fetchData(url) {
  try {
    const fetch = require('isomorphic-fetch');
    const response = await fetch(url, {
      headers: { 'X-Auth-Token': config.token }
    });
    const json = await response.json();
    console.log(`Hit the API for ${url}.`);
    console.log(json);
    return json;
  } catch (err) {
    console.error(`Error: Hit the API for ${url} and got ${err}`);
    throw err;
  }
}
