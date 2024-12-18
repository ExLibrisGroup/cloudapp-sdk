const {target} = require("../config.json");

const PROXY_CONFIG = {
    "/": {
        target,
        secure: false,
        onProxyRes: (proxyRes, req, res) => {
            let cookies =  proxyRes.headers['set-cookie'];
            cookies && cookies.forEach((val, i, arr) => {
                const parts = val.split(";").map(p=>p.trim());
                arr[i] = parts.filter(p=>p.match(/^(?!SameSite|Secure)/i)).join('; ')
                /* Handle sticky cookie for load balancer */
                .replace(/__Secure-/g, "KUKUBALALA");
            });
            proxyRes.headers['set-cookie'] = cookies;
			// Handle Content-Security-Policy header
			let cspHeader = proxyRes.headers['content-security-policy'];
			if (cspHeader) {
				// Remove "upgrade-insecure-requests" from the CSP header
				proxyRes.headers['content-security-policy'] = cspHeader
					.split(";")
					.map(directive => directive.trim())
					.filter(directive => directive.toLowerCase() !== "upgrade-insecure-requests")
					.join("; ");
		}
        },
        onProxyReq: (proxyReq, req, res) => {
            let cookies = req.headers['cookie'];
            /* Handle sticky cookie for load balancer */
            cookies && proxyReq.setHeader('Cookie', cookies.replace(/KUKUBALALA/g, "__Secure-"));
        }
    }
}

module.exports = PROXY_CONFIG;