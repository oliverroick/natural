var natural = require('natural');
var wordnet = new natural.WordNet();

/**
 *
 */
var getResnikSimilarity = function(str1, str2, callback) {
	var pending = 2;
	var resultPaths = {};
	[str1, str2].forEach(function(str, i) {
		wordnet.lookup(str, function(results) {
			var startingNodes = [];
			results.forEach(function(result) {
				if (result.pos === 'n') startingNodes.push([result.synsetOffset]);
			});
			wordnet.getPathsToEntity(startingNodes, function(paths) {
				pending--;
				resultPaths['str' + i] = paths;

				if (pending == 0) calculateSimilarity(resultPaths, callback)
			});
		});
	});
};

/**
 *
 */
var getShortestPath = function(results) {
	var shortestPath;
	results.str0.forEach(function(referencePath) {
		referencePath.forEach(function(referenceNode, i) {
			results.str1.forEach(function(comparisonPath) {
				var index = comparisonPath.indexOf(referenceNode);
				if (index != -1) {
					var concatenation = referencePath.slice(0, i + 1).concat(comparisonPath.slice(0, index).reverse()); 
					if (!shortestPath || shortestPath.length > concatenation.length) shortestPath = concatenation;
				}
			});
		});
	});

	return shortestPath;
}

var getSubsumingNodes = function(resultSet) {
	var subsumingNodes = [];
	resultSet.str0.forEach(function(referencePath) {
		referencePath.forEach(function(referenceNode, i) {
			resultSet.str1.forEach(function(comparisonPath) {
				var index = comparisonPath.indexOf(referenceNode);
				var p = referencePath.slice(i + 1);
				// TODO: Check if path is already in subsuming nodes
				if (index != -1 && p.length > 0) {
					subsumingNodes.push(p);
				}
			});
		});
	});
	return subsumingNodes;
}

/**
 *
 */
var calculateSimilarity = function(results, callback) {
	var maxInfoContent;
	var subsumingNodes = getSubsumingNodes(results);
	var pending = subsumingNodes.length;
	subsumingNodes.forEach(function(node) {
		wordnet.getInformationContent(node, function(infoCnt) {
			if (!maxInfoContent || maxInfoContent < infoCnt) maxInfoContent = infoCnt;
			
			pending--;
			if (pending === 0) callback(maxInfoContent);
		});
	});
}

module.exports = getResnikSimilarity;