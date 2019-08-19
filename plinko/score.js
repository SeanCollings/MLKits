const outputs = [];

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  // Ran every time a balls drops into a bucket
  outputs.push([dropPosition, bounciness, size, bucketLabel]);
}

function runAnalysis() {
  // Write code here to analyze stuff
  // [vary this to get a diff test size]
  const testSetSize = 100;
  // [note]
  // To get / find best k, use _.range(1, 20).forEach(k => {...} at the start
  const k = 10;

  // Create a range for K range(inclusive, not inclusive)
  // [vary k to find diff accuracies]
  // [note]
  // To find best feature accuracy... dropPosition, bounciness, size
  // use _.range(0, 3).forEach(feature => {...}
  _.range(0, 3).forEach(feature => {
    // Get desired feature out of outputs array => [[300,4],[350,5]] etc.
    const data = _.map(outputs, row => [row[feature], _.last(row)]);

    const [testSet, trainingSet] = splitDataSet(minMax(data, 1), testSetSize);
    // Filter where, in training set, testpoint (observation) at position [] gives the same value
    // as bucket for testpoint
    const accuracy = _.chain(testSet)
      .filter(
        testPoint =>
          knn(trainingSet, _.initial(testPoint), k) === _.last(testPoint)
      )
      .size() // get length of filter
      .divide(testSetSize) // divide it by size of testset
      .value();

    console.log(
      'For feature of',
      feature,
      'at k of',
      k,
      'accuracy is',
      accuracy * 100,
      '%'
    );
  });
}

// Return bucket that ball fell in most in relation to a test point
function knn(data, point, k) {
  return _.chain(data)
    .map(row => {
      return [distance(_.initial(row), point), _.last(row)];
    })
    .sortBy(0)
    .slice(0, k)
    .countBy(1)
    .toPairs()
    .sortBy(1)
    .last()
    .first()
    .parseInt()
    .value();

  //.initial() -> removes last point
}

function distance(pointA, pointB) {
  return (
    _.chain(pointA)
      .zip(pointB)
      .map(([a, b]) => (a - b) ** 2)
      .sum()
      .value() ** 2
  );

  //.zip([1,1], [4,5]) => [[1,4],[1,5]]
}

// Split data into test and training
// Train on train and test on test...
function splitDataSet(data, testCount) {
  // First shuffle data
  const shuffled = _.shuffle(data);

  const testSet = _.slice(shuffled, 0, testCount);
  const trainingSet = _.slice(shuffled, testCount);

  return [testSet, trainingSet];
}

function minMax(data, featureCount) {
  // normalize the data
  const clonedData = _.cloneDeep(data);

  // Run through columns
  for (let i = 0; i < featureCount; i++) {
    const column = clonedData.map(row => row[i]);
    const min = _.min(column);
    const max = _.max(column);

    // Run through rows
    for (let j = 0; j < clonedData.length; j++) {
      // Use normalize formula
      clonedData[j][i] = (clonedData[j][i] - min) / (max - min);
    }
  }

  return clonedData;
}
