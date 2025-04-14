# WebDriver Example

This repository contains a very simple Tauri application that leverages WebDriver to automate integration tests.

Currently WebDriver on Tauri only supports Linux and Windows.

## Requirements

- [Tauri prerequisites](https://tauri.app/start/prerequisites/)
- tauri-driver
  - `cargo install tauri-driver`
- [System WebDriver](https://tauri.app/develop/tests/webdriver/#system-dependencies)

## Testing

To run the WebDriver tests, go to one of the project directories and run the following script:

```sh
pnpm install
pnpm test
```
