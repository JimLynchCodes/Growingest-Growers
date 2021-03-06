require('dotenv').config()

import { scrapeAllTickersWithCluster } from './scraping/scrape-all-tickers-with-data'
import { getTickerListWithIncomeDataApiCalls } from './scraping/income-api-call-scraper'
import { calculateGrowthStatsForTickers } from './utils/calculate-growth-stats-for-tickers'
import { getFinvizQuoteDataForTickersWithCluster } from './scraping/get-finviz-quote-data'
import { runRegressionsForTickers } from './utils/run-regressions-for-scrapers/run-regressions-for-scrapers'
import { createPuppeteerStuff } from './utils/create-puppeteer-stuff/create-puppeteer-stuff'
import { login } from './login/login'
import { insert } from './db/mongo-functions'
import { calculateRankings } from './rankings/filler/rankings-filler'
import { sortByRankings } from './rankings/sorter/rankings-sorter'
import { logger } from './utils/logger'

export const main = async () => {

  const page = await createPuppeteerStuff();

  await login(page);

  console.log('ok now...')

  const scrapedTickerList = await scrapeAllTickersWithCluster(page)

  const scrapedTickerListNotOvervalued = scrapedTickerList.filter(stockObj => {
    const peString = stockObj.fundamentals['p/e']

    // if (peString === '-')
    //   return false

    if (+peString > 5000)
      return false

    return true;
  })

  console.log(`filtered out ${scrapedTickerList.length - scrapedTickerListNotOvervalued.length} overvalued items...`)

  const [tickerListWithIncomeData, tickersWithNoIncomeData] = await getTickerListWithIncomeDataApiCalls(scrapedTickerListNotOvervalued)
  // const tickerListWithIncomeData = await getTickerListWithIncomeDataApiCalls(tickerListPageData)
  // console.log('ticker list with income data: ', JSON.stringify(tickerListWithIncomeData[0], null, 2))
  // console.log('scraped pages, num: ', tickerListWithIncomeData.length)
  console.log('tickersWithNoIncomeData length: ', tickersWithNoIncomeData.length)
  // console.log('tickersWithNoIncomeData num: ', tickersWithNoIncomeData)

  // console.log('no income for these: ', tickerListWithIncomeData.filter(obj => !obj.income_statements.quarterly || !obj.income_statements.quarterly))

  const tickerListWithRegressionsRun = runRegressionsForTickers(tickerListWithIncomeData)
  // console.log('ticker list with regressions run: ', JSON.stringify(tickerListWithRegressionsRun, null, 2))
  console.log('ticker list with regressions length: ', tickerListWithRegressionsRun.length)

  const tickerListWithGrowthCalculations = calculateGrowthStatsForTickers(tickerListWithRegressionsRun)
  console.log('with growth calcs length: ', tickerListWithGrowthCalculations.length)
  // console.log('ticker list with growth calcs: ', JSON.stringify(tickerListWithGrowthCalculations, null, 2))

  const [rankedTickerList, rankingsMaxesAndMins] = calculateRankings(tickerListWithGrowthCalculations)
  console.log('with rankings length: ', rankedTickerList.length)

  const sortedRankedTickerList = sortByRankings(rankedTickerList)
  console.log('sorted rankings length: ', sortedRankedTickerList.length)

  // Remove stocks that are shrinking in all three areas...
  const sortedRankedTickerListGoodOnes = sortedRankedTickerList.filter(tickerObj => {
    if (tickerObj.growth_calculations.revenue['t+1y_difference'] > 0 ||
      tickerObj.growth_calculations.gross_profit['t+1y_difference'] > 0 ||
      tickerObj.growth_calculations.net_income['t+1y_difference'] > 0 ||
      !tickerObj.growth_calculations.revenue['t+1y_difference'] ||
      !tickerObj.growth_calculations.gross_profit['t+1y_difference'] ||
      !tickerObj.growth_calculations.net_income['t+1y_difference']
      )
      return tickerObj
    else {
      console.log('oof, All PGPD\'s are negative for: ', tickerObj.ticker)
      console.log(tickerObj.growth_calculations.revenue['t+1y_difference'], ' ',
        tickerObj.growth_calculations.gross_profit['t+1y_difference'], ' ',
        tickerObj.growth_calculations.net_income['t+1y_difference'])
    }
  })
  console.log('sorted rankings good ones length: ', sortedRankedTickerListGoodOnes.length)

  console.log('let\'s save it!')
  console.log(rankingsMaxesAndMins)

  const veryProfitableStocks = []
  const barelyProfitableStocks = []
  const barelyNotProfitableStocks = []

  sortedRankedTickerList.forEach(stockObj => {

    const profitMarginString = stockObj.fundamentals['profit_m']

    if (profitMarginString !== '-') {

      // removes % character
      const profitMarginStringNoPercentageSign = profitMarginString.substring(0, 'foo'.length - 1);

      if (profitMarginStringNoPercentageSign > 20)
        veryProfitableStocks.push(stockObj)

      if (profitMarginStringNoPercentageSign < 20 && profitMarginStringNoPercentageSign > 0)
        barelyProfitableStocks.push(stockObj)

      if (profitMarginStringNoPercentageSign < 0 && profitMarginStringNoPercentageSign > -20)
        barelyNotProfitableStocks.push(stockObj)

    }
  })

  // const smallerListOfEverything = sortedRankedTickerListGoodOnes.splice(0, process.env.ALL_STOCKS_MAX_TICKERS)

  console.log({
    ALL_STOCKS_MAX_TICKERS: process.env.ALL_STOCKS_MAX_TICKERS,
    PROF_BANDS_MAX_TICKERS: process.env.PROF_BANDS_MAX_TICKERS
  })

  await insert({
    date_scraped: new Date(),
    all_stock_list: sortedRankedTickerListGoodOnes.splice(0, +process.env.ALL_STOCKS_MAX_TICKERS),
    very_profitables_stock_list: veryProfitableStocks.splice(0, +process.env.PROF_BANDS_MAX_TICKERS),
    barely_profitable_stock_list: barelyProfitableStocks.splice(0, +process.env.PROF_BANDS_MAX_TICKERS),
    barely_not_profitable_stock_list: barelyNotProfitableStocks.splice(0, +process.env.PROF_BANDS_MAX_TICKERS),
    maxes_and_mins: rankingsMaxesAndMins,
    no_income_tickers: tickersWithNoIncomeData
  })

  return 'success!'
}

main().then(data => {
  logger.info(`bazzinga 🎉 ${JSON.stringify(data, null, 2)}`)
  process.exit(0)
})