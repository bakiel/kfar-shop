# Claude Code Error Resolution Guide

## Common API Errors and Fixes

### Error: "tool_use ids were found without tool_result blocks"
**Cause:** Interrupted tool execution in previous messages
**Fix:** 
1. Double press ESC to edit last message
2. Start a new session
3. Clear Claude Code cache (restart the app)

### Error: "Usage Policy violation"
**Cause:** Content triggered safety filters
**Fix:**
1. Rephrase your request
2. Break complex tasks into smaller parts
3. Avoid sensitive topics

## Quick Recovery Steps

1. **Save your work**
   ```bash
   cd /Users/mac/Downloads/kfar-final/kfar-marketplace-voice
   git add .
   git commit -m "Backup before Claude Code restart"
   ```

2. **Restart Claude Code**
   - Close Claude Code completely
   - Reopen and navigate to project

3. **Resume work**
   - Start with simple commands
   - Gradually build up to complex tasks

## Prevention Tips
- Save work frequently
- Use clear, specific language
- Break large tasks into steps
- Avoid ambiguous requests
