import { Page } from "puppeteer";

export async function login(page: Page) {

    return new Promise(async resolve => {

        await page.goto(`https://finviz.com/login.ashx`)

        const emailInputSelector = '[name="email"]';
        const pwInputSelector = '[name="password"]';
        const loginBtnSelector = 'input[type="submit"]';

        console.log(`logging into finviz: ${process.env.FINVIZ_EMAIL.length}, ${process.env.FINVIZ_PW.length} `)

        await page.type(emailInputSelector, process.env.FINVIZ_EMAIL)
        await page.type(pwInputSelector, process.env.FINVIZ_PW)
        await page.click(loginBtnSelector)
        
        try {
            await page.waitForSelector('.is-elite', { timeout: 4000 });
            console.log('logged in!!!')
            resolve(true)
        } 
        catch (err) {
            resolve(null)
        }
    })
}