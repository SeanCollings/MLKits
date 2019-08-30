/* Using CPU */
require('@tensorflow/tfjs-node');
const tf = require('@tensorflow/tfjs');

/* Using GPU */
// require('@tensorflow/tfjs-node-gpu');
// const tf = require('@tensorflow/tfjs-node-gpu');
const loadCSV = require('./load-csv');

function knn(features, labels, predictionPoint, k) {
  // Do standardization
  const { mean, variance } = tf.moments(features, 0);

  // Scale prediction point
  const scaledPrediction = predictionPoint.sub(mean).div(variance.pow(0.5));

  return (
    features
      .sub(mean) // standardization formula (val - avg) / std dev
      .div(variance.pow(0.5)) // formula
      .sub(scaledPrediction) // minus prediction point from features to get closest points
      .pow(2) // square each value
      .sum(1) // sum each row
      .sqrt() // squareroot each value
      .expandDims(1) // change to shape of [4,1] (2D - 4 rows/1 column)
      .concat(labels, 1) //combine along the correct axis to get [[x,y], [...]]
      .unstack() // split tensors into smaller tensors inside an array
      .sort((a, b) => (a.get(0) > b.get(0) ? 1 : -1)) // sort tensors by distance to prediction pnt
      .slice(0, k) // js vanilla version of slice
      .reduce((acc, pair) => acc + pair.get(1), 0) / k // get average of top k points
  );
}

// returns js vanilla arrays
let { features, labels, testFeatures, testLabels } = loadCSV(
  'kc_house_data.csv',
  {
    shuffle: true,
    splitTest: 10,
    dataColumns: ['lat', 'long', 'sqft_lot', 'sqft_living'], // which columns to look at
    labelColumns: ['price'] // which columns for label
  }
);

features = tf.tensor(features);
labels = tf.tensor(labels);

testFeatures.forEach((testPoint, i) => {
  const result = knn(features, labels, tf.tensor(testPoint), 10);
  // Get error of prediction vs actual
  const err = (testLabels[i][0] - result) / testLabels[i][0];
  console.log('Error', err * 100);
});

// Negative value means guessed above value
// Positive equals prediction guessed below
