// import * as http from 'http';
import * as https from 'https';
import fetch from 'node-fetch';
import { URL } from 'url';
import * as querystring from 'querystring';
import * as functions from 'firebase-functions/v1';
import express from 'express';
import ace from 'atlassian-connect-express';

function extractEncodedUMLFromURL (url) {
    const path = new URL(url).pathname;
    const parts = path.split('.')[0].split('/');
    return parts[parts.length - 1];
}

function extractEncodedUML (escapedUrl: string, encodedUML: string): string {
    if ( encodedUML )
        return encodedUML;
    return extractEncodedUMLFromURL(querystring.unescape(escapedUrl));
}

// Configure Express app and ACE middleware for dynamic macro
const app = express();
// https://developer.atlassian.com/server/hipchat/getting-started-with-atlassian-connect-express/
const aceMiddleware = ace(app);
app.use(aceMiddleware.middleware());

const confluenceDynamicMacroFunction = (request, response, addon) => {

    functions.logger.log('confluenceDynamicMacroFunction: started');

    // Parse incoming request from Confluence
    const macroId = <string>request.query['macroId'];
    const pageId = <string>request.query['pageId'];
    const pageVersion = <string>request.query['pageVersion'];

    functions.logger.log(`confluenceDynamicMacroFunction: macroId=${macroId} pageId=${pageId} pageVersion=${pageVersion}`);

    // Request macro properties
    const httpClient = addon.httpClient(request);
    const url = `/rest/api/content/${pageId}/history/${pageVersion}/macro/id/${macroId}`;
    functions.logger.log(`confluenceDynamicMacroFunction: url=${url}`);
    httpClient.get(url, function(err, res, body) {

        functions.logger.log(`confluenceDynamicMacroFunction: statusCode=${res.statusCode}`);
        functions.logger.log(`confluenceDynamicMacroFunction: body=${body}`);

        if (res.statusCode !== 200) {
            functions.logger.error(res.statusCode, body);
            return response.send(`
            <html>
            <body>
            <script src="https://connect-cdn.atl-paas.net/all.js"></script>
            <p>
            We could not fetch the content of your diagram.
            </p>
            <p>
            If you are seeing this in preview mode, you can ignore this error. 
            Due to a longstanding bug in the new Confluence editor,
            it's not possible to fetch macro content immediately after saving it.
            </p>
            <p>
            <b>No data has been lost.</b>
            After publishing the page, the image will render normally.
            </p>
            </body>
            </html>
            `);
        }

        // Parse request
        const bodyParams = JSON.parse(body);
        // const uml = bodyParams.body;
        const imageType = bodyParams.parameters.imageType.value;
        const escapedUrl = bodyParams.parameters.url.value;
        const encodedUML = bodyParams.parameters.encodedUML.value;
        // TODO pass bodyParams as first parameter

        // Build request to rendering server
        const encoded = extractEncodedUML(escapedUrl, encodedUML);
        const renderUrl = `https://render.powerplantuml.com/${imageType}/${encoded}`;

        if (imageType == 'svg') {
            fetch(renderUrl)
                .then((renderResponse) => {
                    renderResponse.text()
                        .then((svg) => {
                            response.send(`
                            <html>
                            <body>
                            <script src="https://connect-cdn.atl-paas.net/all.js"></script>
                            ${svg}
                            </body>
                            </html>
                            `);        
                        });
                })
                .catch((error) => {
                    console.error(error);
                });
        } else { // png, etc.
            response.send(`
            <html>
            <body>
            <script src="https://connect-cdn.atl-paas.net/all.js"></script>
            <img src="${renderUrl}"/>
            </body>
            </html>
            `);
        }
    });
 }

app.get('/confluence/dynamic-macro', aceMiddleware.authenticate(), 
    // Pass addon global var to handler function
    (req, res)=> confluenceDynamicMacroFunction(req, res, aceMiddleware));
export const confluenceDynamicMacro = functions.https.onRequest(app);

/**
 * Return PlantUML image wrapped as a simple Confluence static macro.
 */

//  export const confluenceDynamicMacro2 = functions.https.onRequest(confluenceDynamicMacroFunction);


/**
 * Return PlantUML image wrapped as a simple Confluence static macro.
 */
 export const confluenceStaticMacro = functions.https.onRequest((request, response) => {

    let imageType = request.query['imageType']; // Required
    // Cast these to string because we know they will only ever be a single string
    let escapedUrl = <string>request.query['url']; // Required
    let encodedUML = <string>request.query['encodedUML']; // Optional
    let contentLanguage = request.query['language']; // Optional. Usually 'plantuml'

    // Also support POST
    if (request.body) {
        imageType = request.body.imageType ? request.body.imageType : imageType;
        escapedUrl = request.body.escapedUrl ? request.body.escapedUrl : escapedUrl;
        encodedUML = request.body.encodedUML ? request.body.encodedUML : encodedUML;
        contentLanguage = request.body.contentLanguage ? request.body.contentLanguage : contentLanguage;
    }

    if (! contentLanguage) {
        contentLanguage = 'plantuml';
    }
    const encoded = extractEncodedUML(escapedUrl, encodedUML);

    // TODO dont hard code plantuml server. refer to confluenceImagePlaceholder instead
    response.send(`<ac:image><ri:url ri:value="https://render.powerplantuml.com/${imageType}/${encoded}" /></ac:image>`);
});

/**
 * Proxy requests from Confluence for imagePlaceholder to PlantUML rendering server.
 */
export const confluenceImagePlaceholder = functions.https.onRequest((request, response) => {
    const imageType = request.query['imageType']; // Required
    // Cast these to string because we know they will only ever be a single string
    const escapedUrl = <string>request.query['url']; // Required
    const encodedUML = <string>request.query['encodedUML']; // Optional
    // const contentLanguage = request.query['language']; // Optional. Usually 'plantuml'
    const encoded = extractEncodedUML(escapedUrl, encodedUML);

    const proxy = https.request(
        {
            hostname: 'render.powerplantuml.com',
            port: 443,
            path: `/${imageType}/${encoded}`,
            method: 'GET'
        },
        res => {
            response.writeHead(res.statusCode, res.headers);
            res.pipe(response, { end: true });
        });
    
    request.pipe(proxy, { end: true });
});


/**
 * Glue code. Called by Confluence when user installs app.
 * 
 * https://developer.atlassian.com/cloud/jira/platform/security-for-connect-apps/
 * https://developer.atlassian.com/cloud/jira/platform/user-impersonation-for-connect-apps/
 */
export const installed = functions.https.onRequest(app);

/**
 * Glue code. Called by Confluence when user uninstalls app.
 */
export const uninstalled = functions.https.onRequest(app);
