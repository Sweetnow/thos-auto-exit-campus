const puppeteer = require("puppeteer");
const strftime = require("strftime");

// 本脚本通过模拟浏览器访问相关网址并填写内容实现一键申请THOS出校。
// 默认值：进校或出校=出校，进出校事由=出校实习，申请进校日期=系统时间当天

const user = "这里写校园网账号";
const password = "这里写校园网密码";
const bj = "这里写班级";
const tel = "这里写电话号码";
const cxsy = "这里写出校事由";
const address = "这里写校外往来地点";

async function main() {
    const date = strftime("%F");
    const browser = await puppeteer.launch({ defaultViewport: { width: 1920, height: 1080 } });
    const page = await browser.newPage();
    await page.goto("https://thos.tsinghua.edu.cn");
    await page.type("#i_user", user);
    await page.type("#i_pass", password);
    await page.click("#theform > div:nth-child(4) > a");
    await page.waitForSelector("#formHome_serve_content > div:nth-child(1) > div.right-block");
    console.log("Login...");
    await page.goto(
        "https://thos.tsinghua.edu.cn/fp/view?m=fp#from=hall&serveID=0ce14db2-d40e-4052-a681-e240fe6c29ee&act=fp/serveapply"
    );
    const frame = await page.waitForFrame(async (frame) => {
        return frame.name() === "formIframe";
    });
    console.log("Go to form page...")
    await frame.waitForSelector("#BJ").then(el => el.type(bj));
    await frame.waitForSelector("#LXDH").then(el => el.type(tel));
    await frame.waitForSelector("#CXSY").then(el => el.type(cxsy));
    await frame.waitForSelector("#NQWDD").then(el => el.type(address));
    await frame.$eval("#SQHXRQQS", (el, date) => {
        el.value = date;
    }, date);
    console.log(`Set date to ${date}...`);
    // 进出校
    const JCX = "#body_0 > div.if-necessary-use-this > div:nth-child(6) > div:nth-child(2) > div > button";
    await frame.waitForSelector(JCX).then(el => el.click());
    // 默认选择：出校
    const CX = "#body_0 > div.if-necessary-use-this > div:nth-child(6) > div:nth-child(2) > div > div > ul > li:nth-child(2) > a";
    await frame.waitForSelector(CX).then(el => el.click());
    // 进出校事由
    const JCXSY = "#body_0 > div.if-necessary-use-this > div:nth-child(6) > div:nth-child(4) > div > button > span.filter-option.pull-left";
    await frame.waitForSelector(JCXSY).then(el => el.click());
    // 默认选择：出校实习
    const CXSX = "#body_0 > div.if-necessary-use-this > div:nth-child(6) > div:nth-child(4) > div > div > ul > li:nth-child(5) > a";
    await frame.waitForSelector(CXSX).then(el => el.click());

    await page.click("#commit");
    console.log("Committed!");
    await page.waitForNavigation();
    await page.close();
    await browser.close();
}

main();