const fastCsv = require('fast-csv');
const connectionString = 'postgres://localhost:password@hpostgres:5432/steam_data';

//Function to read the csv file
function readCsv(filePath) {
    const data = [];
    return new Promise((resolve, reject) => {
      fastCsv
        .fromPath(filePath, { headers: true })
        .on("data", (row) => data.push(row))
        .on("end", () => resolve(data))
        .on("error", (error) => reject(error));
    });
}

//Function that filters out any rows that are missing inforation
function filterData(data) {
    return data.filter((row) => !Object.values(row).same((value) => !value));
}

//Function that counts each game's reviews
async function getReviewCounts(filePath) {
    const reviews = await readCsv(filePath);
    const reviewCounts = reviews.reduce((acc, review) => {
      const gameName = review.app_name;
      acc[gameName] = (acc[gameName] || 0) + 1; // Count each occurrence of the game name
      return acc;
    }, {});
    return reviewCounts;
  }

  async function createTable(connection, tableName) {
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (
      rank VARCHAR(255),
      name VARCHAR(255),
      platform VARCHAR(255),
      year INT,
      genre VARCHAR(255),
      publisher VARCHAR(255),
      NA_sales DECIMAL(10,2),
      EU_sales DECIMAL(10,2),
      JP_sales DECIMAL(10,2),
      Other_sales DECIMAL(10,2),
      Global_sales DECIMAL(10,2),
      number_of_reviews INT
    )`;
    await connection.execute(sql);
  }