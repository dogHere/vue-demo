
import axios from 'axios';

let errorHandle;

function axiosRequst(options) {
    const { type = 'get', path, params, data } = options;
  
    let url = path;
  
    let arg = convertToArgs(params);
    if (arg) {
      url = `${url}?${arg}`;
    }
    // console.log("axiosRequst to ",url);
    if (type === 'get') {
      return  axios.get(url).catch(err=>{
        console.log(err)
        if(errorHandle){
          errorHandle(err)
        }
      }).then(response=>{
        response.args = options
        return response
      });
    }else{
      return  axios.post(url,data)
      .catch(err=>{
        console.log(err)
        if(errorHandle){
          errorHandle(err)
        }
      }).then(response=>{
        response.args = options
        return response
      });
    }
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