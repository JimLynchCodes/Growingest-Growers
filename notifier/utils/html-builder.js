
const GREEN_ROW_COLOR = '#B9EDB9'
const RED_ROW_COLOR = '#f7b2b2'

const TREND_BAR_COLOR = '#003A64'
const DIP_BAR_COLOR = '#54A2D2'
const VOLUME_BAR_COLOR = '#A9CEE8'

const getEmailHeader = analyzedStocks => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">` +
    '<div style="background:rgb(255,255,255);max-width:950px;width:100%;margin:0px auto; text-align: center;">' +
    '<br/>' +
    '<h1>Growingest Growers</h1>' +
    '<p style="font-size: 1rem;">The ultimate screener for public companies experiencing the most growth!</p>' +
    '<p style="font-size: 1rem;">' +
    `This report is based on market close data from ${analyzedStocks.date_scraped}.<br/><br/>All stocks in the NYSE, Nasdaq, and AMEX exchanges were considered.` +
    '</p>' +
    '<p style="font-size: 2rem;">' +
    '<div style="width:100%;text-align:center;width:auto;min-height:50px;">🏆</div>' +
    '</p>' +
    '<p style="font-size: 1rem;">Have friends who want to receive this daily Exponential Growth email? <a href="https://cdn.forms-content.sg-form.com/96a826d9-755c-11eb-a965-de1752b54cd1">Sign up here</a>!</p>' +
    '<hr/>' +
    '<br/>'

const egTableHeaders = () => {

    return '<tr>' +
        '<th><h4 style="margin: 5px 2px;">Symbol</h4></th>' +
        // '<th><h4 style="margin: 5px 2px;">Revenue<br/>Line</h4></th>' +
        '<th><h4 style="margin: 5px 2px;">Revenue PGpD<br/>(t+4q)/t</h4>' +
        `<div style="width: 20px; height: 20px; background-color: ${TREND_BAR_COLOR}; border-radius: 5px; margin: auto auto 5px auto; border: black solid 0.5px;"></div></th>` +
        // '<th><h4 style="margin: 5px 2px;">Gross Profit<br/>Line</h4></th>' +

        '<th><h4 style="margin: 5px 2px;">Gross Profit PGpD<br/>(t+4q)/t</h4>' +
        `<div style="width: 20px; height: 20px; background-color: ${DIP_BAR_COLOR}; border-radius: 5px; margin: auto auto 5px auto; border: black solid 0.5px;"></div></th>` +

        // '<th><h4 style="margin: 5px 2px;">Net Income<br/>Line</h4></th>' +
        '<th><h4 style="margin: 5px 2px;">Net Income PGpD<br/>(t+4q)/t</h4>' +
        `<div style="width: 20px; height: 20px; background-color: ${VOLUME_BAR_COLOR}; border-radius: 5px; margin: auto auto 5px auto; border: black solid 0.5px;"></div></th>` +
        
        '<th><h4 style="margin: 5px 2px;">Rankings</h4></th>' +
        
        '<th><h4 style="margin: 5px 2px;">Net Profit Margin</h4>' +
        '<th><h4 style="margin: 5px 2px;">P/E</h4>' +
        '<th><h4 style="margin: 5px 2px;">Expected<br/>EPS Growth<br/>Over Next 1y</h4>' +
        
        // '<th><h4 style="margin: 5px 2px;">Market<br/>Cap</h4></th>' +
        // '<th><h4 style="margin: 5px 2px;">PE Ratio</h4></th>' +
        '</tr>'
}


