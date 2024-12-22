import { MAX_PORT, notEmpty, validateURL, validatePort } from "./validators.js";

export const configDef = {
  title: {
    question: {
      message: "App title: ",
      validate: notEmpty
    }
  },
  subtitle: {
    question: {
      message: "App subtitle: ",
      validate: notEmpty
    }
  },
  author: {
    question: {
      message: "App author: ",
      validate: notEmpty
    }
  },  
  env: {
    question: {
      message: "Environment URL: ",
      validate: validateURL
    },
    transform: value => new URL(value).toString()
  },
  port: {
    type: "number",
    question: {
      message: "Run dev server on port: ",
      min: 0,
      max: MAX_PORT,
      initial: 4200,
      validate: validatePort
    },
    transform: value => Number(value)
  }
}
