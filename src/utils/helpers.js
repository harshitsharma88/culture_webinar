const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const catchBlock = require("../errorHandlers/errorPrinting");
const {resolve} = require("path");
const puppeteer = require('puppeteer');

const heplers = {
    generateToken ( data, options ){
        return jwt.sign(data, process.env.jsecret, options);
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
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
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
            console.error('Error rendering image:', err);
            res.status(500).send('Failed to generate image');
        } finally {
            if (browser) await browser.close();
        }
    }   
};

module.exports = heplers;