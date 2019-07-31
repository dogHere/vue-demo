
import axios from 'axios';

let errorHandle;
function ssoURL() {
  const returnUrl = `http://${window.location.host}/data-corp/callback?redirect=${encodeURIComponent(window.location.href)}`;
  const ssoLoginUrl = `https://sso.corp.kuaishou.com/?service=${encodeURIComponent(returnUrl)}`;
  return ssoLoginUrl;
}
function axiosRequst(options) {
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
    }else{
      ajaxPromise = axios.post(url,data)
    }
    return ajaxPromise.catch(err=>{
      if (+err.response.status === 401) {
        window.location.href = ssoURL();
      }
      console.log(err);
      if(errorHandle){
        errorHandle(err)
      }
    }).then(response=>{
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

function setErrorHandle(handle){
  errorHandle = handle
}
  
export   {
  axiosRequst,
  setErrorHandle
}