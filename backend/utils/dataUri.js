import dotUriParser from "datauri/parser.js";
import path from "path";

const parser = new dotUriParser();
export const getDataUri = (file) => {
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer).content;
};
