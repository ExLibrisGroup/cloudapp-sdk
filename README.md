# Ex Libris Cloud Apps SDK

This repository contains the packages used to develop Ex Libris Cloud Apps. 

* Angular Library which provides the functionality which interacts with Alma and the Higher Ed Platform
* Base library which provides a sample application
* Components library with reusable Cloud App components (see [eca-components](./eca-components/README.md))
* CLI used to manage the development environment.
* Agent and skills package that installs AI coding agent instructions into Cloud App projects (see [agents](./agents/README.md)).

For more information on Cloud Apps, see the [Ex Libris Developer Network](https://developers.exlibrisgroup.com/cloudapps/)

## Installation
This SDK can be installed from NPM:
`
npm install -g @exlibris/exl-cloudapp-cli
`

To add the AI coding agent instructions and skills to a Cloud App project, run this from the project folder:
`
eca agents install
`

## Contributions
You can open issues in this repository. Contributions are welcome.

## License 
This SDK is licensed under the terms of the [BSD 3-Clause](./LICENSE) license. Apps developed with the SDK are intended for use with Ex Libris products and are subject to the terms specified in the [Ex Libris Developer Network Terms of Use](https://developers.exlibrisgroup.com/about/terms/).
