# **Changelog**
All notable changes to this project will be documented in this file.

## **[Unreleased]**
### Added
- Placeholder for upcoming changes.

---

## **[0.7.0] - 2025-03-15**
### **Added**
- **Ownership Embed in Temporary Voice Channel (VC) Text Chat**:
  - When a **temporary VC** is created, an **embed is sent** inside the **built-in text chat** of the VC.
  - The **current owner is mentioned**, with **commands** listed for managing the VC.
  - The embed **automatically updates** when ownership changes.

- **Clickable Slash Commands in VC Info Embed**:
  - The VC management embed now includes **clickable** **slash commands**.
  - Commands included: `/voice rename`, `/voice limit`, `/voice lock`, `/voice unlock`, `/voice hide`, and `/voice show`.
  - **Command IDs are dynamically fetched**, ensuring links remain functional after bot updates.

- **Switched Welcome Images to Local Assets**:
  - The welcome system now **uses locally stored images** instead of external URLs.
  - Prevents **broken links** and improves the **reliability** of welcome messages.

- **YouTube Announcements Now Fully RSS-Based**:
  - **Replaced API calls** with RSS feed checks, **eliminating quota limitations**.
  - The bot now **checks for new videos and livestreams every second** (previously 3–15 minutes).
  - **Both video uploads and livestreams** are detected and announced **instantly**.
  - Ensures **thumbnails are properly displayed**, fixing issues where images were missing from YouTube embeds.

- **AutoBan for Newly Created Accounts** *(Tentative)*:
  - Users with accounts **less than 24 hours old** are **automatically banned upon joining**.
  - **Whitelisted users are exempt** to allow flexibility for trusted accounts.
  - **AutoBan settings can be managed via `/autoban`**, allowing admins to:
    - **Enable/disable** the system.
    - **Adjust minimum account age** (default: 24 hours).
    - **Add/remove users from the whitelist**.
  - **Users are now DM'd before being banned**, providing:
    - A **clear explanation** of the ban reason.
    - Instructions on how to **appeal via bot DMs** if they believe the ban was incorrect.

---

### **Changed**
- **Improved Permission Handling**:
  - **Refactored redundant permission logic** for better efficiency and maintainability.
  - New VC owners **automatically receive** the correct permissions.

- **Delayed VC Deletion**:
  - **Temporary VCs no longer delete instantly** when empty.
  - Now includes a **30-second grace period**, aligning with the **ownership transfer window**.

- **Restricted Meme Triggers in Direct Messages**:
  - Meme triggers (e.g., GIFs, joke responses) **no longer activate in DMs**.
  - **Helpful triggers** (e.g., FAQ-style responses) **still work in DMs**.
  - Improves **user experience** and **prevents unnecessary spam** in private chats.

---

### **Removed**
- **`/voice claim` Command**:
  - Removed as **ownership now transfers automatically** when the original owner leaves.

---

## **[0.6.0] - 2025-03-09**
### **Added**
- **Counting System**:
  - Implemented `/counting` command with subcommands:
    - `/counting channel` → Sets the designated counting channel (admin-only).
    - `/counting toggle` → Enables or disables the counting system (admin-only).
  - Enforced **validation rules**:
    - Users **cannot count consecutively** to prevent self-counting abuse.
    - Automatically **reacts** with ✅ for correct numbers, ❌ for incorrect ones.
    - Sends failure messages with proper user mentions.

- **Status Command**:
  - Added `/status set` to dynamically change the bot's presence.
  - Supported status types: **Playing, Watching, Listening, and Custom (text-only)**.
  - Added `/status clear` to reset the bot’s presence.

- **Interactive Leveling Configuration**:
  - Introduced a **select menu** for modifying leveling settings interactively.
  - Boolean settings toggle instantly upon selection.
  - Numerical settings prompt a **modal** for user input.
  - Reformatted configuration embeds for **better readability**.
  - Improved select menu **labels and descriptions**.

- **Trigger System Expansion**:
  - Added more custom **triggers** for text-based interactions.

---

### **Changed**
- **Counting System Enhancements**:
  - Now dynamically reads the **config file** for real-time updates.
  - Changes to settings **apply instantly** without requiring a bot restart.

- **Bot Status Command Adjustments**:
  - Removed **emoji support** from `/status set` for consistency.
  - Now **only supports text-based** statuses for **better compatibility**.

- **Modal Handling Improvements**:
  - Added **dynamic modal interaction ID support**.
  - Ensured modals with **dynamic IDs are correctly recognized**.
  - Fixed `Unknown Message` errors by ensuring ephemeral interactions persist.

- **Persistent Ephemeral Configuration UI**:
  - Stored ephemeral interactions in `client.ephemeralMessages` for **persistent updates**.
  - Allowed modal submissions to **retrieve and update** the original ephemeral message.
  - Ensured **consistent UI updates** across both select menus and modals.

---

### **Fixed**
- **Counting System Bugs**:
  - Prevented users from **counting twice in a row**.
  - Fixed failure messages to **properly mention users**.

---

## **[0.5.0] - 2025-03-08**
### **Added**
- **Voice Hub System**: Implemented a dynamic **temporary voice channel system**.
  - Users joining a designated hub VC will automatically create a **temporary VC**.
  - Users are moved into their new VC automatically.
  - Channels delete themselves when empty.
  - Owners have management permissions (`rename`, `lock`, `unlock`, `hide`, `show`, `limit`, `claim`).
  - **VC Ownership Transfer**: When an owner disconnects, ownership is transferred after 30 seconds.

