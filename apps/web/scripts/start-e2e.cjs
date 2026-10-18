// Exercise the same standalone server/assets layout as the production image.
const { cpSync, mkdirSync } = require("node:fs");
const path = require("node:path");

const web = path.resolve(__dirname, "..");
const standalone = path.join(web, ".next/standalone/apps/web");
mkdirSync(path.join(standalone, ".next"), { recursive: true });
cpSync(path.join(web, ".next/static"), path.join(standalone, ".next/static"), { recursive: true });
cpSync(path.join(web, "public"), path.join(standalone, "public"), { recursive: true });
process.env.PORT = "43119";
process.env.HOSTNAME = "127.0.0.1";
process.env.CONTENT_ROOT = path.resolve(web, "../../content");
require(path.join(standalone, "server.js"));
