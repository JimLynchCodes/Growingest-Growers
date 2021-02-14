
require('dotenv').config()
const logger = require('./utils/logger')
const moment = require('moment')
const sg = require('@sendgrid/mail');

const getSendgridTripleTrendersEmailRecipients = require('./utils/get-sg-email-recipients').getSendgridTripleTrendersEmailRecipients
const readStocksEgAnalysis = require('./utils/mongo-functions').readStocksEgAnalysis

const getEmailHeader = require('./utils/html-builder').getEmailHeader
const getGrowthTable = require('./utils/html-builder').getGrowthTable
const getDefinitionsSection = require('./utils/html-builder').getDefinitionsSection
const getFooterSection = require('./utils/html-builder').getFooterSection

const main = async () => {

  const currentDay = moment().format('MMMM DD, YYYY')

  const analyzedStocks = await readStocksEgAnalysis()

  // logger.info(`Pulled analyzed STOCK data from ${analyzedStocks.date_scraped} ${analyzedStocks.time_analyzed}`)
  logger.info(`Pulled analyzed STOCK data from ${analyzedStocks.date_scraped}`)

  const numberOfStockAnalyzed = analyzedStocks.all_stock_list.length

  // const numberOfUpwardTrending = analyzedStocks.tt_stats.trending_upwards.length
  // const numberOfDownwardTrending = analyzedStocks.tt_stats.trending_downwards.length

  logger.info(`Notifying of ${numberOfStockAnalyzed} growers!`)

  const fullTextEmail = getEmailHeader(analyzedStocks) +
    // getDefinitionsSection() +
    // '<br/><br/><div><hr/></div><br/>' +
    // getTrendingUpwardsSection(analyzedStocks.tt_stats.trending_upwards, 'trending_upwards') +
    // '<br/><br/><div><hr/></div><br/>' +
    // getTrendingDownwardsSection(analyzedStocks.tt_stats.trending_downwards, 'trending_downwards') +
    getGrowthTable(analyzedStocks.all_stock_list) +
    '<br/><br/><div><hr/></div><br/>' +
    getFooterSection()

  if (process.env.DISABLE_ALL_MESSAGE_SENDING === 'true') {
    logger.info('All message sending has been disabled by the env variable, DISABLE_ALL_MESSAGE_SENDING: ' + process.env.DISABLE_ALL_MESSAGE_SENDING)
    resolve(0)
  } else {

    return new Promise(async resolve => {

      const sgEgTrueRecipients = await getSendgridTripleTrendersEmailRecipients(process.env.TT_SG_EMAIL_SUBSCRIBERS_LIST_ID)

      logger.info(`sendgrid recipients: ${JSON.stringify(sgEgTrueRecipients)}`)

      logger.info(`SEND_TO_ONLY_ADMIN is ${process.env.SEND_TO_ONLY_ADMIN} -${process.env.SEND_TO_ONLY_ADMIN === 'true' ? ' NOT' : ''} sending to real recipients... ${process.env.SEND_TO_ONLY_ADMIN === 'true' ? 'only' : ''}: ${process.env.ADMIN_EMAIL}`)

      sgRecipients = process.env.SEND_TO_ONLY_ADMIN !== 'true' ? sgEgTrueRecipients : [process.env.ADMIN_EMAIL]

      sgRecipients.forEach((recipient, i) => {

        sg.setApiKey(process.env.SENDGRID_KEY);
        const msg = {
          to: recipient,
          from: process.env.SG_FROM_EMAIL,
          html: fullTextEmail,
          subject: `Growingest Growers - ${new Date(analyzedStocks.date_scraped).toDateString()}`,
          // subject: `Growingest Growers - 1/17/2021`,
          asm: {
            group_id: +process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID
          }
        };

        const millisecondSeparator = 1000

        const waitTime = millisecondSeparator * i

        setTimeout(() => {
          sg.send(msg).then((_resp) => {
            logger.info(`Mail has been sent to ${recipient}!`)

            if (i === (sgRecipients.length - 1)) {
              logger.info('The notifications have been sent! 🥳\n\n')
              resolve(0)
            }

          }).catch(err => {
            logge.info('error sending to recipient ', err)
          });

        }, waitTime)
      })
    })
  }
}

main()
  .then(ok => process.exit(ok))
  .catch(err => {
    logger.info('Error in the tg notifier! ', err)
    process.exit(1)
  })