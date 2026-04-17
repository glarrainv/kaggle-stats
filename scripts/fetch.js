import axios from 'axios';
import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const config = require('../config.json');

const { targetids } = config;

// Main function to write snapshot to history.json
 async function main() {
    const RelevantData = await fetchKaggleProfile();

    const snapshot = {
        timestamp: new Date().toISOString(),
        data: RelevantData,
    }


  const historyPath = './scripts/history/history.json';
  try {
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    history.push(snapshot);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2))
  } 
  catch (err) {    
    console.log('Error reading history.json, starting new history. Error:', err);
    const history = [snapshot];
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2))
  };

}

// Fetch Kaggle profile data and cookies for API calls
export async function fetchKaggleProfile(username = targetids.user, api = false, cardType = null, slug = null) {


const kernels = targetids.kernels;
const datasets = targetids.datasets;
// Store all relevant data in a structured format
const RelevantData = [];

  // Cookie use through Kaggle's internal API, built upon @subinium's work:
  // https://github.com/subinium/kaggle-badge
  try {
    const mainPage = await axios.get(`https://www.kaggle.com/${username}`, {
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
      { relativeUrl: `/${username}` },
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

    // Add profile data to final array
    RelevantData.push({profile: profileData});

    if (api) { RelevantData.push({[cardType]: slug, ...await fetchItems(cardType, username, slug, cookieStr, xsrfToken)});}
    else if (kernels) {
        await Promise.all(kernels.map(async (kernel) => {
            RelevantData.push({"kernels": kernel, ...await fetchItems("kernels", username, kernel, cookieStr, xsrfToken)});
        }));
    }
    else if (datasets) {
        await Promise.all(datasets.map(async (dataset) => {
            RelevantData.push({"datasets": dataset, ...await fetchItems("datasets", username, dataset, cookieStr, xsrfToken)});
        }));
    } else { console.log("No kernels or datasets specified in config for user %s. Only profile data will be fetched.", username); }
    return RelevantData;
} catch (error) {  console.error('Error fetching data:', error);  }
}

// Fetch details for each kernel and dataset included in target
async function fetchItems(type, username, filename, cookieStr, xsrfToken) {
    // Define path for api call
    let Endpoint, payload;
    const medalList = ["gold", "silver", "bronze"];

    // Endpoint and payloads differ within Kaggle's internal api
    // Kaggle provides no documentation for these endpoints, however they execute on page load within their website.
    if (type == "kernels" ) {Endpoint = "https://www.kaggle.com/api/i/kernels.LegacyKernelsService/GetKernelViewModel"; payload = {kernelSlug: filename, authorUserName: username}}
    else if (type == "datasets") { Endpoint = "https://www.kaggle.com/api/i/datasets.DatasetDetailService/GetDatasetBasics"; payload = {datasetSlug: filename, ownerSlug: username}}    
    else { console.error("Unknown type %s", type); return; }

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
    // For checking all possible fields [UNCOMMENT AS NEEDED]
    // console.log(`Raw API response for ${type} %s: %o`, filename, data);

    // Data structuring - extracting only relevant fields for rendering
    const relevantData = type === "kernels" ? {title: data?.kernel?.title, upvotes: data?.kernel?.upvoteCount || 0,views: data?.kernel?.viewCount || 0, forks: data?.kernel?.forkCount || 0, medal: data?.kernel?.medal || "STARTING"} : {title: data?.title, views: data?.viewCount || 0, downloads: data?.downloadCount || 0, discussions: data?.topicCount || 0, upvotes: data?.voteCount || 0, medal: medalList.find(medal => data?.medalUrl?.includes(medal))?.toUpperCase() || "STARTING"};

    return relevantData;
    
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
    }
}

// Run main function
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err); process.exit(1); });
}
