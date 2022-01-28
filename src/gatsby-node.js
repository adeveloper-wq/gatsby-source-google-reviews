"use strict";

const axios = require('axios');

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest
}, {
  dataId,
  apiKey,
  language
}) => {
  const {
    createNode
  } = actions;

  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error("You must supply a valid API Key from Scale Serp. Visit https://scaleserp.com/ for more information.");
  }

  if (!dataId || typeof dataId !== 'string') {
    throw new Error('You must supply a valid data_id. You can get your data_id when performing a "Google Places" search request at Scale SERP with the name of your company as query.');
  }

  let params = {};

  if(!language || typeof language !== 'string'){
    params = {
      api_key: apiKey,
      search_type: "place_reviews",
      data_id: dataId
    };
  }else{
    params = {
      api_key: apiKey,
      search_type: "place_reviews",
      data_id: dataId,
      hl: language
    };
  }

  await axios.get('https://api.scaleserp.com/search', {
    params
  }).then(response => {
    const reviews = response.data.place_reviews_results;
    reviews.forEach(review => {
      const nodeContent = JSON.stringify(review);
      const nodeMeta = {
        id: createNodeId(`google-review-${review.source}`),
        parent: null,
        children: [],
        internal: {
          type: `GoogleReview`,
          content: nodeContent,
          contentDigest: createContentDigest(review)
        }
      };
      const node = Object.assign({}, review, nodeMeta);
      createNode(node);
    });
    //return;
  }).catch(error => {
    throw new Error(`Error fetching results from ScaleSerp API: ${error}`);
  });
  return;
};