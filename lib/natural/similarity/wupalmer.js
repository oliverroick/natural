var natural = require('natural');
var wordnet = new natural.WordNet();

/**
 * [getWuPalmerSimilarity description]
 * @param  {[type]}   str1     [description]
 * @param  {[type]}   str2     [description]
 * @param  {Function} callback [description]
 */
var getWuPalmerSimilarity = function(str1, str2, callback) {
	var pending = 2;
	var startingNodes = {};
	var allSet = true;

	[str1, str2].forEach(function(str, i) {
		startingNodes['str' + i] = [];
		wordnet.lookup(str, function(results) {
			pending--;
			results.forEach(function(result) {
				if (result.pos === 'n') startingNodes['str' + i].push([result.synsetOffset]);
			});

			if (pending === 0) {
				for (var key in startingNodes) {
					if (startingNodes[key].length === 0) allSet = false;
				}

				if (allSet) getPaths(startingNodes, callback);
				else callback(0);
			}
		});
	});
};

var getPaths = function (startingNodes, callback) {
	var pending = 2;
	var resultPaths = [];
	var count = 0;

	for (var key in startingNodes) {
		wordnet.getPathsToEntity(startingNodes[key], function(paths) {
			resultPaths.push(paths);
			pending--;
			if (pending === 0) calculateSimilarity(resultPaths, callback);
		});
	}
}

/**
 * [calculateSimilarity description]
 * @param  {[type]}   results  [description]
 * @param  {Function} callback [description]
 */
var calculateSimilarity = function(results, callback) {
	var similarity;
	results[0].forEach(function(referencePath) {
		referencePath.forEach(function(referenceNode, i) {
			results[1].forEach(function(comparisonPath) {
				var index = comparisonPath.indexOf(referenceNode);
				if (index != -1) {
					// console.log(referencePath);
					// console.log(comparisonPath);
					var lengthStr0 = i;
					var lengthStr1 = index;
					var lsoDepth = referencePath.length - lengthStr0;
					var wuPalmer = (2 * lsoDepth) / (lengthStr0 + lengthStr1 + 2 * lsoDepth);
					// console.log(wuPalmer);
					if (!similarity || wuPalmer > similarity) similarity = wuPalmer;
				}
			});
		});
	});
	callback(similarity);
}

module.exports = getWuPalmerSimilarity;