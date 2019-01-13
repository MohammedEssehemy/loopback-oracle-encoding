const encoding = require('encoding');
const iconv = require('iconv-lite');

// data is stored in win-1256 but oracle thinks it is iso-8859-6
// then converts it to utf-8 before sending to us
// so we reverse this sequence

const convertUsingEncoding = (text) => {
  // encoding.convert(text, toCharset, fromCharset);
  // this should be iso-8859-6 buffer but it's actually win-1256
  const win1256Buffer = encoding.convert(text, 'iso-8859-6', 'utf-8');
  return encoding.convert(win1256Buffer, 'utf-8', 'win-1256').toString()
}

const convertUsingIconv = (text) => {
  // Convert from js string to an encoded buffer.
  // this should be iso-8859-6 buffer but it's actually win-1256
  const win1256Buffer = iconv.encode(text, 'iso-8859-6');
  // Convert from an encoded buffer to js string.
  return iconv.decode(win1256Buffer, 'win-1256');
}

const convertObj = (obj) => {
  if (typeof obj === 'string') return convertUsingIconv(obj);
  if (Array.isArray(obj)) return obj.map(convertObj);
  if (typeof obj === 'object') Object.keys(obj)
    .forEach(key => {
      obj[key] = convertObj(obj[key]);
    });
  return obj;
}

module.exports = (Depts) => {
  Depts.afterRemote('find', (ctx) => {
    ctx.result = ctx.result.map(r => r.toJSON()).map(convertObj);
    return Promise.resolve();
  });
};
