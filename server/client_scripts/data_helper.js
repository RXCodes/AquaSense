// convert array of datapoints into an object with keys as the datapoint type and values as an array of datapoints
function prepare_data(datapoints) {
  const result = {};

  for (const dp of datapoints) {
    if (!result[dp.type]) {
      result[dp.type] = [];
    }

    result[dp.type].push({
      x: new Date(dp.time * 1000),
      y: dp.value
    });
  }

  return result;
}

// given a list of datapoints, filter them to only include a specific type between start_time and end_time
// also sort them by time
function get_data(datapoints, start_time, end_time) {
  return datapoints
    .filter(dp => dp.time >= start_time && dp.time <= end_time)
    .sort((a, b) => a.time - b.time);
}
