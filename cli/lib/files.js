const fs = require("fs-extra");
const path = require("path");

const cheerio = require("cheerio");
const entities = new (require("html-entities").XmlEntities)();
const htmlBeautify = require('js-beautify').html;

const { workNg } = require("./dirs");
const { kebabCase } = require("lodash");

const indexHtml = [workNg, "src", "index.html"].join(path.sep);

const getManifest = () => {
    return JSON.parse(fs.readFileSync("manifest.json", "utf8"));;
}

const updateIndexHtmlFile = file => {
    const html = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, updateIndexHtml(html, getManifest()));
}

const updateIndexHtml = (html, manifest) => {
    const $ = cheerio.load(html, { decodeEntities: false, normalizeWhitespace: true });
    let $head = $("head");
    if ($head.length === 0) $head = $("<head>");
    $head.find("meta[http-equiv='Content-Security-Policy']").remove();
    if (process.env.NODE_ENV != "production") {
        $(`<meta http-equiv="Content-Security-Policy" content="${getCsp(manifest.contentSecurity)}">`).prependTo($head);
    }
    return htmlBeautify($.html(), { "preserve_newlines": false });
}

const getCsp = (contentSecurity) => {
    const csp = { 
        "default-src": "'none'",
        "style-src": "'self' 'unsafe-inline' fonts.googleapis.com",
        "script-src": "'self'",
        "font-src": "'self' fonts.gstatic.com *.ext.exlibrisgroup.com",
        "img-src": "'self' data: https:",
        "connect-src": "'self'",
        "frame-src": "'self' https:"
    }
    if (process.env.NODE_ENV !== "production" && !process.env.LAMBDA_TASK_ROOT) {
        csp["script-src"] = `'unsafe-eval' 'unsafe-inline' ${csp["script-src"]}`;
    }
    if (contentSecurity) {
        Object.entries(contentSecurity).forEach(([key, val]) => {
            key = kebabCase(key);
            if (key in csp && Array.isArray(val)) {
                const whitelist = entities.encodeNonUTF(val.join(" "));    
                csp[key] = `${csp[key]} ${whitelist}`;
            } 
        })
    }
    let arr = [];
    for (const directive in csp) {
        arr.push(`${directive} ${csp[directive]}`);
    }
    return arr.join("; ");
}

module.exports = { indexHtml, updateIndexHtmlFile }
