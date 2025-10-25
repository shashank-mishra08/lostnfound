// utils/regex.js
// ------------------------------------------------------------
// user input ko regex me directly dalne se injection / crash ho sakta hai.
// ye chhota helper special chars escape kar deta hai.
// ------------------------------------------------------------
function escapeRegex(str = "") {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
module.exports = { escapeRegex };
