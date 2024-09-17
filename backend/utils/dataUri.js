import dotUriParser from "datauri/parser.js";
import path from "path";

const parser = new dotUriParser();
const getDataUri = (file) => {
  const extName = path.extname(file.originalName).toString();
  return parser.format(extName, file.buffer).content;
};

export default getDataUri;
