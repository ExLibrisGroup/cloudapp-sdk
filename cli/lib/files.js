const fs = require("fs-extra");
const path = require("path");

const cheerio = require("cheerio");
const entities = new (require("html-entities").XmlEntities)();
const htmlBeautify = require('js-beautify').html;

const { workNg } = require("./dirs");

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
    $(`<meta http-equiv="Content-Security-Policy" content="${getCsp(manifest.contentSecurity)}">`).prependTo($head);
    if (process.env.NODE_ENV === "production") {
        $head.find("title").remove();
        const $title = $("<title>");
        $title.text(manifest.title);
        $title.prependTo($head);
        // TODO: Beacon
    }
    return htmlBeautify($.html(), { "preserve_newlines": false });
}

const getCsp = (contentSecurity) => {
    const csp = { 
        "default-src": "'none'",
        "style-src": "'self' 'unsafe-inline' fonts.googleapis.com",
        "script-src": "'self'",
        "font-src": "fonts.gstatic.com",
        "img-src": "'self' data: https:",
        "connect-src": "'self'",
        "frame-src": "'self'"
    }
    if (process.env.NODE_ENV !== "production") {
        csp["script-src"] = `'unsafe-eval' 'unsafe-inline' ${csp["script-src"]}`;
    }
    if (contentSecurity) {
        Object.entries(contentSecurity).forEach(([key, val]) => {
            key = camelToKebab(key);
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

const camelToKebab = string => string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

module.exports = { indexHtml, updateIndexHtmlFile }
