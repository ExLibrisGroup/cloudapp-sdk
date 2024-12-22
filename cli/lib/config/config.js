import fs from "fs-extra";
import _ from "lodash";
import path from "path";
import prompts from "prompts";

import { cwd, workNg } from "../dirs.js";
import { configDef } from "./def.js";

export const angularJson = [workNg, "angular.json"].join(path.sep);
export const tsConfig = [workNg, "tsconfig.json"].join(path.sep);
export const tsconfigOverride = [cwd, "tsconfig.override.json"].join(path.sep);

const validateConfig = config => {
  if (!config || (Object.keys(config) || []).length === 0) {
    return Object.keys(configDef);
  }
  const keys = [];
  for (let key in config) {
    const def = configDef[key];
    if (def && def.validate && !def.validate(config[key])) {
      keys.push(key);
    }
  };
  for (let key in configDef) {
    if (typeof config[key] === "undefined") {
      keys.push(key);
    }
  }
  return keys;
}

const getQuestion = name => {
  const confDef = configDef[name];
  if (confDef && confDef.question) {
    const { type = "text", question } = confDef;
    return Object.assign(question, { name, type });
  }
  return null;
}

const getQuestions = names => {
  const questions = [];
  for (let i in names) {
    const name = names[i];
    const question = getQuestion(name);
    if (question !== null) {
      questions.push(question);
    }
  }
  return questions;
}

const transformConfigValues = config => {
  for (let name in config) {
    const transform = (configDef[name] || {}).transform || (x => x);
    config[name] = transform(config[name]);
  }
}

const writeConfig = config => {
  fs.writeFileSync(`${cwd}/config.json`, JSON.stringify(config, null, 3));
  fs.writeFileSync(`${workNg}/config.json`, JSON.stringify({ target: new URL(config.env).origin }));
  const ngConf = JSON.parse(fs.readFileSync(angularJson, "utf8"));
  updateNgConf(ngConf, config);
  fs.writeFileSync(angularJson, JSON.stringify(ngConf, null, 3));
}

const updateNgConf = (ngConf, config) => {
  if (!ngConf.$schema.startsWith(cwd)) {
    ngConf.$schema = path.resolve(`${cwd}/${ngConf.$schema}`);
  }
  if (config) {
    ngConf.projects["exl-cloudapp-sdk-base"].architect.serve.options.port = +config.port;
  }
  const pathToInclude = path.resolve(`${cwd}/node_modules`);
  [
    "architect.test.options.stylePreprocessorOptions.includePaths",
    "architect.build.options.stylePreprocessorOptions.includePaths"
  ].forEach(jsonPath => {
    const includePaths = _.get(ngConf.projects["exl-cloudapp-sdk-base"], jsonPath);
    if (includePaths && includePaths.indexOf(pathToInclude) === -1) {
      includePaths.push(pathToInclude);
    }
  });
}

export const updateNgConfigPaths = () => {
  const ngConf = JSON.parse(fs.readFileSync(angularJson, "utf8"));
  updateNgConf(ngConf);
  fs.writeFileSync(angularJson, JSON.stringify(ngConf, null, 3));
}

export const updateTsConf = () => {
  if (!fs.existsSync(tsconfigOverride)) return;
  const tsConfOverride = JSON.parse(fs.readFileSync(tsconfigOverride, "utf8"));
  if (!tsConfOverride || (!tsConfOverride.compilerOptions && !tsConfOverride.angularCompilerOptions)) return;
  const tsConf = JSON.parse(fs.readFileSync(tsConfig, "utf8"));
  if (tsConfOverride.compilerOptions) {
    _.merge(tsConf.compilerOptions, tsConfOverride.compilerOptions);
  }
  if (tsConfOverride.angularCompilerOptions) {
    _.merge(tsConf.angularCompilerOptions, tsConfOverride.angularCompilerOptions);
  }
  fs.writeFileSync(tsConfig, JSON.stringify(tsConf, null, 2));
}

export const checkConfig = async (conf = null) => {
  const config = conf || getConfig();
  const questions = getQuestions(validateConfig(config));
  if (questions.length > 0) {
    console.log();
    const response = await prompts(questions);
    Object.assign(config, response);
  }
  transformConfigValues(config);
  config.name = _.kebabCase(config.title);
  if (validateConfig(config).length > 0) {
    throw new Error("Config is not valid");
  }
  writeConfig(config);
  console.log("\r\nUsing config:");
  console.log(_.pick(config, ['env', 'port']));
  return config;
}

export const getConfig = () => JSON.parse(fs.readFileSync(`${cwd}/config.json`))
