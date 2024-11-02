const axios = require('axios');
const mongoose = require('mongoose');
const Logs = require('../models/logModels');
const Users = require('../models/usersModel');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer')




//========================================HEY==========================================
//----------You are not authorized to read or use the credentials used here.-----------
//=====================================================================================


mongoose.connect('mongodb://slash:SlaSh{CtF-at1}@mongo_db:27017/overchain?authSource=admin')
  .then(() => console.log('[+] Connected to MongoDB!!'))
  .catch((err) => console.error('[-] Error connecting to MongoDB:', err));

let adminId;
let adminUsername
let adminCookie

const getAdminId = async () => {
    const adminUser = await Users.findOne({ username: 'admin' });
    return adminUser?._id.toString();
};

const findAdminUsername = async (adminId) => {
    const adminUsername = await Users.findById(adminId);
    return adminUsername?.username;
};

const getUserCookies = async (adminUsername) => {
    const loginURL = 'http://overchain_app:3000/login';
    const username = adminUsername;
    const password = 'A@M1n{-!0xP455W0-r6}';
    let csrfToken = '';
    let cookie = '';

    try {
        const response = await axios.get(loginURL);
        const $ = cheerio.load(response.data);
        csrfToken = $('#_csrf').val();
        cookie = response.headers['set-cookie'] ? response.headers['set-cookie'][0].split('; ').find(row => row.startsWith('cookie=')).split('=')[1] : undefined;
        if (!cookie) {
            console.error('[-] Error: Cookie not provided!');
            return;
        }
    } catch (error) {
        console.error('[-] CSRF ERROR: ', error.message);
        return null;
    }

    const data = {
        username: username,
        password: password,
    };

    try {
        const res = await axios.post(loginURL, data, {
            headers: {
                'Content-Type': 'application/json',
                'CSRF-TOKEN': csrfToken,
                'Cookie': `cookie=${cookie}`
            }
        });
        if (res.status === 200) {
            console.info('[+] Successfully logged in!');
        }
        cookie = res.headers['set-cookie']
            ? (res.headers['set-cookie'][0].split('; ').find(row => row.startsWith('cookie=')).split('=')[1])
            : undefined;

        if (!cookie) {
            console.error('[-] Error: ', 'Cookie is invalid!');
            return undefined;
        }
        return cookie;
    } catch (err) {
        console.error('[-] Error: ', err.message);
    }
};

const checkLogs = async (cookie, adminUsername) => {
    const user = await Users.findOne({ username: adminUsername });
    if (!user) {
        console.error('[-] Error: ', 'If you see this message, so you did something right for getting flag, please restart server again.:)');
    }
    const logs = await Logs.findOne({ user: user._id });
    let check = false;
    if (!logs || logs.data.length === 0) {
        console.info('[-] Info: ', 'No logs found!');
        return;
    }
    logs.data.forEach(log => {
        const userMessage = log.message;

        if (log.checked === false) {
            console.info('[+] New logs found!');
            check = true;
            log.checked = true;
            axios.get(userMessage, {
                headers: {
                    'Cookie': `cookie=${cookie}`
                }
            })
                .then((res) => {
                    console.log('[+] Notification sent.!');
                })
                .catch(err => {
                    console.log('[+] Notification sent.!');
                });
        }
    });

    if (!check) {
        console.warn('[!] Info: ', 'No new logs found!');
    }
    logs.markModified('data');
    await logs.save();
};


const checkMails = async (cookie, adminUsername) => {
    const targetUrl = 'http://overchain_app:4000/panel';
    const user = await Users.findOne({ username: adminUsername });

    if (!user) {
        console.error('[-] Error: ', 'If you see this message, so you did something right for getting flag, please restart server again.:)');
        return;
    }

    if (!user.mails || user.mails.length === 0) {
        console.info('[-] Info: ', 'No mails found!');
        return;
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setExtraHTTPHeaders({
        'Cookie': `cookie=${cookie}`
    });

    let check = false;

    for (const mail of user.mails) {
        if (mail.checked === false) {
            console.info('[+] New Mails found!');
            check = true;

            await page.goto(targetUrl);
            await new Promise(resolve => setTimeout(resolve, 1000));

            await Users.findOneAndUpdate(
                { _id: user._id, "mails._id": mail._id },
                { $set: { "mails.$.checked": true } }
            );

            console.info('[+] Mail checked!');
        }
    }

    await browser.close();

    if (!check) {
        console.warn('[!] Info: ', 'No new mails found!');
    }
};


const bot = async () => {
    adminUsername = await findAdminUsername(adminId);
    if(typeof adminCookie==='undefined' && !adminCookie){
        adminCookie = await getUserCookies(adminUsername);
    }
    if (adminCookie && adminUsername) {
        await checkLogs(adminCookie, adminUsername);
        await checkMails(adminCookie, adminUsername);
    }
};

getAdminId().then(id => {
    adminId = id;
    setInterval(() => {
        bot();
    }, 1.5 * 60 * 1000);
}).catch(error => {
    console.error('[-] Error fetching admin ID:', error);
});
