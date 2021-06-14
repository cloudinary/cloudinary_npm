#!/bin/bash
set -e;

node_v=$(node --version) ;
if [[ "${node_v%%.*}" == 'v4' || "${node_v%%.*}" == 'v6' ]]
then
  echo 'Old node version - Skipping eslint'
else
  eslint ./test ./lib
fi

