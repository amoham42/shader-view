chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendToShadertoy") {
    sendToShadertoy(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }
});

async function sendToShadertoy(data) {

  const response = await fetch("https://www.shadertoy.com/shadertoy", {
    method: "POST",
    headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded',
        cookie: '',
        priority: 'u=1, i',
        referer: 'https://www.shadertoy.com/embed/ttcSD8?gui=true&t=10&paused=false&muted=true'
    },
    body: data
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const responseText = await response.text();
  return responseText;
}