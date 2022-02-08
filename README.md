<p align="center">
  <a href="https://github.com/WeAreNova"><img src="https://github.com/WeAreNova/mui-data-table/raw/main/docs/assets/favicon.png" height="90px"></a>
</p>
<h1 align="center">
  React Super-Charged Effect
</h1>

<div align="center">

A super-charged React `useEffect` hook for use with server-side rendering to make preloading state a breeze.

<!-- [![npm (scoped)](https://img.shields.io/npm/v/@wearenova/use-sce?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/@wearenova/use-sce) [![npm](https://img.shields.io/npm/dm/@wearenova/use-sce?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/@wearenova/use-sce) ![GitHub](https://img.shields.io/github/license/WeAreNova/use-sce?style=for-the-badge) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/WeAreNova/use-sce/Build%20and%20Publish?logo=github&style=for-the-badge)](https://github.com/WeAreNova/use-sce) -->

</div>

**What does `useSCEffect` stand for?**<br/>
Well, it could mean "use super-charged effect", "use server-compatible effect" or whatever else you would like it to.

The `useSCEffect` hook is a wrapper around React's `useEffect` hook that runs the provided effect on the server as well as you would expect it to in the browser.

It provides an easy way to create and manage preloaded state on the server and in the browser.

- [Installation](#installation)
- [Usage](#usage)
  - [1. Use the `useSCEffect` hook](#1-use-the-usesceffect-hook)
  - [2. Setup the server](#2-setup-the-server)
  - [3. Setup the client](#3-setup-the-client)
- [API - Browser](#api---browser)
  - [useSCEffect](#usesceffect)
  - [usePreloadedState](#usepreloadedstate)
  - [BrowserSCE](#browsersce)
- [API - Server](#api---server)
  - [collectData](#collectdata)

#### Features

- Runs effects server-side
  - as well as how you'd expect effects to run in the browser
- Simple integration for collecting results of the effects server-side and hydrating the client with the preloaded state
- Made with TypeScript for strong typing
- Highly customisable and open for extension
- Easy to use

### Installation

```shell
// with npm
npm install --save @wearenova/use-sce

// with yarn
yarn add @wearenova/use-sce
```

### Usage

#### 1. Use the `useSCEffect` hook

First you need to make use of the `useSCEffect` hook like a normal `useEffect` hook but, you can pass in an asynchronous function.

```tsx
import useSCEffect from "@wearenova/use-sce";

....

const [data, setData] = useState<User[]>([]);

const handleChange = useCallback(async function () {
  // Remember that the effect runs server-side and so the url cannot just be `/api/data` in this example
  const res = await axios.get<User[]>("http://localhost:3000/api/data");
  setData(res.data);
  return res.data;
}, []);

useSCEffect(
  async function () {
    return handleChange();
  },
  [handleChange],
  "data", // the key location of where to store the return value of the effect
);
```

#### 2. Setup the server

After setting up some of the effects, you can then get the data server-side.

```tsx
import { collectData } from "@wearenova/use-sce/server";

....

const preloadedData: { data: User[] } = { data: [] }; // you can provide any default or other values here

const html = ReactDOMServer.renderToString(
  await collectData(
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>,
    preloadedData, // pass in the `preloadedData` object so it can be populated with the results from the effects
  ),
);

// preloadedData.data = Array<User>
```

After this, `preloadedData` will be populated with the results of the effect (as long as the url is the correct one to display the hook).

You can then do what you want with the preloaded data. For example:

```ts
res.status(200).send(`
    <!doctype html>
    <html lang="en-GB">
      <head>
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta charset="utf-8" />
          <title>UseSSE</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          ${css}
      </head>
      <body>
          <div id="root">${html}</div>
          <script>
            window.__PRELOADED_STATE__ = ${JSON.stringify(data)}
          </script>
      </body>
    </html>
`);
```

The line:

```html
<script>
  window.__PRELOADED_STATE__ = ${JSON.stringify(data)}
</script>
```

is where the preloaded data is stringified, injected into the `window` object in the browser and then accessible via `window.__PRELOADED_STATE__`.

#### 3. Setup the client

You then need to hydrate the preloaded data client-side.

This step is technically optional but highly recommended. You are able to access the preloaded data from the `window` object in the browser, but you would need to make sure the `window` is not `undefined` and makes it difficult use the data server-side.

```tsx
import { BrowserSCE } from "@wearenova/use-sce";

const Main: React.FC = () => {
  return (
    <BrowserSCE value={{ data: window.__PRELOADED_STATE__ }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BrowserSCE>
  );
};

ReactDOM.hydrate(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById("root"),
);
```

Once this is done, you are able to use the preloaded data without accessing the `window.__PRELOADED_STATE__` object.

Instead, you can either use the returned value from the `useSCEffect` hook or the provided `usePreloadedState` hook. So the same component from the client in the first step turns into the following:

```tsx
import useSCEffect from "@wearenova/use-sce";

....

const preloadedState = usePreloadedState<{ data: User[] }>();
const [data, setData] = useState<User[]>(preloadedState.data || []);

....

// or
const preloadedUsers = usePreloadedState<{ data: User[] }>("data"); // to get a specific value from the preloaded state
const [data, setData] = useState<User[]>(preloadedUsers || []);

....

// or
const handleChange = useCallback(async function () {
  const res = await axios.get<User[]>("http://localhost:3000/api/data");
  setData(res.data);
  return res.data;
}, []);

const preloadedUsers = useSCEffect(
  async function () {
    return handleChange();
  },
  [handleChange],
  "data", // the key location of where to store the return value of the effect
);

const [data, setData] = useState<User[]>(preloadedUsers || []);
```

To follow the style of React's `useEffect` hook, it is recommended to use the `usePreloadedState` hook instead of the return value of the `useSCEffect` hook. But you are welcome to do any of the methods above.

The `usePreloadedState` hook can be used for the preloaded data in the browser or on the server without having to worry about the `SCEContext` (the internal context for the `use-sce` package).

---

### API - Browser

#### useSCEffect

The **super-charged** `useEffect` hook that allows you to run effects server-side as well as in the browser.

```tsx
useSCEffect<T>(effect, deps, key);
```

| param    | type                       | required? | description                                                           |
| -------- | -------------------------- | --------- | --------------------------------------------------------------------- |
| `effect` | `function(): Promise<any>` | yes       | the effect to run                                                     |
| `deps`   | `any[]`                    | yes       | `effect` will only activate if one of the values in this list changes |
| `key`    | `string`                   | no        | the key to store the result in the preloaded state                    |

**Returns**

The `useSCEffect` hook returns `void` if `preloadedKey` is not provided, otherwise the result of the effect from the preloaded state.

#### usePreloadedState

A hook to return the value of the preloaded state.

```tsx
const preloadedState = usePreloadedState<T>(key);
```

| param | type     | required? | description                                            |
| ----- | -------- | --------- | ------------------------------------------------------ |
| `key` | `string` | no        | the key of the data to return from the preloaded state |

**Returns**

If param `key` is provided, this hook will return the value at the given key in the preloaded state. Otherwise, it will return the entire preloaded state.

- `preloadedState` has type `T` or `T[key]`

#### BrowserSCE

A functional component to handle the set-up of the browser preloaded-state context.

```tsx
<BrowserSCE value={value}>
  <App />
</BrowserSCE>
```

| param   | type          | required? | description                                                                            |
| ------- | ------------- | --------- | -------------------------------------------------------------------------------------- |
| `value` | `{ data: T }` | yes       | the state for the browser `SCEContext` containing the preloaded data at the `data` key |

### API - Server

#### collectData

A function to render the react tree and collect data from the super-charged effects on the server.

```tsx
const html = ReactDOMServer.renderToString(await collectData<T>(reactTree, data));
```

| param       | type           | required? | description                                                              |
| ----------- | -------------- | --------- | ------------------------------------------------------------------------ |
| `reactTree` | `ReactElement` | yes       | the react tree to render                                                 |
| `data`      | `Partial<T>`   | yes       | the object to store the results of the rendered super-charged effects in |

**Returns**

Returns the updated React Tree which includes the server `SCEContext` with the preloaded data.
