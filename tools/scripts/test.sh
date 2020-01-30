set -e node_v=$(node --version)
if [[ "${node_v%%.*z}" == 'v4' ]]
then
  npm run test-es5
else
  npm run test-es6
fi
  npm run dtslint
