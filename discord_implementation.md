
# USSS Agent Leaderboard - Data Structure

## Discord Embed JSON Structure
All data must be sent as a single Request Body to `PATCH /webhooks/:id/messages/:messageId`.

```json
{
  "embeds": [
    {
      "title": "USSS Agent Leaderboard",
      "description": "```md\n| Rank | Name | Static | Dep | Day | Week | Total |\n|---|---|---|---|---|---|---|\n| Agent | J.Doe | #1234 | USSS | 15 | 50 | 150 |\n... up to ~40 rows ...\n```",
      "color": 3066993,
      "timestamp": "2023-10-27T10:00:00.000Z",
      "footer": { "text": "Majestic RP USSS" }
    },
    {
      "description": "```md\n... continuation of table ...\n```",
      "color": 3066993
    }
  ]
}
```

## Constraints & Handling
1. **Character Limit**: A single Embed Description is max 4096 characters.
   - *Solution*: We split the list into chunks of 40 users per embed.
2. **Embed Limit**: A single message can contain up to 10 embeds.
   - *Solution*: We limit the total report to 400 users (40 * 10). If more, we truncate and log a warning.
3. **Values**:
   - `Day`: Sum of points for reports submitted today (Server Time).
   - `Week`: Sum of points for reports submitted this week (Mon-Sun).
   - `Total`: Sum of all approved reports.

## Update Logic (DiscordService)
The service automatically:
1. Calculates daily/weekly stats from the Database.
2. Formats them into Markdown tables.
3. Checks if a message ID exists in DB.
   - **Yes**: Sends PATCH request to update it.
   - **No** (or 404): Sends POST request to create new, and saves ID.
