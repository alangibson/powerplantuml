import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import * as querystring from 'querystring';
import * as functions from 'firebase-functions';
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
var app = express();
var addon = ace(app);
app.use(addon.middleware());

export const confluenceDynamicMacroFunction = (request, response, addon) => {

    // Parse incoming request from Confluence
    const macroId = <string>request.query['macroId'];
    const pageId = <string>request.query['pageId'];
    const pageVersion = <string>request.query['pageVersion'];

    // Request macro properties
    var httpClient = addon.httpClient(request);
    const url = `/rest/api/content/${pageId}/history/${pageVersion}/macro/id/${macroId}`;
    httpClient.get(url, function(err, res, body) {
        // console.log('!!!!!!!!!!', url);
        console.log('!!!!!!!!!!', body);
        // console.log('!!!!!!!!!!', res.statusCode);

        if (res.statusCode != 200) {
            console.error(res.statusCode, body);
            
            // Try again
            // setTimeout(() => {
            //     console.log('Will try again in 1 second');
            //     confluenceDynamicMacroFunction(request, response, addon);
            // }, 1000);
            // return;

            return response.writeHead(res.statusCode)
                .end();
        }

        // Parse request
        body = JSON.parse(body);
        const uml = body.body;
        const imageType = 'svg';
        const escapedUrl = body.parameters.url.value;
        const encodedUML = body.parameters.encodedUML.value;
        // TODO pass body as first parameter
        const encoded = extractEncodedUML(escapedUrl, encodedUML);

        // Just embed the SVG doc
        const renderUrl = `https://render.powerplantuml.com/${imageType}/${encoded}`;
        const proxy = https.request(
            renderUrl,
            res => {
                response.writeHead(res.statusCode, res.headers);
                res.pipe(response, { end: true });
            });
        request.pipe(proxy, { end: true });
    });
 }


app.get('/confluence/dynamic-macro', addon.authenticate(), 
    // Pass addon global var to handler function
    (req, res)=> confluenceDynamicMacroFunction(req, res, addon));
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

    const proxy = http.request(
        {
            hostname: 'render.powerplantuml.com',
            port: 80,
            path: `/${imageType}/${encoded}`,
            method: 'GET'
        },
        res => {
            response.writeHead(res.statusCode, res.headers);
            res.pipe(response, { end: true });
        });
    
    request.pipe(proxy, { end: true });
});
