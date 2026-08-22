function logRequest(req) {
  const time = new Date().toISOString();

  console.log(`${time} ${req.method} ${req.url}`);
}

module.exports = {
  logRequest
};