const buildEgRowFromStocksArray = (stocksArray) => {

    let colorNextRow = true

    const end_thing = stocksArray
        .map(stockObj => {

            let tr

            if (colorNextRow) {
                tr = `<tr bgcolor='${GREEN_ROW_COLOR}'>`
                colorNextRow = false
            } else {
                tr = `<tr>`
                colorNextRow = true
            }

            const revenueBarHeight = 2 + Math.floor(43 * stockObj.rankings.revenue)
            const grossProfitBarHeight = 2 + Math.floor(43 * stockObj.rankings.gross_profit)
            const netIncomeBarHeight = 2 + Math.floor(43 * stockObj.rankings.net_income)

            // console.log('stock obj: ', JSON.stringify(stockObj))

            return tr +
                '<td style="min-width:85px">' +
                `<a href="https://finviz.com/quote.ashx?t=${stockObj.ticker}" title="${stockObj.fundamentals.company}&#013;Market cap: ${stockObj.fundamentals.market_cap}&#013;Sector: ${stockObj.fundamentals.sector}&#013;Industry: ${stockObj.fundamentals.industry}&#013;Institutional Ownership: ${stockObj.fundamentals.inst_own}&#013;Short Float: ${stockObj.fundamentals.float_short}">${stockObj.ticker}</a>&#013;` +
                '</td>' +

                // '<td style="min-width:110px">' +
                // stockObj.growth_calculations.revenue.regression_best_fit_line_equation +
                // '</td>' +

                '<td style="min-width:85px">' +
                `<p title="${stockObj.growth_calculations.revenue.regression_best_fit_line_equation}">${stockObj.growth_calculations.revenue['t+1y_quarterly_PGpD']}</p>` +
                '</td>' +

                // '<td style="min-width:110px">' +
                // stockObj.growth_calculations.gross_profit.regression_best_fit_line_equation +
                // '</td>' +

                '<td style="min-width:85px">' +
                `<p title="${stockObj.growth_calculations.gross_profit.regression_best_fit_line_equation}">${stockObj.growth_calculations.gross_profit['t+1y_quarterly_PGpD']}</p>` +
                '</td>' +

                // '<td style="min-width:110px">' +
                // stockObj.growth_calculations.net_income.regression_best_fit_line_equation +
                // '</td>' +

                '<td style="min-width:85px">' +
                `<p title="${stockObj.growth_calculations.net_income.regression_best_fit_line_equation}">${stockObj.growth_calculations.net_income['t+1y_quarterly_PGpD']}</p>` +
                '</td>' +
                
                '<td style="min-width: 90px; min-height: 50px; padding: 0.5rem; display: flex;">' +
                `<div title="${(stockObj.rankings.revenue * 100).toFixed(0) + '%'}" style="background-color: ${TREND_BAR_COLOR}; min-width: 15px; min-height: ${revenueBarHeight}px; margin: auto auto 0 auto; border: 1.5px solid black;"></div>` +
                `<div title="${(stockObj.rankings.gross_profit * 100).toFixed(0) + '%'}" style="background-color: ${DIP_BAR_COLOR}; min-width: 15px; min-height: ${grossProfitBarHeight}px; margin: auto auto 0 auto; border: 1.5px solid black;"></div>` +
                `<div title="${(stockObj.rankings.net_income * 100).toFixed(0) + '%'}" style="background-color: ${VOLUME_BAR_COLOR}; min-width: 15px; min-height: ${netIncomeBarHeight}px; margin: auto auto 0 auto; border: 1.5px solid black;"></div>` +
                '</td>' +
                
                '<td style="min-width:78px">' +
                `<p title="Net Profit Margin: ${stockObj.fundamentals['profit_m']}&#013;Operating Profit Margin: ${stockObj.fundamentals['oper_m']}&#013;Gross Profit Margin: ${stockObj.fundamentals['gross_m']}">${stockObj.fundamentals['profit_m']}</p>&#013;` +
                '</td>' +
                
                '<td style="min-width:78px">' +
                `<p title="Current P/E: ${stockObj.fundamentals['p/e']}&#013;Forward P/E: ${stockObj.fundamentals['fwd_p/e']}&#013;PEG: ${stockObj.fundamentals['peg']}">${stockObj.fundamentals['p/e']}</p>&#013;` +
                '</td>' +
                
                '<td style="min-width:120px">' +
                `<p title="EPS Growth Over:&#013;Next 1 Year: ${stockObj.fundamentals['eps_next_y']}&#013;Next 5 Years: ${stockObj.fundamentals['eps_next_5y']}&#013;Past 1 Year: ${stockObj.fundamentals['eps_this_y']}&#013;Past 5 Years: ${stockObj.fundamentals['eps_past_5y']}">${stockObj.fundamentals['eps_next_y']}</p>&#013;` +
                '</td>' +
                
                // '<td style="min-width:75px">' +
                // stockObj.market_cap_group +
                // '</td>' +
                // '<td style="min-width:87px">' +
                // stockObj.pe_ratio +
                // '</td>' +
                '</tr>'
        })
    // .join('')

    console.log('end thing: ', end_thing)

    const joined = end_thing.join('')

    console.log('returning this: ', joined)

    return joined
}

const getGrowthTable = (stockList) => {
    return '<br/>' +
        '<h2>Stocks Ranked By Growth</h2>' +
        // '<p style="font-size: 1rem;">Go <i><strong>LONG</strong></i> these upward trending equities that have dipped downwards.</p>' +
        '<div>' +
        '<table border="1" cellspacing="0" padding="0" style="border: 1px solid black; font-size: 1rem; margin: auto;">' +
        egTableHeaders() +
        buildEgRowFromStocksArray(stockList) +
        '</table>' +
        '</div>' +
        '<br/>'
}

