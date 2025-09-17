const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Replace this with your Slack webhook URL
const SLACK_WEBHOOK = "https://hooks.slack.com/services/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";
// Maria's ClickUp assignee ID
const MARIA_ID = "95624081";

app.post("/clickup", async (req, res) => {
  const event = req.body;

  try {
    // Extract task + assignees safely
    const task = event.task || {};
    const assignees = (task.assignees || []).map(a => a.id?.toString());

    // Only send if Maria is assignee
    if (assignees.includes(MARIA_ID)) {
      let message = `🔔 *ClickUp Update for Maria*\nTask: ${task.name || "(no name)"}`;

      if (event.history_items) {
        event.history_items.forEach(item => {
          if (item.field === "status") {
            message += `\n➡️ Status changed to: ${item.after?.status || "unknown"}`;
          }
          if (item.type === "comment") {
            message += `\n💬 Comment: ${item.comment?.comment_text || ""}`;
          }
        });
      }

      await axios.post(SLACK_WEBHOOK, { text: message });
      console.log("✅ Sent to Slack:", message);
    } else {
      console.log("ℹ️ Ignored task, not Maria’s");
    }
  } catch (err) {
    console.error("❌ Error processing event:", err.message);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
