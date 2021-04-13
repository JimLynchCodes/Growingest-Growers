
export async function scrapeAllTickersWithCluster(page): Promise<any[]> {

    await page.goto(`https://elite.finviz.com/screener.ashx?`, { waitUntil: 'load', timeout: 20000 })

    let symbols = []

    const numberOfPages = await page.evaluate(() => {
        const pageNumberLinks = document.querySelectorAll('.screener-pages')
        return pageNumberLinks[pageNumberLinks.length - 1].textContent
    })

    const cappedNumberOfPages = process.env.MAX_PAGES_TO_SCRAPE ?
        Math.min(+process.env.MAX_PAGES_TO_SCRAPE, numberOfPages) : numberOfPages;

    console.log('number of pages: ', numberOfPages);
    console.log('MAX_PAGES_TO_SCRAPE: ', process.env.MAX_PAGES_TO_SCRAPE);
    console.log('capped number of pages: ', cappedNumberOfPages);

    const pageNumbers = (new Array(cappedNumberOfPages)).fill(0).map((_, indx) => indx + 1);

    for await (const pageNumber of pageNumbers) {
        const firstRowIndex = 1 + 20 * (pageNumber - 1)
        try {

            const url = `https://finviz.com/screener.ashx?v=152&c=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,57,58,59,60,61,62,63,64,65,66,67,68,69,70&r=${firstRowIndex}`

            console.log('going to url: ', url)

            await page.goto(url, { waitForSelector: 'tr.table-dark-row-cp', timeout: 45000 })
            await page.waitForTimeout(5000)
            await page.screenshot({ path: 'img/testresult2.png', fullPage: true })
            const tableHeaderCells: string[] = (await page.evaluate(() => {
                const headerCells = Array.from(document.querySelectorAll('tr[valign="middle"] td'))
                    .map(cell => cell.textContent)
                return headerCells
            }))
                .map(headerCell => headerCell.toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_'))

            const darkSymbolsData: string[] = await page.evaluate(() => {
                const symbolData = Array.from(document.querySelectorAll('tr.table-dark-row-cp td'))
                    .map(cell => cell.textContent)
                return symbolData
            })
            const lightSymbolsData: string[] = await page.evaluate(() => {
                const symbolData = Array.from(document.querySelectorAll('tr.table-light-row-cp td'))
                    .map(cell => cell.textContent)
                return symbolData
            })

            console.log('darkSymbolsData: ', darkSymbolsData);
            console.log('lightSymbolsData: ', lightSymbolsData);

            const symbolsData = [...darkSymbolsData, ...lightSymbolsData]

            const someSymbols = [];
            let currentObj = { ticker: '', fundamentals: {} }

            symbolsData.map((symbolDataCellText, index) => {
                if (index % tableHeaderCells.length === tableHeaderCells.length - 1) {
                    currentObj.ticker = currentObj.fundamentals['ticker']
                    someSymbols.push(currentObj);
                    currentObj = { ticker: '', fundamentals: {} }
                }

                currentObj.fundamentals[tableHeaderCells[index % tableHeaderCells.length]] = symbolDataCellText
            })

            symbols = [...symbols, ...someSymbols];

            console.log(symbols.length)

        }
        catch (err) {
            console.log('err ', err)

            console.log('errored so requeuing page: ', pageNumber)
            pageNumbers.push(pageNumber)

            await page.screenshot({ path: `img/err-page-${pageNumber}.png` });
        }
    }

    console.log('done the async loop...')

    return symbols;
};
