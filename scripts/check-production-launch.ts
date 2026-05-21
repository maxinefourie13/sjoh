const site = process.env.SITE_URL ?? "https://sjoh.co.za";

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

async function text(url: string) {
  const response = await fetch(url, { redirect: "follow" });
  return {
    url,
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    body: await response.text(),
  };
}

async function binary(url: string) {
  const response = await fetch(url, { redirect: "follow" });
  return {
    url,
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
  };
}

function assetUrls(html: string) {
  return [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((path) => path.startsWith("/assets/"))
    .map((path) => new URL(path, site).toString());
}

function log(checks: Check[]) {
  for (const check of checks) {
    const status = check.ok ? "PASS" : "FAIL";
    console.log(`${status} ${check.name}: ${check.detail}`);
  }
}

async function main() {
  const checks: Check[] = [];
  const home = await text(`${site}/`);

  checks.push({
    name: "home",
    ok: home.status === 200 && home.contentType.includes("text/html"),
    detail: `${home.status} ${home.contentType}`,
  });

  checks.push({
    name: "icon-192",
    ...(await binary(`${site}/icon-192.png`).then((icon) => ({
      ok: icon.status === 200 && icon.contentType.includes("image/png"),
      detail: `${icon.status} ${icon.contentType}`,
    }))),
  });

  const sitemap = await text(`${site}/sitemap.xml`);
  const requiredSitemapUrls = [
    "/acceptable-use",
    "/shipping",
    "/returns",
    "/for-businesses/creative",
  ];

  for (const path of requiredSitemapUrls) {
    const listed = sitemap.body.includes(`${site}${path}`);
    checks.push({
      name: `sitemap ${path}`,
      ok: sitemap.status === 200 && listed,
      detail: sitemap.status !== 200 ? `${sitemap.status} sitemap fetch` : listed ? "listed" : "missing",
    });
  }

  const assets = assetUrls(home.body);
  const jsAssets = assets.filter((url) => url.endsWith(".js"));
  const bundleText = (
    await Promise.all(
      jsAssets.map(async (url) => {
        try {
          return (await text(url)).body;
        } catch {
          return "";
        }
      }),
    )
  ).join("\n");

  const requiredBundleMarkers = [
    "SORTED30",
    "You do the work. We make sure local customers can find you.",
    "Acceptable Use Policy",
  ];

  for (const marker of requiredBundleMarkers) {
    checks.push({
      name: `bundle marker ${marker.slice(0, 28)}`,
      ok: bundleText.includes(marker),
      detail: bundleText.includes(marker) ? "found in deployed JS" : "missing from deployed JS",
    });
  }

  log(checks);

  if (checks.some((check) => !check.ok)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
