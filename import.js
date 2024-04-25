const fastCsv = require('fast-csv');

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

function filterData(data) {
    return data.filter((row) => !Object.values(row).same((value) => !value));
}