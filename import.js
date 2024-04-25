const fastCsv = require('fast-csv');
const fs = require('fs');
const readline = require('readline');
const connectionString = 'postgres://localhost:password@hpostgres:5432/steam_data';


//Function to read the csv file
async function readCsv(filePath) {
    try {
      const data = [];
      return new Promise((resolve, reject) => {
        fastCsv
          .parseFile(filePath, { headers: true })  
          .on("data", (row) => data.push(row))
          .on("end", () => resolve(data))
          .on("error", (error) => reject(error));
      });
    } catch (error) {
      console.error("Error reading CSV file:", error);
      throw error; 
    }
  }

//Function that filters out any rows that are missing inforation
function filterData(data) {
    return data.filter((row) => !Object.values(row).some((value) => !value));
}

async function filterAndProcessData(filePath) {
    try {
      // 1. Call readCsv to get the data
      const csvData = await readCsv(filePath);
  
      // 2. Process the returned data (filter in this case)
      const filteredData = filterData(csvData);
  
      console.log("Filtered data:", filteredData);
    } catch (error) {
      console.error("Error processing CSV data:", error);
    }
  }


//Function that counts each game's reviews
async function getReviewCounts(filePath) {
    const reviews = await readCsv(filePath);
    const reviewCounts = reviews.reduce((acc, review) => {
      const gameName = review.app_name;
      acc[gameName] = (acc[gameName] || 0) + 1;
      return acc;
    }, {});
    return reviewCounts;
  }

  //creates a table if one doesn't exist
  //Not workin :(
  async function createTable(connection, game) {
    const tableName = game;
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

  // Inserts data into the table
  async function insertData(connection, tableName, data, reviewCounts) {
    for (const row of data) {
      const reviewCount = reviewCounts[row.app_name] || 0;
      const sql = `INSERT INTO ${tableName} (rank, name, platform, year, genre, publisher, NA_sales, EU_sales, JP_sales, Other_sales, Global_sales, number_of_reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.execute(sql, [row.rank, row.name, row.platform, row.year, row.genre, row.publisher, row.NA_sales, row.EU_sales, row.JP_sales, row.Other_sales, row.Global_sales, reviewCount]);
    }
  }

  filterAndProcessData('vgsales.csv')
  filterAndProcessData('dataset.csv')
  getReviewCounts('dataset.csv')
  
  