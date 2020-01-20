const compact = require("lodash/compact");
const isPlainObject = require("lodash/isPlainObject");
const isEmpty = require("lodash/isEmpty");

function processLayer(layer) {
  var result = '';
  if (isPlainObject(layer)) {
    if (layer.resource_type === "fetch" || (layer.url != null)) {
      result = `fetch:${base64EncodeURL(layer.url)}`;
    } else {
      let public_id = layer.public_id;
      let format = layer.format;
      let resource_type = layer.resource_type || "image";
      let type = layer.type || "upload";
      let text = layer.text;
      let style = null;
      let components = [];
      const noPublicId = isEmpty(public_id);
      if (!noPublicId) {
        public_id = public_id.replace(new RegExp("/", 'g'), ":");
        if (format != null) {
          public_id = `${public_id}.${format}`;
        }
      }
      if (isEmpty(text) && resource_type !== "text") {
        if (noPublicId) {
          throw "Must supply public_id for resource_type layer_parameter";
        }
        if (resource_type === "subtitles") {
          style = textStyle(layer);
        }
      } else {
        resource_type = "text";
        type = null;
        // type is ignored for text layers
        style = textStyle(layer);

        if (!isEmpty(text)) {
          const noStyle = isEmpty(style);
          if (!(noPublicId || noStyle) || (noPublicId && noStyle)) {
            throw "Must supply either style parameters or a public_id when providing text parameter in a text overlay/underlay";
          }


          // let re = /\$\([a-zA-Z]\w*\)/g;
          // let start = 0;
          // // PATRICK - Why do we escape here?
          //
          // let textSource = smart_escape(decodeURIComponent(text), /[,\/]/g);
          // text = "";
          // for (let res = re.exec(textSource); res; res = re.exec(textSource)) {
          //   text += smart_escape(textSource.slice(start, res.index));
          //   text += res[0];
          //   start = res.index + res[0].length;
          // }
          // text += encodeURIComponent(textSource.slice(start));
        }
      }
      if (resource_type !== "image") {
        components.push(resource_type);
      }
      if (type !== "upload") {
        components.push(type);
      }
      components.push(style);
      components.push(public_id);
      components.push(text);
      result = compact(components).join(":");
    }
  } else if (/^fetch:.+/.test(layer)) {
    result = `fetch:${base64EncodeURL(layer.substr(6))}`;
  } else {
    result = layer;
  }
  return result;
}

exports.processLayer = processLayer;
