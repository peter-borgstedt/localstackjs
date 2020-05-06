import { getEnvironments, getStage } from './lib/env-loader';

import CopyPlugin from 'copy-webpack-plugin';
import JsonReformatPlugin from './lib/json-reformat/plugin';
import NodeExternals from 'webpack-node-externals';
import TsConfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import tsTransformPaths from '@zerollup/ts-transform-paths';

import path from 'path';
import webpack from 'webpack';

const stage = getStage();
console.log(`Build stage: ${stage}`);

const reformatOptions = {
  stage,
  allowed: [
    'name', 'version', 'description', 'author', 'license', 'homepage',
    'repository', 'keywords', 'main', 'bin', 'dependencies', 'peerDependencies'
  ],
  append: {
    local: {
      name: 'localstackjs',
      main: "./index.js",
      types: "./index.d.ts"
    },
    alpha: {
      name: 'localstackjs',
      main: "./index.js",
      types: "./index.d.ts"
    },
    beta: {
      name: 'localstackjs',
      main: "./index.js",
      types: "./index.d.ts"
    },
    final: {
      name: 'localstackjs',
      main: "./index.js",
      types: "./index.d.ts"
    }
  },
};

const config: webpack.Configuration = {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\^package.json$/,
        loader: path.resolve('lib/json-reformat/loader.js'),
        options: reformatOptions
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: [ path.resolve(__dirname, 'tests'), ],
        options: {
          configFile: 'tsconfig.ext.build.json',
          getCustomTransformers: (program): object => {
            const transformer = tsTransformPaths(program);
            return {
              before: [transformer.before], // for updating paths in generated code
              afterDeclarations: [transformer.afterDeclarations] // for updating paths in declaration files
            };
          }
        }
      }
    ],
  },
  externals: [NodeExternals()],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    plugins: [ new TsConfigPathsPlugin({ configFile: 'tsconfig.ext.build.json' }) ]
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new webpack.EnvironmentPlugin(getEnvironments(stage)),
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    new CopyPlugin([
      {
        from: 'src/assets/**/*',
        to: 'assets',
        transformPath: (targetPath): string => targetPath.replace('assets/src/', ''),
        flatten: false
      },
      {
        from: 'readme.md'
      }
    ]),
    new JsonReformatPlugin(Object.assign({ src: 'package.json' }, reformatOptions))
  ],
  node: {
    __dirname: false
  },
};

export default config;
