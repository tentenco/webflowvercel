const download = require(`@app/downloader`)
const webflowPlugin = require(`@app/webflow-plugin`)
const sitemaps = require('sitemap-stream-parser')

// Exit if environment variables are missing
let siteUrl = process.env.WEBFLOW_URL

let siteDirectories = process.env.WEBFLOW_DIRECTORIES

let destinationOrigin = process.env.URL || process.env.VERCEL_URL || process.env.DEPLOY_URL
if(!siteUrl){
	console.error(`No "WEBFLOW_URL" environment variable set.`)
	process.exit(1)
}
if(!destinationOrigin){
	console.error(`No "URL", "VERCEL_URL", or "DEPLOY_URL" environment variable set.`)
	process.exit(1)
}


// Normalize links
if(siteUrl.indexOf(`://`) === -1){
	siteUrl = `https://` + siteUrl
}
while(siteUrl[siteUrl.length - 1] === `/`){
	siteUrl = siteUrl.substring(0, siteUrl.length - 1)
}
if(destinationOrigin.indexOf(`://`) === -1){
	destinationOrigin = `https://` + destinationOrigin
}
if(destinationOrigin[destinationOrigin.length - 1] !== `/`){
	destinationOrigin = destinationOrigin + `/`
}

var entry = [
	siteUrl,
	`${siteUrl}/404`,
	`${siteUrl}/robots.txt`,
]
if(process.env.BCP){
	entry.push(`${siteUrl}/sitemap.xml`)
}


if (siteDirectories) {
  console.log('Adding site directory');
	
  siteDirectories
    .split(',')
    .map(path => path.trim())
    .filter(Boolean)
    .forEach(path => entry.push(`${siteUrl}/${path}`));
	
}


sitemaps.parseSitemaps(`${siteUrl}/sitemap.xml`, function(url) { 
  entry.push(url);
}, function(err, sitemaps) {
  console.log('All done!');
	// Download site
	download({
		entry,
		domains: [
			{ domain: siteUrl.split(`://`)[1], path: `/` },
			{ domain: `assets.website-files.com`, path: `/assets` },
			{ domain: `uploads-ssl.webflow.com`, path: `/assets` },
		],
		replaceOrigin: destinationOrigin,
		concurrency: 10,
		dist: `../../public`,
		plugins: [
			webflowPlugin(),
		],
	})
});
