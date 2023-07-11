import * as boot from './ts/js/boot.js'

boot.setUpdateState(async function (requestJson) {
    const response = await fetch("/api/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: requestJson
    });

    return response.json();
});

onCodexAppStart(boot.codexClient);

boot.codexClient.Navigate(window.location.href);