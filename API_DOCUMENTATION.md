# SreCore Framework & Schema Reference

This reference documents the API specifications for the core helper library `window.SreCore` and the structured database schema `tools.json`.

---

## 🛠️ SreCore Namespace APIs

The shared SRE UI core library is loaded via:
```html
<script src="../../src/js/core-tool.js"></script>
```
Once loaded, the following APIs are attached to the `window.SreCore` global object.

### 1. `setupStudioTabs(tabNames, defaultTab, elements, switchCallback)`
Configures tab switching events, viewport visibility rules, and sets active navigation classes.

* **Parameters:**
  * `tabNames` (Array of Strings): The list of tab IDs (e.g. `['policy', 'cli', 'simulator']`).
  * `defaultTab` (String): The initial tab name key to show.
  * `elements` (Object): Map of container nodes:
    * `outputBox` (HTMLElement): Main code output viewer container.
  * `switchCallback` (Function): Hook callback triggered when tab switches: `(activeTabName) => { ... }`.
* **Example Usage:**
  ```javascript
  window.SreCore.setupStudioTabs(
    ['policy', 'cli', 'simulator'],
    'policy',
    { outputBox: document.getElementById('output-box') },
    (tabName) => {
      if (tabName === 'simulator') {
        runSimulation();
      }
    }
  );
  ```

### 2. `createLogger(logsElement)`
Instantiates a sandboxed logging logger mapping console logs outputs to a viewport.

* **Parameters:**
  * `logsElement` (HTMLElement): Target DOM element where logs will be outputted.
* **Returned Object Methods:**
  * `clear()`: Wipes all logs from the element.
  * `info(message)`: Appends an informational log message (styled text).
  * `warn(message)`: Appends a warning log message (amber text).
  * `error(message)`: Appends an error log message (rose text).
* **Example Usage:**
  ```javascript
  const logger = window.SreCore.createLogger(document.getElementById('logs-view'));
  logger.clear();
  logger.info("Connecting to eBPF stream...");
  logger.warn("DNS query timed out. Retrying...");
  logger.error("Connection failed.");
  ```

### 3. `copyToClipboard(text, btnElement)`
Copies plain text data to the client system clipboard and performs button labels toggle feedback.

* **Parameters:**
  * `text` (String): Raw text payload to write.
  * `btnElement` (HTMLElement): Copy button trigger that displays feedback (e.g. "Copied!").

---

## 🗄️ Card Registry Schema (`tools.json`)

Each entry object in the array in [tools/tools.json](file:///d:/Domain/tools/tools.json) must follow this schema:

| Property | Type | Required | Description |
|---|---|---|---|
| `title` | String | Yes | The name of the studio displayed on the card. |
| `desc` | String | Yes | A short description detailing the capabilities of the generator. |
| `category` | String | Yes | Classification matching filter tags (`ai`, `cloud`, `cicd`, `automation`, `observability`). |
| `icon` | String | Yes | Emojis or simple characters representing the card. |
| `color` | String | Yes | CSS color string used to colorize the card icon (e.g. `rgb(99, 102, 241)`). |
| `borderClass` | String | No | Tailwind/CSS border classes applied on loading layout. |
| `bgClass` | String | No | Tailwind/CSS background classes. |
| `tag` | String | Yes | Short tag indicating default target template script filename. |
| `link` | String | Yes | The directory path to launch the studio (relative to `tools/`). |
