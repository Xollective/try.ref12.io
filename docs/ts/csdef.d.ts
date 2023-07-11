export namespace CodexWeb {
    interface PageState {
        loginId?: string,
        isInitialized?: boolean,
        version: number,
        address?: string
    }

    interface PageResult {
        leftPaneHtml?: string,
        rightPaneHtml?: string,
        line?: number,
        symbol?: string,
        searchString?: string,
        title?: string,
        pageState?: PageState
    }

    interface PageRequest {
        pageState?: PageState
        url?: string,
        searchString?: string
    }
}