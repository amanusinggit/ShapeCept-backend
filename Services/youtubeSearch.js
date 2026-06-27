const { google } = require("googleapis");

const getVideoUrlFromYoutube = async (topic) => {
  const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_DATA_API_KEY,
  });
  const response = await youtube.search.list({
    part: ["snippet"],
    maxResults: 1,
    q: topic,
  });
  console.log(response.data.items[0]);
  return response.data.items[0].id.videoId;
};

module.exports = getVideoUrlFromYoutube;
