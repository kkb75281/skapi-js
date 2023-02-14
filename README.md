# skapi

skapi is a backend framework for frontend developers.

Build fast and scalable web services based on skapi's serverless technology.

skapi is built to work well on both plain HTML and Webpack projects.

100% Serverless. No maintenance or CLI installation is required.

<br>

# Features
- Auto indexed scalable database.
- Authentication for web services.
- Cloud storage.
- E-Mail newsletters to customers.

<br>
 
# Getting started

For webpack running projects:
```
$ npm i skapi-js
```

<br>

```
import {Skapi} from 'skapi-js';
let skapi = new Skapi('your_service_id', 'your_user_id');
```

For HTML projects:
```
<head>
  <script src="https://broadwayinc.dev/jslib/skapi/latest/skapi.js">
</head>
<script>
    let skapi = new Skapi('your_service_id', 'your_user_id');
</script>
```

<br>

# Notice

We have just released an alpha!

Check out our website: https://skapi.com
