# cloud-functions-examples

## To start with this project
1. Go to the [Firebase console](https://console.firebase.google.com/) and create a new project or choose(if you already have one)

2. Install globally firebase-tools on your computer
* npm install -g firebase-tools
3. In this project main directory:
  1. Login to Firebase Cloud
    * firebase login
  2. Initialize Fireebase
    * firbase init
4. In the _src/_ forlder:
  * npm istall


## To deploy whole project to firebase cloud
* firebase deploy

## To deploy only cloud functions
* firebase deploy --only funcitons

## To deploy specific function
* firebase deploy --only funcitons:<YOUR_FUNCTION_NAME>

More information about Cloud Functions for Firebase you can find [here](https://firebase.google.com/docs/functions)

Nuxt project:
# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
