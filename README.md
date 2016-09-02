armcalc-rest-client
===================

[![Build Status](https://travis-ci.org/WSDOT-GIS/armcalc-rest-client.svg?branch=master)](https://travis-ci.org/WSDOT-GIS/armcalc-rest-client)

Client for calling the ArmCalc service REST endpoint.

See `armcalc-clientSpec.ts` for examples.

Install via NPM
---------------

`npm install github:wsdot-gis/armcalc-rest-client`

See `spec/armcalc-clientSpec.ts` for usage examples.

For Developers
--------------

The recommended developmenet environment is [Visual Studio Code].

### Running Tests ###

#### NPM ####

##### Mock test #####

    npm test

##### Test using live web service (inside WSDOT only) #####

    npm run test:live

#### Browser (via Karma, inside WSDOT only) ####

    npm run test:browser

[Visual Studio Code]:http://code.visualstudio.com