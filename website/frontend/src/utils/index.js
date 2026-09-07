export const LAMBDA_URL =
  'https://oqknz96m34.execute-api.us-west-2.amazonaws.com/main';

export const shouldUpdateRuns = async (updateRunsOnUI) => {
  const run = window.localStorage.getItem('run');
  const oneDay = 86400000;
  if (!run || run < Date.now() - oneDay) {
    try {
      const response = await fetch(`${LAMBDA_URL}/run/update`);
      const text = await response.text();
      if (text === 'Updated runs.') {
        window.localStorage.setItem('run', Date.now());
        updateRunsOnUI();
      }
    } catch (e) {
      console.log(`Error updating runs:\n${e}`);
    }
  }
};
