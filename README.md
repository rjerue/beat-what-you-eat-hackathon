# Beat what you eat

Made of very little sleep during hackumass

Live demo at [beat-what-you-eat.jerue.org](beat-what-you-eat.jerue.org).

## What is this?

This is an application that uses the [UDSA nutritional facts database](https://ndb.nal.usda.gov/ndb/) to see how far you need to run in order to "work off" certain foods. It supports generic names and UPC codes.

## How to use

Make a file with the following inside of src/

```
export default{
    key: "MY_API_KEY"
}
```

MY_API_KEY is your API key for UDSA's database

Then run the following

`npm start`

And then have at it.