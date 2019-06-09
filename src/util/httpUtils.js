
import axios from 'axios';

function axiosRequst(options) {
    const { type = 'get', path, params, data } = options;
  
    let url = path;
  
    let arg = convertToArgs(params);
    if (arg) {
      url = `${url}?${arg}`;
    }
    console.log("axiosRequst to ",url);
    if (type === 'get') {
      return  axios.get(url);
    }else{
      return  axios.post(url,data);
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
  
export default axiosRequst