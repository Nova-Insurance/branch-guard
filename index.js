// You installed the `express` library earlier. For more information, see "[JavaScript example: Install dependencies](#javascript-example-install-dependencies)." 
import { Octokit, App } from "octokit";
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// This initializes a new Express application.
const app = express();
const apiKey = process.env.API_KEY;
// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({ auth: apiKey });


// This defines a POST route at the `/webhook` path. This path matches the path that you specified for the smee.io forwarding. For more information, see "[Forward webhooks](#forward-webhooks)."
//
// Once you deploy your code to a server and update your webhook URL, you should change this to match the path portion of the URL for your webhook.
app.post('/webhook', express.json({ type: 'application/json' }), async (request, response) => {

    // Respond to indicate that the delivery was successfully received.
    // Your server should respond with a 2XX response within 10 seconds of receiving a webhook delivery. If your server takes longer than that to respond, then GitHub terminates the connection and considers the delivery a failure.
    response.status(202).send('Accepted');

    // Check the `x-github-event` header to learn what event type was sent.
    const githubEvent = request.headers['x-github-event'];

    // You should add logic to handle each event type that your webhook is subscribed to.
    // For example, this code handles the `issues` and `ping` events.
    //
    // If any events have an `action` field, you should also add logic to handle each action that you are interested in.
    // For example, this code handles the `opened` and `closed` actions for the `issue` event.
    //
    // For more information about the data that you can expect for each event type, see "[AUTOTITLE](/webhooks/webhook-events-and-payloads)."
    if (githubEvent === 'repository') {
        const data = request.body;
        const action = data.action;
        console.log('GitHub sent a repository action event');
        if (action === 'created') {
            console.log(`A repository was created with this title: ${data.repository.name}`);

            // Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
            const {
                data: { login },
            } = await octokit.rest.users.getAuthenticated();
            console.log("Hello, %s", login);
            try {
                const response_protection = await octokit.request('PUT /repos/{owner}/{repo}/branches/{branch}/protection', {
                    owner: data.repository.owner.login,
                    repo: data.repository.name,
                    branch: 'main',
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    },
                    required_status_checks: null, // Set to your specific configuration
                    enforce_admins: true,
                    required_pull_request_reviews: null, // Set to your specific configuration
                    restrictions: null // Set to your specific configuration
                });
                console.log('Branch protection enforced:', response_protection.data);
            } catch (error) {
                console.error('Error enforcing branch protection:', error);
            }

            try {
                const response_issue = await octokit.request('POST /repos/{owner}/{repo}/issues', {
                    owner: data.repository.owner.login,
                    repo: data.repository.name,
                    title: 'Branch protection enabled',
                    body: 'Main branch is now protected @nanospeck .',
                    assignees: [
                        'nanospeck'
                    ],
                    labels: [
                        'branch-settings'
                    ],
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                })
                console.log('Issue created:', response_issue.data);
            } catch (error) {
                console.error('Error creating issue:', error);
            }

        } else {
            console.log(`Unhandled action for the repository event: ${action}`);
        }
    } else if (githubEvent === 'ping') {
        console.log('GitHub sent the ping event');
    } else {
        console.log(`Unhandled event: ${githubEvent}`);
    }
});

// This defines the port where your server should listen.
// 3000 matches the port that you specified for webhook forwarding. For more information, see "[Forward webhooks](#forward-webhooks)."
//
// Once you deploy your code to a server, you should change this to match the port where your server is listening.
const port = 3000;

// This starts the server and tells it to listen at the specified port.
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
