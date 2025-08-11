import os from "os";
import path from "path";
import { expect } from "chai";
import { spawn, spawnSync } from "child_process";
import { Builder, By, Capabilities } from "selenium-webdriver";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// create the path to the expected application binary
const application = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "src-tauri",
  "target",
  "debug",
  "tauri-app"
);

// keep track of the webdriver instance we create
let driver;

// keep track of the tauri-driver process we start
let tauriDriver;
let exit = false;

before(async function () {
  // set timeout to 2 minutes to allow the program to build if it needs to
  this.timeout(120000);

  // ensure the program has been built
  spawnSync("pnpm", ["tauri", "build", "--no-bundle"], {
    cwd: path.resolve(__dirname, "../../.."),
    stdio: "inherit",
    shell: true,
  });

  // start tauri-driver
  tauriDriver = spawn(
    path.resolve(os.homedir(), ".cargo", "bin", "tauri-driver"),
    [],
    { stdio: [null, process.stdout, process.stderr] }
  );

  const capabilities = new Capabilities();
  capabilities.set("tauri:options", { application });
  capabilities.setBrowserName("wry");

  // start the webdriver client
  driver = await new Builder()
    .withCapabilities(capabilities)
    .usingServer("http://localhost:4444/")
    .build();
});

after(async function () {
  // stop the webdriver session
  await closeTauriDriver();
});

describe("Hello Tauri", () => {
  it("should be cordial", async () => {
    const text = await driver.findElement(By.css("body h1")).getText();
    expect(text).to.match(/^Welcome/);
  });

  it("should be excited", async () => {
    const text = await driver.findElement(By.css("body h1")).getText();
    expect(text).to.match(/!$/);
  });

  it("should be easy on the eyes", async () => {
    // selenium returns color css values as rgb(r, g, b)
    const text = await driver
      .findElement(By.css("body"))
      .getCssValue("background-color");

    const rgb = text.match(/^rgb\((?<r>\d+), (?<g>\d+), (?<b>\d+)\)$/).groups;
    expect(rgb).to.have.all.keys("r", "g", "b");

    const luma = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    expect(luma).to.be.lessThan(100);
  });
});

async function closeTauriDriver() {
  exit = true;
  // stop the webdriver session
  await driver.quit();

  // kill the tauri-driver process
  tauriDriver.kill();
}

function onShutdown(fn) {
  const cleanup = () => {
    try {
      fn();
    } finally {
      process.exit();
    }
  };

  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGHUP", cleanup);
  process.on("SIGBREAK", cleanup);
}

onShutdown(() => {
  closeTauriDriver();
});
