#!/bin/bash
# We 'sleep' here to let the sample file to finish uploading and indexing in the elastic
node tools/createTestCloud && sleep 3 && source tools/cloudinary_url.sh && npm run test
