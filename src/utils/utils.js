import crypto from "crypto";
export const slugify = (str) => {
  return str
    .normalize("NFD") // split accented letters
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase() // lowercase
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .trim() // remove start/end spaces
    .replace(/\s+/g, "-") // replace spaces with dashes
    .replace(/-+/g, "-"); // collapse multiple dashes
};
export function hashMD5(string) {
  const hash = crypto.createHash("md5").update(string).digest("hex");

  return hash;
}
