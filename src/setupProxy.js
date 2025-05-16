// This file configures the development server for better WSL-to-Windows compatibility
module.exports = function(app) {
  // This allows WebSocket connections from different hosts
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}; 