const getDefinitionsSection = trendingUpwardsSymbols => `<br/><br/><div style="text-align: left; max-width: 550px; margin: auto; padding: 0 1rem; border: .15rem solid black; border-radius: 0.5rem;">` +
    '<h2>Definitions</h2>' +
    '<p style="font-size: 1rem;"><strong><u>Symbol</u></strong> - The ticker that identifies a given stock or financial instrument.</p>' +
    '<p style="font-size: 1rem;"><strong><u>Trend Intervals</u></strong> - The time periods used to determine if a given stock is trending. Our algorithm looks at the percentage price change over the "dip interval" and "trend intervals" which correspond to the following time periods:' +
    '<ul>' +
    '<li style="font-size: 1rem;">Ti1: between 6 months ago and 3 months ago' +
    '<li style="font-size: 1rem;">Ti2: between 3 months ago and 1 month ago' +
    '<li style="font-size: 1rem;">Ti3: between 1 month ago and 5 trading days ago' +
    '<li style="font-size: 1rem;">Di: the last 5 trading days' +
    '</ul>' +
    '</p>' +
    // '<img src=""/>' +
    '<p style="font-size: 1rem;">Note - The trending upwards and trending downwards tables contain ONLY stocks whose price has moved in the same direction over all three trend intervals.</p>' +
    '<p style="font-size: 1rem;"><strong><u>Trend Rate</u></strong> - Represents the speed at which price change momentum is increasing.</p>' +
    '<p style="font-size: 1rem;">(a positive number represents an upward trend, and a negative number represents a downwards trend)</p>' +
    '<p style="font-size: 1rem;">(a trend rate value that is farther from zero indicates more price change momentum in the trend direction)</p>' +
    `<p style="font-size: 1rem;"><strong><u>Dip Percentage</u></strong> - The percentage a stock's price has changed over the past 5 trading days.</p>` +
    `<p style="font-size: 1rem;"><strong><u>Rankings</u></strong> - The three bars respectively represent how a stock's trend rate, dip percentage, and volume ratio together compare to those of other symbols also trending in that direction for the given day.</p>` +
    '<p style="font-size: 1rem;">(a large bar indicates a strong signal for the corresponding indicator)</p>' +
    '<p style="font-size: 1rem;"><strong><u>Market Cap</u></strong> - A high-level group describing the size of a company based on the total value of all shares.</p>' +
    '<p style="font-size: 1rem;">(Micro < 300M < Small < 2B < Mid < 10B < Large < 200B < Mega)</p>' +
    '<p style="font-size: 1rem;"><strong><u>PE Ratio</u></strong> - Compares the price per share of a company\'s stock to its earnings per share.</p>' +
    '<p style="font-size: 1rem;">(A PE ratio closer to zero means you are buying into more dollars of earnings per dollar invested)</p>' +
    '<p style="font-size: 1rem;">(A negative PE ratio means the company is not yet profitable)</p>' +
    `</div>`

const getFooterSection = trendingUpwardsSymbols => '<br/>' +
    `<p style="font-size: 1rem;">Good luck and enjoy the ride!</p><br/>` +
    `<p style="font-size: 1rem;">I want to hear from YOU! If you enjoy getting these stock picks or have any questions at all, just reply to this email and say hello!</p>` +
    '<div>' +
    '<br/>' +
    '<div style="width: 500px; display: flex; margin: auto;">' +
    '<div style="margin: auto; text-align: left;">' +
    '<h2>Sincerely,</h2>' +
    '<h2>Your Friend & Fellow Trader,</h2>' +
    '<h1>&nbsp;&nbsp;&nbsp;&nbsp;Jim Lynch</h1>' +
    '</div>' +
    '<img style="margin: auto;" src="https://raw.githubusercontent.com/JimLynchCodes/Triple-Trenders/main/notifier/images/jim-headshot-hand-drawn.jpeg" />' +
    '</div>' +
    '<br/>' +
    '<br/>' +
    '<p style="font-size: 1rem;">Disclaimer: any information here may be incorrect. Invest at your own risk!</p>' +
    '</div>' +
    '<p style="font-size: 1rem;">Shoutout to <a href="https://www.finviz.com/">finviz.com</a> and for generously<br/>providing data used in generating this report!</p>' +
    '<div>' +
    '<a href="<%asm_group_unsubscribe_raw_url%>">Unsubscribe</a> | <a href="<%asm_preferences_raw_url%>">Manage Email Preferences</a>' +
    '<br/>' +
    '</div>'

module.exports = {
    getEmailHeader,
    getGrowthTable,
    getDefinitionsSection,
    getFooterSection
}