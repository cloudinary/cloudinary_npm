COLLECT_COVERAGE=0;

for arg in "$@"
do
    case $arg in
        --coverage)
        COLLECT_COVERAGE=1
        shift # Remove --initialize from processing
    esac
done

if [ "$COLLECT_COVERAGE" -eq "1" ]; then
  echo 'Running code coverage test on ES6 code'
  nyc --reporter=html mocha --ui bdd -R spec --recursive test/
  exit;
else
  echo 'Running tests on ES6 Code'
  mocha --ui bdd -R spec --recursive test/
fi

