

# Development Journey #

## Express App ##
Created a project branch-guard using npm init
npm install express
Refer the API Documentation from Github and create index.js https://docs.github.com/en/webhooks/using-webhooks/handling-webhook-deliveries#javascript-example
Star server node index.js
To ping test locally  'curl -X POST http://localhost:3000/webhook'

## Configure ngrok ##
brew install ngrok/ngrok/ngrok
ngrok config add-authtoken <your-token>
ngrok http 3000 👉 https://023f-119-18-1-213.ngrok-free.app


## Configure Github Webhook ##
Create Organization > Nova Insurance > Settings > Add webhook
Subscribe for 'Repository Create / Update' events
Add url https://023f-119-18-1-213.ngrok-free.app/webhook

Read documentation about repository event
https://docs.github.com/en/webhooks/webhook-events-and-payloads?actionType=created#repository


Repository created events are being recived correctly 🎉

### Rest API Integration ###


#### Authenticate Using Personal Token ####
Read https://github.com/octokit/octokit.js/#readme
Admin branch protection: https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2022-11-28#set-admin-branch-protection
Find relavant token permission (Administration) for enforing {branch}/protection/enforce_admins https://docs.github.com/en/rest/overview/permissions-required-for-fine-grained-personal-access-tokens?apiVersion=2022-11-28#repository-permissions-for-administration
Create personal token with fine grained permission for the administration of branches Developer Settings > Resource Owner > Organization
Update the code to make auth calls from https://github.com/octokit/octokit.js/#readme
Authentication using Octokit works  🎉

#### Protecting the Branch ####

Lookup rest endpoint for protecting branch 
https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2022-11-28#update-branch-protection ✅


#### Create an Issue ####

Lookup and follow documentation
https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue

### Serverles Deployment [In-Progress]###

https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=javascript%2Cwindows%2Cazure-cli&pivots=nodejs-model-v4
