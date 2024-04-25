const fastCsv = require('fast-csv');

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