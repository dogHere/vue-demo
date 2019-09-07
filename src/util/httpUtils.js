
import axios from 'axios';

let errorHandle;
function ssoURL() {
  const returnUrl = `http://${window.location.host}/data-corp/callback?redirect=${encodeURIComponent(window.location.href)}`;
  const ssoLoginUrl = `https://sso.corp.kuaishou.com/?service=${encodeURIComponent(returnUrl)}`;
  return ssoLoginUrl;
}

// function localSetCookie() {
//   if (process.env.NODE_ENV !== 'production') {
//     axios.defaults.headers.common['Cookie'] = "clientid=3; did=web_297659a1579d3dc9a30cfc4727dad30a; live_deviceid=web_297659a1579d3dc9a30cfc4727dad30a; client_key=65890b29; didv=1560753795875; _did=web_9056625203FD0F05; accessproxy_session=f010eaf0-f244-4df6-9b23-8f11bd41c362; userToken=D2E/5nVNz09ZGR3jXH4KEw==-ranxianglei; userName=ranxianglei; session_id=238946903933F939"
//   }
// }

function axiosRequst(options) {
  // localSetCookie();

  const { type = 'get', path, params, data } = options;

  let url = path;

  let arg = convertToArgs(params);
  if (arg) {
    url = `${url}?${arg}`;
  }
  let ajaxPromise;

  // console.log("axiosRequst to ",url);
  if (type === 'get') {
    ajaxPromise = axios.get(url)
  } else {
    ajaxPromise = axios.post(url, data)
  }
  return ajaxPromise.catch(err => {
    if (+err.response.status === 401) {
      window.location.href = ssoURL();
    }
    console.log(err);
    if (errorHandle) {
      errorHandle(err)
    }
  }).then(response => {
    response.args = options
    return response
  });
}

function convertToArgs(arg) {
  if (!arg) return '';

  var res = Object.keys(arg).map((key) => {

    var value = arg[key];
    if (value === null) {
      return null;
    }
    return (`${key}=${value}`);
  }).filter(k => k !== null).reduce((k, v) => `${k}&${v}`)

  return res;
}

function setErrorHandle(handle) {
  errorHandle = handle
}

export {
  axiosRequst,
  setErrorHandle
}