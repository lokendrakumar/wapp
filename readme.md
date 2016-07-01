## Frankly.me website

-

#### Setup Instructions

- # Note the new setup script name for Node.js v0.12
  curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -

- # Then install with:
  sudo apt-get install -y nodejs

- clone the repository and `cd` into the folder where it is cloned
- run `chown -R yourusername /path/to/global/node_modules/folder`
- run `./setup.sh` from repository root and let it finish
- run `./bin/dev_start.sh` to start the local server
- go to localhost:3000 in your browser, you should see the frankly home-page
