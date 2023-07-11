var CodexAppRole = "UI";
var pageStateVersion = 0;
var pageState = {
    version: pageStateVersion
};
var updateState = async function (requestJson) {
    return {};
};
window.onpopstate = (event) => {
    if (event && event.state) {
        codexClient.Navigate(event.state || window.location.href, true);
    }
};
async function callPageController(data, isPopState) {
    ensureSearchBox();
    var priorSearchString = searchBox.value;
    pageStateVersion++;
    pageState.version = pageStateVersion;
    data.pageState = pageState;
    const responseData = await updateState(JSON.stringify(data));
    if (responseData.pageState && responseData.pageState.version) {
        if (responseData.pageState.version < pageStateVersion) {
            // this is a result from a prior call coming in after another
            // call was already made. Just throw away the results.
            return;
        }
    }
    if (responseData.leftPaneHtml) {
        CodexPage.setLeftPane(responseData.leftPaneHtml);
    }
    if (responseData.rightPaneHtml) {
        CodexPage.setRightPane(responseData.rightPaneHtml);
    }
    if (priorSearchString == searchBox.value) {
        if (responseData.searchString) {
            searchBox.value = responseData.searchString;
        }
    }
    if (responseData.line || responseData.symbol) {
        GoToSymbolOrLineNumber(responseData.symbol, responseData.line);
    }
    if (responseData.pageState) {
        pageState = responseData.pageState;
    }
    var loginLink = document.getElementById('loginButtonLink');
    var encodedAddress = encodeURIComponent("/" + (pageState.address || ""));
    if (pageState.loginId) {
        loginLink.href = "/.auth/logout?post_logout_redirect_url=" + encodedAddress;
        loginLink.innerHTML = "Logout " + pageState.loginId;
    }
    else {
        loginLink.innerHTML = "Login";
        loginLink.href = "/.auth/login/github?post_login_redirect_uri=" + encodedAddress;
    }
    if (responseData.title || pageState.address) {
        setNavigationBar(pageState.address, responseData.title, isPopState);
    }
}
function setNavigationBar(address, title, isPopState) {
    if (!title) {
        title = DefaultWindowTitle;
    }
    document.title = title;
    if (!isPopState) {
        history.pushState(address, title, address);
    }
}
export var codexClient = {
    Navigate: (url, isPopState) => {
        callPageController({ url }, isPopState);
    },
    Search: (searchString) => {
        callPageController({ searchString });
    }
};
export function setUpdateState(value) {
    updateState = value;
    // Enable the search box
    document.getElementById("search-box").removeAttribute("disabled");
}
//# sourceMappingURL=boot.js.map