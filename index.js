const app = require("./app");

const PORT = process.env.PORT || 3000;

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
