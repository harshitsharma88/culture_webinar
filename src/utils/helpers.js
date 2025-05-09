const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const catchBlock = require("../errorHandlers/errorPrinting");
const {resolve} = require("path");
const puppeteer = require('puppeteer-core');

const helpers = {
    generateToken ( data, options ){
        return jwt.sign(data, process.env.jsecret, options);
    },
    verifyToken ( token ){
        return jwt.verify(token, process.env.jsecret);
    },
    async renderEJS(data, templatePath = 'src/template/certificateTemplate.ejs'){
        try {
            return await ejs.renderFile(resolve(templatePath), data);
        } catch (error) {
            catchBlock(error, "Rendering EJS");
        }
    },

    async generateCertificate(html){
        let browser;
        try {
            browser = await puppeteer.launch({
                executablePath: require("path").join('C:', 'Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                timeout: 60000,
                userDataDir : resolve("puppeteer_temp")
            });
    
            const page = await browser.newPage();
            await page.setViewport({ width: 1024, height: 635 });
    
            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });
    
            return await page.screenshot({
                type: 'png',
                fullPage: false,
                omitBackground: true
            });
    
        } catch (err) {
            catchBlock(err, "Generating the Image.");
            return null;
        } finally {
            if (browser) await browser.close();
        }
    }   
};

module.exports = helpers;