- **Voice Commands**:
  - `/voice hide` - Hides the VC from non-members.
  - `/voice show` - Makes the VC visible to everyone.
  - `/voice lock` - Prevents users from joining.
  - `/voice unlock` - Allows users to join.
  - `/voice rename <name>` - Renames the temporary VC.
  - `/voice limit <number>` - Sets a user limit (0-99).
  - `/voice claim` - Allows users to claim an unowned VC.
  - `/voice vc_limit <number>` - Admin command to change the max number of temporary VCs.

- **Leveling System**:
  - **XP tracking**:
    - **Message XP**: Users earn XP for messages, with cooldowns to prevent spam.
    - **Voice XP**: Users earn XP while in voice chat.
    - **Reaction XP**: Users gain XP from adding reactions.
  - **Level Commands**:
    - `/level` - Shows a user’s XP, level, and rank.
    - `/leaderboard` - Displays the top XP holders.
    - `/setxp` - Allows admins to manually adjust XP.
    - `/setlevel` - Allows admins to adjust user levels.
    - `/levels config` - Admin command to modify leveling settings.
    - `/levels reset` - Admin command to reset all XP and levels.
  - **Role Rewards**:
    - Automatically assigns level-based roles.
    - `1st Place` role is given to the highest-level user.
  - **Level-Up Announcements**:
    - Sends a structured embed when users level up.
    - Announces role rewards dynamically.

- **Triggers & Assets**:
  - Added **custom message triggers** for specific phrases.
  - Introduced **image-based** responses for triggers.

- **Twitch & YouTube Integration**:
  - **Live Announcements**:
    - Announces when **tracked Twitch/YouTube streamers** go live.
    - Uses an embed format for clarity.
    - Pings the `content_notifier` role for visibility.
  - **Video Upload Announcements**:
    - Detects new **YouTube video uploads** via RSS.
    - Reduces API usage by **66%** through caching.
  - **Twitch & YouTube Management**:
    - `/twitch add <name>` - Adds a Twitch streamer to tracking.
    - `/twitch remove <name>` - Removes a Twitch streamer from tracking.
    - `/twitch list` - Displays tracked Twitch streamers.
    - `/youtube add <@handle | channel_id>` - Adds a YouTube channel to tracking.
    - `/youtube remove <@handle | channel_id>` - Removes a YouTube channel from tracking.
    - `/youtube list` - Displays tracked YouTube channels.

- **Welcome & Leave Messages**:
  - Sends a **custom embed welcome message** when a new member joins.
  - Sends a **leave message** when someone leaves the server.
  - Uses **server-specific avatars and nicknames**.

---

### **Changed**
- **Voice Hub Permission Handling**:
  - Temporary VCs now inherit permissions from their respective hub.
  - Ensures `@everyone` **can always connect**.
  - **VC Owners** gain `Manage Channels`, `Move Members`, `Mute`, and `Deafen` permissions.
- **Leveling System**:
  - `/setxp` and `/setlevel` now trigger **level-up messages** and **role rewards** dynamically.
  - **Leaderboard & Level Commands** now use **mentions (`<@id>`)** instead of plain text usernames.
  - Updated `/leaderboard` to **display server-specific nicknames**.
- **Twitch & YouTube Announcements**:
  - Unifies YouTube/Twitch announcement formatting for **consistent embeds**.
  - Role pings are now configurable in `config.json`.
- **Optimizations**:
  - Reduced **YouTube API usage** by switching to RSS tracking.
  - Improved **reaction XP processing** to handle old messages.

---

### **Fixed**
- **Voice Hub Bugs**:
  - Ensured `@everyone` **can always connect** to temporary VCs.
  - Dynamically loads `temp_vcs.json` to prevent crashes if missing.
  - Properly **tracks VC ownership** to avoid incorrect ownership assignments.
- **Leveling System Bugs**:
  - Fixed **XP loss** when users were deafened or server-muted.
  - Prevented **bots from gaining XP**.
  - Corrected **First Place Role** assignment logic.
- **Triggers**:
  - Ensured **only one trigger** executes per message.
  - Fixed **partial word matches** (e.g., "hi" in "this" triggering responses).
- **Twitch/YouTube**:
  - Prevented **duplicate stream/video announcements**.
  - Improved **handle detection** for YouTube tracking.

---

## **[0.4.0] - 2025-03-06** _(Backfilled)_
### **Added**
- **YouTube & Twitch Announcements**
- **Initial Leveling System**:
  - `/level`, `/leaderboard`, `/setxp`
  - Message XP and Level-Up Announcements

### **Changed**
- Improved **XP scaling** for a better leveling curve.
- Unified **YouTube/Twitch live tracking**.

---

## **[0.3.0] - 2025-03-06** _(Backfilled)_
### **Added**
- **Message XP System**
- **Basic YouTube Video Tracking**
- **Welcome Message System**

---

## **[0.2.0] - 2025-03-06** _(Backfilled)_
### **Added**
- **Twitch Live Announcements**
- **Customizable Role Pings for Content Notifications**

---

## **[0.1.0] - 2025-03-06** _(Backfilled)_
### **Added**
- **Project Initialization**
- **Basic Slash Command Framework**
