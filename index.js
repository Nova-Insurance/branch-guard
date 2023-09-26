import { Octokit, App } from "octokit";
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// This initializes a new Express application.
const app = express();
const apiKey = process.env.API_KEY;

const octokit = new Octokit({ auth: apiKey });


app.post('/webhook', express.json({ type: 'application/json' }), async (request, response) => {

    response.status(202).send('Accepted');

    // Check the `x-github-event` header to learn what event type was sent.
    const githubEvent = request.headers['x-github-event'];

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


const port = 3000;

// This starts the server and tells it to listen at the specified port.
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
