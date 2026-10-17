### Unlicensed-site banner

The Confluence diagram editor shows an informational banner only when Atlassian
opens it with `lic=none` or without a license status parameter. Active licenses
(including trials) and unexpected values do not show the banner. Published diagrams and the
standalone editor do not show it. No display records are collected or stored.

Edit `UNLICENSED_BANNER_MESSAGE` in `hosting/src/config/banner.js` to change the
message, then rebuild and deploy the app. An empty message disables the banner.
