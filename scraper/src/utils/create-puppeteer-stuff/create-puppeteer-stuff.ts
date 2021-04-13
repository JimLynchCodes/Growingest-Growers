const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

import { Page, devices } from "puppeteer";
import { handleRequest } from '../handle-request/handle-request'

export async function createPuppeteerStuff(): Promise<Page> {

  console.log('creating puppeteer stuff...')
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36')

  await page.setViewport({ width: 1200, height: 1500 })
  await page.setRequestInterception(true)

  page.on('request', handleRequest)

  console.log('created a nice puppeteer page object!')
  return page
}
