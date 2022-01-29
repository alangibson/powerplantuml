import * as http from 'http';
import { URL } from 'url';
import * as querystring from 'querystring';
import * as functions from 'firebase-functions';

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
