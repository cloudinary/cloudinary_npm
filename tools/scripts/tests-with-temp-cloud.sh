#!/bin/bash
node tools/createTestCloud && source tools/cloudinary_url.sh && npm run test
