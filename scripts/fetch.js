import axios from 'axios';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const config = require('../config.json');

const { targetids } = config;

// Mai function to write snapshot to history.json
async function main() {
    const RelevantData = await fetchKaggleProfile();
    console.log("Final relevant data: %o", RelevantData);

    const snapshot = {
        timestamp: new Date().toISOString(),
        data: RelevantData,
    }


  const historyPath = './scripts/history/history.json';
  const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  history.push(snapshot);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

  console.log(`Snapshot saved to history.json at ${snapshot.timestamp}`);

}

// Fetch Kaggle profile data and cookies for API calls
async function fetchKaggleProfile() {

    // Store all relevant data in a structured format
const RelevantData = [];

  // Cookie use through Kaggle's internal API, built upon @subinium's work:
  // https://github.com/subinium/kaggle-badge
  try {
    const mainPage = await axios.get(`https://www.kaggle.com/${targetids.user}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const cookies = mainPage.headers["set-cookie"] || [];
    const cookieStr = cookies.map((c) => c.split(";")[0]).join("; ");
    const xsrfCookie = cookies.find((c) => c.includes("XSRF-TOKEN"));
    const xsrfToken = xsrfCookie ? xsrfCookie.split("=")[1].split(";")[0] : "";

    const apiResponse = await axios.post(
      "https://www.kaggle.com/api/i/routing.RoutingService/GetPageDataByUrl",
      { relativeUrl: `/${targetids.user}` },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Cookie: cookieStr,
          "X-XSRF-TOKEN": xsrfToken,
        },
      }
    );

    // Data Extraction and structuring
    const data = apiResponse.data;
    const Profile = data?.userProfile;

    const Achievements = Profile?.achievementSummaries;
    const ActivityCounts = {Kernels: Profile?.totalKernels, Datasets: Profile?.totalDatasets, Discussions: Profile?.totalDiscussions};
    const BadgesLength = Profile?.badges?.length || 0;
    const profileData = {Achievements, ActivityCounts, BadgesLength};
    console.log("Fetched data for user %s: %o", targetids.user, profileData);

    // Add profile data to final array
    RelevantData.push({profile: profileData});
    
    await Promise.all(targetids.notebooks.map(async (notebook) => {
        RelevantData.push({"notebooks": notebook, ...await fetchItems("notebooks", notebook, cookieStr, xsrfToken)});
    }));
    await Promise.all(targetids.datasets.map(async (dataset) => {
        RelevantData.push({"datasets": dataset, ...await fetchItems("datasets", dataset, cookieStr, xsrfToken)});
    }));
    return RelevantData;
} catch (error) {    console.error('Error fetching data:', error);  }
}

// Fetch details for each notebook and dataset included in target
async function fetchItems(type, name, cookieStr, xsrfToken) {
    // Define path for api call
    let Endpoint, payload;

    // Endpoint and payloads differ within Kaggle's internal api
    // Kaggle provides no documentation for these endpoints, however they execute on page load within their website.
    if (type == "notebooks" ) {Endpoint = "https://www.kaggle.com/api/i/kernels.LegacyKernelsService/GetKernelViewModel"; payload = {kernelSlug:name, authorUserName: targetids.user}}
    else if (type == "datasets") { Endpoint = "https://www.kaggle.com/api/i/datasets.DatasetDetailService/GetDatasetBasics"; payload = {datasetSlug:name, ownerSlug: targetids.user}}    
    else { console.error("Unknown type %s", type); return; }

    console.log(`Fetching ${type} %s for user %s. Payload: %o`, name, targetids.user, payload);

    try {
    const apiResponse = await axios.post(
      Endpoint,
      { ...payload },
      
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Cookie: cookieStr,
          "X-XSRF-TOKEN": xsrfToken,
        },
      }
    );

    const data = apiResponse.data;
    const relevantData = type === "notebooks" ? {title: data?.kernel?.title, upvotes: data?.kernel?.upvoteCount || 0,views: data?.kernel?.viewCount || 0, forks: data?.kernel?.forkCount || 0} : {title: data?.title, views: data?.viewCount || 0, downloads: data?.downloadCount || 0, discussions: data?.topicCount || 0, upvoteCount: data?.voteCount || 0};

    console.log(`Fetched ${name} ${type}  for user %s`, targetids.user, relevantData);
    return relevantData;
    
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
    }
}

// Run main function
main().catch(err => { console.error(err); process.exit(1); });