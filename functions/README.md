Firebase Cloud Functions code

Note: when adding a new function, it must be set to allow 
unauthenticated requests in the Google Cloud Function console.

# Usage

## Set up

```
npm install
```

## Run locally

```
npm run firebase use test
export GOOGLE_APPLICATION_CREDENTIALS="../powerplantuml-test-f4fbbedc5c8e.json"
npm run serve
```

## Deploy 

```
cd functions
npm run deploy
```