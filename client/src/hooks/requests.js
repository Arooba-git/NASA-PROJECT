const BASE_URL = 'http://localhost:8000/v1';

// Load planets and return as JSON.
async function httpGetPlanets() {
  const response  = await fetch(`${BASE_URL}/planets`);
  return await response.json();
}

async function httpGetLaunches() {
  const fetchedLaunches = await fetch(`${BASE_URL}/launches`);
  const launchesJSON = await fetchedLaunches.json();
  return launchesJSON.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  });
}

async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${BASE_URL}/launches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(launch)
    });
  } catch (err) {
    console.log('Error:',  err);
    return {
      ok: false
    }
  }
}

async function httpAbortLaunch(launchId) {
  console.log(JSON.stringify(launchId));
  try {
    return await fetch(`${BASE_URL}/launches/${launchId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.log('Error:', err);
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};