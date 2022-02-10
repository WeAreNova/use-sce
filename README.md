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
- [Example - usage with an authenticated API](#example---usage-with-an-authenticated-api)
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
  // remember that the effect runs server-side and so the url cannot just be `/api/data` in this example
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

> **Don't want to have to provide the full url like above? Or want to provide authentication tokens and/or any other context? Then have a look at [Example - usage with an authenticated API](#example---usage-with-an-authenticated-api)**

#### 2. Setup the server

After setting up some of the effects, you can then get the data server-side.

```tsx
import { collectData } from "@wearenova/use-sce/server";

....

const preloadedData: { data: User[] } = { data: [] }; // you can provide any default or other values here

const html = ReactDOMServer.renderToString(
  await collectData({
    data: preloadedData, // pass in the `preloadedData` object so it can be populated with the results from the effects
    tree: (
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    ),
  })
);

// preloadedData.data = Array<User>
```

After this, `preloadedData` will be populated with the results of the effect (as long as the page at the url has hooks to display).

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

### Example - usage with an authenticated API

You may find that you have issues if you are making a request to an API/endpoint that requires the user to be authenticated.
This is because the request is made server-side and does not have access to the browser (to retrieve authentication tokens, cookies etc.).

In this case you are able to provide helpers to the effect server-side, this can then pass through any headers, cookies, or anything you want to be available to the effect when it runs on the server.

For example, you can provide an axios instance as follows:

```tsx
import { collectData } from "@wearenova/use-sce/server";

....

const preloadedData: { data: User[] } = { data: [] }; // you can provide any default or other values here

const html = ReactDOMServer.renderToString(
  await collectData({
    data: preloadedData, // pass in the `preloadedData` object so it can be populated with the results from the effects
    tree: (
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    ),
    // a custom axios instance is passed in, which provides the base url along with some headers originating from the original request.
    helper: axios.create({
      baseURL: `${req.protocol}://${req.headers.host}`,
      headers: {
        Cookie: req.headers.cookie,
        Authorization: req.headers.authorization,
      },
    }),
  })
);

// preloadedData.data = Array<User>
```

The helper is then made available as an argument to the effect only on the server and can be used like so:

```tsx
import useSCEffect from "@wearenova/use-sce";

....

const [data, setData] = useState<User[]>([]);

const handleChange = useCallback(async function (helper?: AxiosInstance) {
  const get = helper ? helper.get : axios.get;
  const res = await get<User[]>("/api/data"); // notice that we no longer need the full url as we are using the custom axios instance created above
  setData(res.data);
  return res.data;
}, []);

useSCEffect(
  async function (helper: AxiosInstance) {
    return handleChange(helper);
  },
  [handleChange],
  "data", // the key location of where to store the return value of the effect
);
```

By using the helper field (which can be whatever you would like it to be and is not tied to a specific type), you can help mitigate any issues like the one described above.

---

### API - Browser

#### useSCEffect

The **super-charged** `useEffect` hook that allows you to run effects server-side as well as in the browser.

```tsx
useSCEffect<T>(effect, deps, key);
```

| param    | type                                  | required? | description                                                           |
| -------- | ------------------------------------- | --------- | --------------------------------------------------------------------- |
| `effect` | `function(helper: any): Promise<any>` | yes       | the effect to run                                                     |
| `deps`   | `any[]`                               | yes       | `effect` will only activate if one of the values in this list changes |
| `key`    | `string`                              | no        | the key to store the result in the preloaded state                    |

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
const html = ReactDOMServer.renderToString(await collectData<T>({ data, tree, helper }));
```

| param    | type           | required? | description                                                                                                                                                                           |
| -------- | -------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`   | `Partial<T>`   | yes       | the object to store the results of the rendered super-charged effects in                                                                                                              |
| `tree`   | `ReactElement` | yes       | the react tree to render                                                                                                                                                              |
| `helper` | `any`          | no        | any helpers that you want to pass through to the effects server-side (for example usage, see [Example - usage with an authenticated API](#example---usage-with-an-authenticated-api)) |

**Returns**

Returns the updated React Tree which includes the server `SCEContext` with the preloaded data ready to be rendered server-side, to populate anywhere the data is used.
