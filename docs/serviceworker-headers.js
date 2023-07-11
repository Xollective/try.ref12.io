function debuglog(message) {
    //console.log(message);
}
function debuglog2(message) {
    //console.log(message);
}

debuglog("MyHREF: " + self.location.href);

self.addEventListener("install", function () {
    debuglog('install');
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    debuglog('activate');

    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', async function (event) {
    // handle the message sent from the web page
    console.log('Message received from web page:', event.data);

    debuglog2(`client id from message: ${event.source.id}`);

    var client = await self.clients.get(event.source.id);

    // send a message back to the web page
    client.postMessage('Message received by service worker');
});

var assetMap = {};

self.addEventListener("fetch", function (event) {
    debuglog2(`client id: ${event.clientId}`);
    if (event.request.url.endsWith('/assets.bin')) {
        event.respondWith(handleAssetsRequest(event.request));
        return;
    }

    var asset = assetMap[event.request.url];
    if (asset) {
        event.respondWith(new Response(asset.content, {
            headers: {
                'Content-Type': asset.contentType,
                "Cross-Origin-Embedder-Policy": "require-corp",
                "Cross-Origin-Opener-Policy": "same-origin"
            }
        }));
        return;
    }

    debuglog(`fetch0: (url: ${event.request.url} dst: ${event.request.destination}, mth: ${event.request.method}, mode: ${event.request.mode})`);

    if ((event.request.destination !== "document" && event.request.destination !== "sharedworker" && event.request.destination !== "worker")
        || event.request.method !== "GET") {
        //debuglog(`fetch,skip0: (url: ${event.request.url} dst: ${event.request.destination}, mth: ${event.request.method}, mode: ${event.request.mode})`);
        return;
    }

    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
        //debuglog(`fetch,skip1: (url: ${event.request.url} dst: ${event.request.destination}, mth: ${event.request.method}, mode: ${event.request.mode})`);
        return;
    }

    debuglog(`fetch1: (url: ${event.request.url} dst: ${event.request.destination}, mth: ${event.request.method}, mode: ${event.request.mode})`);

    event.respondWith(
        fetch(event.request)
            .then(function (response) {

                debuglog(`fetch2: (url: ${event.request.url} dst: ${event.request.destination}, mth: ${event.request.method}, mode: ${event.request.mode}, rsp: ${response.status})`);

                // It seems like we only need to set the headers for index.html
                // If you want to be on the safe side, comment this out
                //if (!response.url.endsWith("/index.html")) return response;

                if (response.status === 0) {
                    return response;
                }

                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                const moddedResponse = new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });

                return moddedResponse;
            })
            .catch(function (e) {
                console.error(e);
            })
    );
});

async function handleAssetsRequest(request) {

    try {
        // Fetch the assets.bin and assets.json files
        const [assetsBinResponse, assetsJsonResponse] = await Promise.all([
            fetch('/assets.bin.br'),
            fetch('/assets.index.json.br')
        ]);

        // Parse the assets.json file to determine which assets to serve
        const assetsJson = await assetsJsonResponse.json();

        // Read the requested assets from the assets.bin file
        const assetsBinArrayBuffer = await assetsBinResponse.arrayBuffer();
        var nextStart = 0;
        var baseAddress = self.registration.scope;
        assetsJson.cachedEntries.forEach(asset => {
            asset.start = nextStart;
            nextStart += asset.length;
            asset.content = assetsBinArrayBuffer.slice(asset.start, nextStart);

            assetMap[`${baseAddress}${asset.path}`] = asset;
        });


        // Return a new Response object with the combined ArrayBuffer as the body
        return new Response(assetsBinArrayBuffer, {
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });
    }
    catch (e) {
        assetMap = {};
        throw e;
    }
}