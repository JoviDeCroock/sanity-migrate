const dotenv = require('dotenv');

dotenv.config();

const config = {
  dataset: process.env.SANITY_DATASET,
  projectId: process.env.SANITY_PROJECT_ID,
  token: process.env.SANITY_TOKEN,
}

module.exports = config;
