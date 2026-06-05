import { setupCompilerTriggers } from '../utils/events.js';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'guide';

let compiledCode = {
  guide: '',
  diagrams: '',
  cheatsheet: '',
  qa_scenarios: '',
  cicd: ''
};

// Command Database
const gitCommands = {
  "init": {
    "name": "git init",
    "def": "Initializes a brand new, empty local Git repository in the current working directory, creating a hidden `.git` folder.",
    "why": "It is the starting point for version controlling any project. It sets up tracking metadata, object databases, and reference logs locally.",
    "scenarios": {
      "devops": "Setting up a local Infrastructure-as-Code repository containing Ansible roles or Terraform modules before configuring a GitLab remote pipeline link.",
      "developer": "Starting a new node-express REST API repository locally and initiating version tracking before write-up.",
      "ai_engineer": "Initializing a workspace for training configurations, python loaders, and model evaluation modules.",
      "ai_studio": "Creating a repository to version prompt books, parameters presets, and model fine-tuning run schedules."
    },
    "examples": "# Initialize a repository\ngit init\n\n# Initialize with a default branch name 'main'\ngit init -b main",
    "mistakes": "Running `git init` inside an active subdirectory that is already being tracked by a parent repository. This creates nested repository issues.",
    "practices": "Run `git init` on your root project folder and immediately write a `.gitignore` to keep binary dependencies and credentials local."
  },
  "clone": {
    "name": "git clone",
    "def": "Copies an existing remote Git repository locally, sets up remote-tracking branches, and checks out the default branch.",
    "why": "Downloads codebase history and registers a connection mapping to the upstream provider (origin) so push and pull configurations function out-of-the-box.",
    "scenarios": {
      "devops": "Cloning a remote configuration repository containing Kubernetes templates on a CD runner server.",
      "developer": "Downloading the shared repository to start implementing a feature request task.",
      "ai_engineer": "Cloning an open-source model repository from Hugging Face or GitHub to inspect its network weights loader code.",
      "ai_studio": "Downloading prompt templates and model pipelines from a central Azure Repos workspace to evaluate prompts locally."
    },
    "examples": "# Clone repository via HTTPS\ngit clone https://github.com/user/project.git\n\n# Clone via SSH\ngit clone git@github.com:user/project.git\n\n# Shallow clone (only fetch the latest commit to save bandwidth in CI/CD)\ngit clone --depth 1 https://github.com/user/project.git",
    "mistakes": "Cloning huge repositories containing gigabytes of binary weight assets or database backups without configuring Git LFS first.",
    "practices": "Use `--depth 1` for automated script runners and pipelines when full version history is not needed to build/test images."
  },
  "status": {
    "name": "git status",
    "def": "Displays the status of the working tree, showing modified, untracked, and staged files.",
    "why": "Informs you what files will be included in the next commit and checks for conflicts or branch divergence status.",
    "scenarios": {
      "devops": "Verifying that local cloud credentials or env variables have not been placed in tracked folders.",
      "developer": "Checking which source components were changed before staging code.",
      "ai_engineer": "Verifying that local training artifacts, weights, or logs are excluded.",
      "ai_studio": "Checking if prompt text files are modified or staged."
    },
    "examples": "# Check status\ngit status\n\n# Show status in short format\ngit status -s",
    "mistakes": "Committing changes without checking `git status`, resulting in committing temporary files or IDE folders.",
    "practices": "Run `git status` before every add, commit, or branch checkout to understand current modifications."
  },
  "add": {
    "name": "git add",
    "def": "Stages modified, deleted, or untracked files in the indexing area, preparing them for a commit.",
    "why": "Allows selective version tracking. You can pick exact files (or hunks of files) to be captured in the next snapshot.",
    "scenarios": {
      "devops": "Adding a corrected helm values yaml file while leaving raw local tests unstaged.",
      "developer": "Staging code files that correspond strictly to the feature under development.",
      "ai_engineer": "Staging modifications made to the training scripts, skipping log outputs.",
      "ai_studio": "Staging only verified prompt JSON schema descriptors."
    },
    "examples": "# Stage a specific file\ngit add kubernetes/service.yaml\n\n# Stage all files in current folder\ngit add .\n\n# Interactive staging (allows staging specific hunks of changes within a file)\ngit add -p",
    "mistakes": "Running `git add .` blindly and accidental upload of keys, local databases, or huge binary logs.",
    "practices": "Use `git add -p` to review code hunks individually before staging, ensuring only clean and intended updates are staged."
  },
  "commit": {
    "name": "git commit",
    "def": "Saves a permanent snapshot of staged changes into the local repository's history with a descriptive message.",
    "why": "Records a specific milestone in development history, generating a unique SHA-1 hash identifier.",
    "scenarios": {
      "devops": "Committing deployment updates linked to a specific JIRA ticket or release tag.",
      "developer": "Creating a clean commit implementing input form validation.",
      "ai_engineer": "Committing weight updates or training config modifications.",
      "ai_studio": "Recording a prompt configuration adjustment after testing user validation runs."
    },
    "examples": "# Commit staged changes with message\ngit commit -m \"feat(auth): integrate OAuth validation\"\n\n# Stage and commit in a single step (only targets tracked files)\ngit commit -am \"fix(ci): fix port mapping\"\n\n# Amend the last commit (message or staged files)\ngit commit --amend -m \"feat(auth): integrate OAuth and API key validation\"",
    "mistakes": "Writing ambiguous, unhelpful commit messages like 'fixed stuff', 'test', or 'updates'.",
    "practices": "Write commits in the imperative mood (e.g. 'Add schema' vs 'Added schema') and use Conventional Commits (feat, fix, docs, chore, ci)."
  },
  "push": {
    "name": "git push",
    "def": "Uploads local repository commits to a remote repository branch, aligning the remote ref tracking points.",
    "why": "Publishes work to team repositories to share changes or trigger automated cloud build runners.",
    "scenarios": {
      "devops": "Pushing main updates to deploy terraform code instantly through CD pipelines.",
      "developer": "Pushing a feature branch to GitHub to open a Pull Request (PR).",
      "ai_engineer": "Pushing model validation code to trigger remote GPU training.",
      "ai_studio": "Syncing optimized templates to upstream catalog endpoints."
    },
    "examples": "# Push local commits on main to origin remote main branch\ngit push origin main\n\n# Push and set remote tracking branch (used for new local branches)\ngit push -u origin feature-branch-name\n\n# Force push with safety lease validation\ngit push --force-with-lease origin main",
    "mistakes": "Executing plain `git push --force` on shared main or release branches, erasing teammates' commits.",
    "practices": "Always configure branch protection on remotes to prevent direct forced pushes to main, and use `--force-with-lease` when rebasing."
  },
  "pull": {
    "name": "git pull",
    "def": "Fetches commits from the remote repository and immediately merges them into the current active branch.",
    "why": "Synchronizes local repository with remote modifications, keeping files current.",
    "scenarios": {
      "devops": "Fetching and merging recent cluster configurations before launching updates.",
      "developer": "Pulling teammate branch fixes to integrate locally.",
      "ai_engineer": "Pulling the latest dataset downloader modules updated by datasets teams.",
      "ai_studio": "Synchronizing prompts modifications made by prompt validators."
    },
    "examples": "# Pull changes and merge\ngit pull origin main\n\n# Pull changes and rebase local commits on top of them (Recommended)\ngit pull --rebase origin main",
    "mistakes": "Running `git pull` while holding uncommitted local work, leading to merge commits and untidy histories.",
    "practices": "Use `git pull --rebase` to avoid merge commits, keeping commit histories flat and clean."
  },
  "fetch": {
    "name": "git fetch",
    "def": "Downloads commit histories, tags, and branches from remote repository database without modifying local workspace files.",
    "why": "Inspects upstream state without modifying active work. Allows comparing differences safely.",
    "scenarios": {
      "devops": "Fetching repository status to verify target branch states before automated runners execute.",
      "developer": "Checking what changes a teammate pushed before deciding to pull or merge.",
      "ai_engineer": "Checking if any new training tags or model version tags exist on remote.",
      "ai_studio": "Fetching remote prompt variations without interrupting current local edits."
    },
    "examples": "# Fetch all remote changes\ngit fetch --all\n\n# Fetch origin updates and prune dead remote branch refs locally\ngit fetch --prune",
    "mistakes": "Expecting `git fetch` to immediately update your local files (fetch only downloads database references, merge or pull is needed to apply).",
    "practices": "Regularly fetch with `--prune` to clean up local references to deleted remote branches."
  },
  "log": {
    "name": "git log",
    "def": "Displays commit history, mapping metadata, commit hash, date, author, and description messages.",
    "why": "Enables historical audits, regression tracing, and author tracking.",
    "scenarios": {
      "devops": "Locating which specific deploy commit broke container health states.",
      "developer": "Reviewing what code modifications were added during the week.",
      "ai_engineer": "Finding the commit when training epochs were adjusted.",
      "ai_studio": "Auditing prompt version logs to see what message layouts were previously deployed."
    },
    "examples": "# Standard log list\ngit log\n\n# Oneline visual tree mapping\ngit log --oneline --graph --decorate --all\n\n# Search commits by commit message keyword\ngit log --grep=\"database\"",
    "mistakes": "Wasting time scrolling through thousands of lines of logs without filters when searching for a specific change.",
    "practices": "Learn log filters (like `--author`, `--grep`, or `--since`) to find targeted history snapshots quickly."
  },
  "diff": {
    "name": "git diff",
    "def": "Compares modifications between different commits, staging area, branch paths, or files in directory workspace.",
    "why": "Inspects line-by-line additions and deletions before saving commits or checking code.",
    "scenarios": {
      "devops": "Diffing Docker files against latest repo versions to verify port mappings.",
      "developer": "Scanning changes in components before staging for commit.",
      "ai_engineer": "Verifying neural net layer structure alterations before training.",
      "ai_studio": "Diffing variables syntax in custom templates before push."
    },
    "examples": "# Compare working directory against unstaged changes\ngit diff\n\n# Compare staged changes against last commit\ngit diff --staged\n\n# Compare two different branch states\ngit diff main..feature-branch",
    "mistakes": "Committing changes without running `git diff --staged` to double-check exactly what lines of code are being saved.",
    "practices": "Use side-by-side IDE diff layouts to quickly scan modifications before staging."
  },
  "branch": {
    "name": "git branch",
    "def": "Manages local branches (lists, creates, renames, or deletes branch targets).",
    "why": "Provides isolated workspaces where features can be developed safely without affecting the main production code.",
    "scenarios": {
      "devops": "Creating a target hotfix branch to patch an live Nginx configuration.",
      "developer": "Creating a feature branch to write API components.",
      "ai_engineer": "Branching the project to experiment with alternative training parameters.",
      "ai_studio": "Creating a branch to test alternative prompt structure prompts."
    },
    "examples": "# List local branches\ngit branch\n\n# Create new branch\ngit branch feature-login\n\n# Delete local branch (only if merged)\ngit branch -d feature-login\n\n# Rename active branch\ngit branch -m new-branch-name",
    "mistakes": "Deleting a branch with unmerged code, resulting in losing work unless you use `git reflog` to recover.",
    "practices": "Delete branch pointers locally after PR merge completes to keep workspace tidy."
  },
  "checkout": {
    "name": "git checkout",
    "def": "Switches branch targets or restores working tree files back to a specific commit state.",
    "why": "Allows traversing between code branches or restoring files to undo local mistakes.",
    "scenarios": {
      "devops": "Checking out a previous deployment tag to isolate a pipeline bug.",
      "developer": "Swapping branches to test a feature branch.",
      "ai_engineer": "Checking out model code corresponding to a previous training experiment.",
      "ai_studio": "Swapping between baseline and experimental prompt trees."
    },
    "examples": "# Switch to branch\ngit checkout main\n\n# Create and switch to new branch\ngit checkout -b feature-test\n\n# Discard changes in a specific file in the workspace\ngit checkout -- src/main.js",
    "mistakes": "Accidentally running `git checkout -- .` and permanently erasing all unstaged local file changes.",
    "practices": "Prefer using modern commands `git switch` and `git restore` to avoid checkout overloading confusion."
  },
  "switch": {
    "name": "git switch",
    "def": "Safely switches target branches, separating branch navigation from file restoration.",
    "why": "Reduces risk of file data loss. Designed specifically for swapping branches safely.",
    "scenarios": {
      "devops": "Swapping local paths from development branch to hotfix branch.",
      "developer": "Switching branches to implement a code review request.",
      "ai_engineer": "Swapping branches to baseline code.",
      "ai_studio": "Swapping branches to verify prompt parameters."
    },
    "examples": "# Switch to branch\ngit switch main\n\n# Create and switch to new branch\ngit switch -c feature-name",
    "mistakes": "Using `git switch` with unsaved conflicting changes. Git blocks this, which prevents code overwriting.",
    "practices": "Always use `git switch` instead of `checkout` for branch traversal in new Git environments."
  },
  "merge": {
    "name": "git merge",
    "def": "Integrates commit history of another branch into the current checked-out branch.",
    "why": "Brings independent features together back into primary pipelines (e.g. main/develop).",
    "scenarios": {
      "devops": "Merging stable deploy patches into staging branches.",
      "developer": "Merging feature branch into local main branch.",
      "ai_engineer": "Merging model training enhancements into the main code branch.",
      "ai_studio": "Merging verified system prompt variations into releases."
    },
    "examples": "# Merge feature branch into active branch\ngit merge feature-branch-name\n\n# Force a merge commit even if fast-forward is possible (maintains branch context)\ngit merge --no-ff feature-branch-name",
    "mistakes": "Merging the wrong branch path without checking what changes are inside, generating messy merge commits.",
    "practices": "Pull the latest target branch changes before merging to deal with conflicts locally first."
  },
  "rebase": {
    "name": "git rebase",
    "def": "Re-applies local commits on top of another base tip, rewriting commit history linear-style.",
    "why": "Provides a clean, linear commit graph by removing unnecessary merge commits.",
    "scenarios": {
      "devops": "Rebasing local config updates on top of team updates before trigger deploy run.",
      "developer": "Rebasing a feature branch on top of origin/main to keep local changes up-to-date.",
      "ai_engineer": "Rebasing experimental pipeline commits to clean up history before final merge.",
      "ai_studio": "Rebasing prompt development histories before merging."
    },
    "examples": "# Rebase current branch on main\ngit rebase main\n\n# Continue rebase after conflict resolution\ngit rebase --continue\n\n# Abort rebase process completely\ngit rebase --abort",
    "mistakes": "Rebasing public shared commits. This rewrites public history, breaking other developers' branch checkouts.",
    "practices": "Never rebase commits that have been pushed to public repositories. Rebase only local commits."
  },
  "cherry_pick": {
    "name": "git cherry-pick",
    "def": "Applies the changes introduced by a specific commit from another branch as a new commit on the active branch.",
    "why": "Allows copying a single bugfix or commit without merging the entire target branch.",
    "scenarios": {
      "devops": "Applying an urgent Dockerfile hotfix commit from a staging branch onto the production branch.",
      "developer": "Pulling a single utility class commit from a teammate's feature branch.",
      "ai_engineer": "Extracting a training fix commit into the active training branch.",
      "ai_studio": "Copying a prompt refinement commit into the main template catalog."
    },
    "examples": "# Cherry-pick a specific commit by hash\ngit cherry-pick a1b2c3d4\n\n# Continue cherry-pick after resolving conflicts\ngit cherry-pick --continue\n\n# Abort cherry-pick process\ngit cherry-pick --abort",
    "mistakes": "Cherry-picking multiple commits manually when a branch merge or rebase would be much cleaner.",
    "practices": "Use cherry-pick mostly for hotfixes or backporting changes between release branches."
  },
  "stash": {
    "name": "git stash",
    "def": "Temporarily shelves local uncommitted changes, leaving your working directory clean.",
    "why": "Allows you to switch branches or perform pull/fetch actions without committing incomplete work.",
    "scenarios": {
      "devops": "Stashing live deploy manifest modifications to test an urgent hotfix change.",
      "developer": "Stashing incomplete feature work to address an immediate production bug.",
      "ai_engineer": "Shelving training experiment code to fix a bug in the evaluation script.",
      "ai_studio": "Shelving prompt tweaks to check out and test a main prompt release."
    },
    "examples": "# Save local changes to stash\ngit stash\n\n# Save stash with a descriptive label\ngit stash save \"working on auth validation\"\n\n# List saved stashes\ngit stash list\n\n# Pop (apply and delete) the latest stash\ngit stash pop\n\n# Stash including untracked files\ngit stash -u",
    "mistakes": "Stashing changes, leaving them for weeks, and forgetting they exist, creating messy conflicts when popped later.",
    "practices": "Give stashes descriptive names and pop/clear them regularly to avoid accumulation."
  },
  "tagging": {
    "name": "git tag",
    "def": "Creates reference pointers to specific commits in history, marking them as release milestones.",
    "why": "Marks specific software releases (e.g. v1.0.0) so they can be identified, deployed, or referenced easily.",
    "scenarios": {
      "devops": "Tagging a release commit with v1.2.0 to trigger an automated production container build.",
      "developer": "Tagging stable build milestones for release management.",
      "ai_engineer": "Tagging model training code corresponding to an artifact release (e.g., `v2.1-llama-tune`).",
      "ai_studio": "Tagging a certified prompt system version (e.g., `v1.0-prod-prompt`)."
    },
    "examples": "# Create annotated tag\ngit tag -a v1.0.0 -m \"Release version 1.0.0\"\n\n# Push tag to remote origin\ngit push origin v1.0.0\n\n# Push all tags to remote origin\ngit push origin --tags",
    "mistakes": "Creating lightweight tags without annotations (`git tag v1.0`), which lacks creation metadata like date and author.",
    "practices": "Always use annotated tags (`-a`) for releases and follow semantic versioning rules (SemVer)."
  },
  "reset": {
    "name": "git reset",
    "def": "Resets the active branch HEAD to a specific commit state, modifying index or working tree according to flags.",
    "why": "Undoes local commits, unstages staged changes, or discards all modifications back to a known stable point.",
    "scenarios": {
      "devops": "Resetting staging configurations to clean up local testing states.",
      "developer": "Undoing a local commit that was made by mistake.",
      "ai_engineer": "Discarding an experimental neural network tweak that caused training loss divergence.",
      "ai_studio": "Resetting the prompt testing workspace to a baseline commit."
    },
    "examples": "# Soft reset: undo commit, keep changes staged in index\ngit reset --soft HEAD~1\n\n# Mixed reset (default): undo commit and unstage, keep files in directory\ngit reset HEAD~1\n\n# Hard reset: undo commit, unstage, and discard all changes in directory (Destructive!)\ngit reset --hard HEAD~1",
    "mistakes": "Running `git reset --hard` when you have unsaved modifications in the directory, deleting them permanently.",
    "practices": "Use `--hard` with extreme caution. Check `git status` first to ensure no valuable uncommitted changes are lost."
  },
  "revert": {
    "name": "git revert",
    "def": "Creates a new commit that applies the exact inverse changes of a target commit.",
    "why": "Safely undoes changes on public, shared branches because it does not rewrite history (unlike reset).",
    "scenarios": {
      "devops": "Reverting a broken production manifest commit on main to quickly restore app health.",
      "developer": "Undoing a bug-introducing PR commit after merging it into the develop branch.",
      "ai_engineer": "Undoing an update that introduced library conflicts in standard workspaces.",
      "ai_studio": "Reverting an accidental change in a shared system prompt catalog."
    },
    "examples": "# Revert a specific commit by hash\ngit revert a1b2c3d4\n\n# Revert without auto-committing immediately\ngit revert -n a1b2c3d4",
    "mistakes": "Using `git reset` on public branches instead of `git revert`, splitting histories and confusing teammates.",
    "practices": "Always use `revert` for undoing pushed history; reserve `reset` for local, unpublished commits."
  }
};

// ASCII Diagrams Database
const asciiDiagrams = {
  branch: `=== Branch Creation Flow ===

main:      [C1] -------> [C2] (main branch pointer)
                           \\
feature:                    [C3] (new branch created at commit C2)

Commands:
$ git branch feature-login
$ git switch feature-login`,

  merge: `=== Branch Merge Process ===

Fast-Forward Merge:
main:      [C1] ---> [C2]
                       \\
feature:                [C3] ---> [C4]
Merge result (Fast-forward, main pointer moves to C4):
main/feat: [C1] ---> [C2] ---> [C3] ---> [C4]

Three-Way Merge (Creates Merge Commit when histories diverge):
main:      [C1] ---> [C2] ----------> [C4] (main)
                       \\               /
feature:                [C3] ---> [C5] (feature)
                                       ^
                                 Merge Commit [C6] (contains changes from C4 & C5)

Commands:
$ git switch main
$ git merge feature-login`,

  rebase: `=== Rebase Process (Rewrites history for a clean linear path) ===

Before Rebase:
main:    [C1] ---> [C2] ---> [C3] (main)
                     \\
feature:              [C4] ---> [C5] (feature)

After Rebase ($ git switch feature && git rebase main):
main:    [C1] ---> [C2] ---> [C3] (main)
                               \\
feature:                        [C4'] ---> [C5'] (re-applied commits, new hashes)`,

  cherry: `=== Cherry-Pick Process (Copying specific commit) ===

Source Branch (dev):
dev:     [D1] ---> [D2] ---> [D3] (isolated fix commit)

Target Branch (main):
main:    [M1] ---> [M2]
                   \\
             (cherry-pick D3) ---> [D3'] (exact duplicate change on main, new hash)

Commands:
$ git switch main
$ git cherry-pick D3`,

  conflict: `=== Conflict Resolution Flow ===

State: Both branches modified the same line in a file.

Your Branch (HEAD)                  Incoming Branch
<<<<<<< HEAD                        =======
replicaCount: 5                     replicaCount: 3
=======                             >>>>>>> feature-scaling
replicaCount: 3
>>>>>>> feature-scaling

Steps to Resolve:
1. Open file, examine markers.
2. Edit file to keep the correct line (e.g. replicaCount: 5).
3. Remove conflict markers (<<<<<<<, =======, >>>>>>>).
4. Run:
   $ git add <file>
   $ git commit -m "fix: resolve scale conflict"`
};

// 25 Interview Q&As
const interviewQA = [
  {
    q: "What is the difference between Git and GitHub?",
    a: "Git is a local, open-source distributed version control tool used to track changes. GitHub is a web-based hosting service that stores Git repositories online and adds collaborative tools like Pull Requests, issues, and CI/CD pipelines."
  },
  {
    q: "What is the staging area (index) in Git?",
    a: "The staging area is a middle-ground file index that tracks changes prepared to be saved in the next commit. It allows developers to selectively stage files and hunk modifications instead of saving all modifications at once."
  },
  {
    q: "Explain the difference between git merge and git rebase.",
    a: "Git merge joins branch history with a merge commit, preserving chronological order and branch identities. Git rebase moves local commits on top of another base commit, rewriting history to produce a linear graph without merge commits."
  },
  {
    q: "What is a detached HEAD state and how do you resolve it?",
    a: "A detached HEAD state occurs when Git HEAD points to a specific commit hash rather than a branch pointer. To resolve and save changes, run: `git switch -c new-branch-name` to create a branch tracking those changes."
  },
  {
    q: "What is git reflog and when is it used?",
    a: "Reflog records changes to branch pointers and HEAD references locally. It keeps track of deleted commits, resets, and rebases. Use it to recover lost commits or branch states by finding hashes and running `git reset --hard <hash>`."
  },
  {
    q: "Explain git reset --soft, --mixed, and --hard.",
    a: "--soft undoes commits but keeps changes staged in index. --mixed (default) undoes commits and unstages changes, keeping files in working directory. --hard undoes commits, unstages changes, and permanently erases all modifications in the directory."
  },
  {
    q: "How does git revert differ from git reset?",
    a: "Git reset rewrites history by moving branch pointers backwards (safest for unpublished commits). Git revert creates a new commit containing the inverse changes of a targeted commit, leaving previous history intact (safest for published branches)."
  },
  {
    q: "Explain the difference between git pull and git fetch.",
    a: "Git fetch downloads remote metadata, commit files, and refs without merging or altering your local workspace. Git pull does a git fetch followed by a git merge, immediately modifying active working files."
  },
  {
    q: "What is git cherry-pick?",
    a: "It is a command used to copy a specific commit by hash from another branch and apply it as a new commit on the active branch, leaving other commits in the source branch behind."
  },
  {
    q: "What is Git Stash and when should you use it?",
    a: "Stash is a temporary stack that stores modified tracked and untracked files. Use it when you need to switch tasks, pull updates, or change branches quickly without creating incomplete commits."
  },
  {
    q: "What is a fast-forward merge?",
    a: "A fast-forward merge occurs when the target branch has no new commits since the source branch split. Git simply moves the target branch pointer forward to the tip of the source branch without creating a merge commit."
  },
  {
    q: "How do you resolve merge conflicts?",
    a: "Locate conflicted files via `git status`, open files to inspect conflict markers, edit files to choose which changes to keep, delete the markers, stage the resolved files with `git add`, and run `git commit`."
  },
  {
    q: "What are Git hooks?",
    a: "Git hooks are custom scripts located in `.git/hooks/` that run automatically in response to Git life cycle actions, such as pre-commit validation, post-merge updates, or commit-msg formatting checks."
  },
  {
    q: "What is the difference between lightweight and annotated tags?",
    a: "A lightweight tag is a simple pointer to a specific commit. An annotated tag is stored as a full object in the Git database, containing the author, date, message, and cryptographic signature."
  },
  {
    q: "How do you configure line endings in Git across OS platforms?",
    a: "Use the `core.autocrlf` setting. On Windows, configure `git config --global core.autocrlf true` (converts LF to CRLF on checkout, and vice versa). On Mac/Linux, set `core.autocrlf input`."
  },
  {
    q: "What is a Pull Request (PR) or Merge Request (MR)?",
    a: "A PR/MR is a proposal hosted on platforms like GitHub or GitLab that allows developers to review code changes on a feature branch before they are merged into the default branch."
  },
  {
    q: "What is Git LFS (Large File Storage)?",
    a: "An extension that replaces large files (like datasets or binaries) with text pointers inside Git commits, storing the actual file content on an external cloud server to prevent cloning bloat."
  },
  {
    q: "What is Trunk-Based Development?",
    a: "A branching strategy where all developers commit frequently to a single branch ('trunk' or main), utilizing short-lived branches and feature flags to keep codebase integration continuous."
  },
  {
    q: "Explain the GitFlow branching workflow.",
    a: "An enterprise branching model featuring long-running `main` (production-ready) and `develop` (integration) branches, and short-lived `feature`, `release`, and `hotfix` branches."
  },
  {
    q: "How can you rename a local branch?",
    a: "Run `git branch -m <old-name> <new-name>`. If you are currently checked out on the branch you want to rename, run `git branch -m <new-name>`."
  },
  {
    q: "How do you delete a remote branch?",
    a: "Run `git push origin --delete <branch-name>` to remove the branch pointer from the remote repository host."
  },
  {
    q: "What is the Forking workflow?",
    a: "A workflow where developers copy a main repository to their own remote account (fork), push changes to their fork, and open a Pull Request to merge back into the main upstream repository."
  },
  {
    q: "How do you squash commits during a merge?",
    a: "Use `git merge --squash <branch>` to combine all feature commits into a single commit upon merge, or use interactive rebase `git rebase -i` to combine commits beforehand."
  },
  {
    q: "What is git blame and how is it used?",
    a: "Displays line-by-line commit information for a file, showing who modified each line, in which commit, and when, helpful for finding who to ask about a line of code."
  },
  {
    q: "How do you search commit messages for a specific string?",
    a: "Run `git log --grep=\"search-term\"` to search and display matching commits in the repository history."
  }
];

// 20 Troubleshooting Scenarios
const troubleshootingScenarios = [
  {
    title: "1. Committed sensitive files (passwords, keys) by mistake",
    steps: "1. Stop pushing immediately!\n2. Run: `git rm --cached path/to/secret.env` to unstage.\n3. Add the file to `.gitignore`.\n4. Commit the deletion: `git commit --amend`.\n5. If already pushed, use BFG Repo-Cleaner or `git-filter-repo` to wipe it from git history history database."
  },
  {
    title: "2. Committed changes to the wrong branch (e.g. main instead of feature)",
    steps: "If you haven't pushed yet:\n1. Create a new branch with your commits: `git branch feature-work`\n2. Reset main back to the remote state: `git reset --hard origin/main`\n3. Switch branch to work: `git switch feature-work`"
  },
  {
    title: "3. Need to modify the commit message of the most recent commit",
    steps: "Run: `git commit --amend -m \"new message\"`\nNote: If you have already pushed, you will need to push with `--force-with-lease`."
  },
  {
    title: "4. Need to modify the commit message of an older commit",
    steps: "1. Run interactive rebase targeting the parent of the commit: `git rebase -i HEAD~5`\n2. Change 'pick' to 'reword' next to the targeted commit.\n3. Save and close the editor, then write the new message when prompted."
  },
  {
    title: "5. Accidentally deleted a local branch that was not merged",
    steps: "1. Find the commit hash using reflog: `git reflog`\n2. Identify the last commit on the deleted branch.\n3. Restore it: `git branch <branch-name> <commit-hash>`"
  },
  {
    title: "6. Need to undo a git reset --hard command",
    steps: "1. Run `git reflog` to locate the commit hash before the reset.\n2. Run `git reset --hard <previous-commit-hash>` to restore files."
  },
  {
    title: "7. Merge conflicts in binary files (e.g. images, PDFs)",
    steps: "Git cannot merge binary files. Decide which version to keep:\nKeep yours: `git checkout --ours path/to/file.png`\nKeep theirs: `git checkout --theirs path/to/file.png`\nFollow with `git add` and `git commit`."
  },
  {
    title: "8. Checked out a remote branch but it's not updating locally",
    steps: "1. Run `git fetch origin` to sync references.\n2. Switch and track: `git switch -t origin/branch-name` or `git checkout --track origin/branch-name`."
  },
  {
    title: "9. Diverged branches error when pushing",
    steps: "Your local and remote branch have diverged. Run:\n1. `git pull --rebase origin <branch-name>` to fetch remote and reapply local commits on top.\n2. Resolve any conflicts, run `git rebase --continue`, and push."
  },
  {
    title: "10. Submodule directory is empty after cloning a project",
    steps: "Run: `git submodule update --init --recursive` to pull submodule contents."
  },
  {
    title: "11. Git commands are slow in a massive repository",
    steps: "1. Enable Git index cache: `git config core.untrackedCache true`\n2. Enable filesystem monitor: `git config core.fsmonitor true`\n3. Run garbage collection: `git gc --prune=now`."
  },
  {
    title: "12. Accidentally modified files on main and want to move them to a feature branch",
    steps: "If changes are uncommitted:\n1. Stash changes: `git stash`\n2. Create and swap branch: `git switch -c feature-new`\n3. Retrieve changes: `git stash pop`"
  },
  {
    title: "13. Local branch is out of sync with a forced-pushed remote branch",
    steps: "1. Fetch upstream changes: `git fetch origin`\n2. Overwrite local branch: `git reset --hard origin/<branch-name>`"
  },
  {
    title: "14. Pulling from remote fails with 'refusing to merge unrelated histories'",
    steps: "Occurs when two repositories have different commit histories. If merging is safe, run:\n`git pull origin main --allow-unrelated-histories`"
  },
  {
    title: "15. Accidentally staged a massive folder (like node_modules or venv)",
    steps: "1. Unstage the files: `git reset HEAD path/to/folder/`\n2. Append the path to `.gitignore` to avoid future staging."
  },
  {
    title: "16. Want to delete a commit from remote branch entirely",
    steps: "1. Reset local branch: `git reset --hard HEAD~1` (removes 1 commit)\n2. Force push: `git push --force-with-lease origin <branch>`"
  },
  {
    title: "17. Local modifications are being overwritten by pull",
    steps: "1. Stash changes: `git stash`\n2. Pull: `git pull`\n3. Pop stash: `git stash pop` and resolve conflicts if any."
  },
  {
    title: "18. Want to cherry-pick a commit but resolve conflicts",
    steps: "1. Start: `git cherry-pick <hash>`\n2. Open files to resolve conflicts, remove markers.\n3. Add files: `git add .`\n4. Complete: `git cherry-pick --continue`"
  },
  {
    title: "19. Keep getting credentials prompts on every push/pull",
    steps: "Set credential helper cache:\nWindows: `git config --global credential.helper manager`\nMac/Linux: `git config --global credential.helper cache`"
  },
  {
    title: "20. Want to check out a specific file from a different branch",
    steps: "Run: `git checkout <other-branch-name> -- path/to/file.txt`"
  }
];

// 15 Common Errors
const commonErrors = [
  {
    err: "fatal: not a git repository (or any of the parent directories)",
    fix: "You are running Git commands outside a tracked directory. Run `git init` to initialize a new repository, or `cd` into an existing repository folder."
  },
  {
    err: "error: failed to push some refs to...",
    fix: "The remote contains commits you don't have locally. Pull updates first using `git pull --rebase origin <branch>`, resolve conflicts, then push."
  },
  {
    err: "fatal: refusing to merge unrelated histories",
    fix: "Occurs when pulling from a repository that was created independently. Force the merge via `git pull origin main --allow-unrelated-histories`."
  },
  {
    err: "error: Your local changes to the following files would be overwritten by merge",
    fix: "You have uncommitted modifications. Run `git stash` to shelve them, pull/merge changes, then restore via `git stash pop`."
  },
  {
    err: "fatal: A branch named '...' already exists.",
    fix: "The branch name is already in use locally. Choose a different name, delete the old branch (`git branch -d <name>`), or use `git switch`."
  },
  {
    err: "error: pathspec '...' did not match any file(s) known to git",
    fix: "You misspelled a branch/file name, or referenced a file that hasn't been added yet. Double-check name spelling or run `git fetch`."
  },
  {
    err: "warning: LF will be replaced by CRLF in ...",
    fix: "A cross-platform line ending mismatch warning. Correct this by setting line ending configuration: `git config --global core.autocrlf true`."
  },
  {
    err: "fatal: The remote end hung up unexpectedly",
    fix: "Bandwidth limits or network dropouts. Increase git buffer size: `git config --global http.postBuffer 1572864000` (1.5GB buffer)."
  },
  {
    err: "fatal: port 22: Connection timed out",
    fix: "SSH port blocked by firewall. Switch SSH remote mapping to HTTPS: `git remote set-url origin https://github.com/user/repo.git`."
  },
  {
    err: "error: cannot check out branch '...' because of uncommitted changes",
    fix: "Swapping branches would overwrite your uncommitted edits. Stash changes: `git stash`, switch branches, then apply: `git stash pop`."
  },
  {
    err: "fatal: remote origin already exists.",
    fix: "The remote destination origin name is already mapped. Update it via: `git remote set-url origin <new-url>` or remove it first: `git remote remove origin`."
  },
  {
    err: "error: commit '...' is a merge commit but no -m option was given",
    fix: "Cherry-picking a merge commit. You must specify which parent commit to track: `git cherry-pick -m 1 <commit-hash>`."
  },
  {
    err: "fatal: Cannot do a soft reset in the middle of a merge",
    fix: "You are resetting during a conflict merge. Abort the merge first: `git merge --abort`, then proceed with the soft reset."
  },
  {
    err: "error: switch '...' is incompatible with '...'",
    fix: "You are combining conflicting command parameters. Simplify the command, check syntax, or check help via `git switch --help`."
  },
  {
    err: "error: gpg failed to sign the data",
    fix: "GPG signature signing key is expired or missing in your shell profile. Verify key list: `gpg --list-secret-keys` and set `export GPG_TTY=$(tty)`."
  }
];

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
  initTerminalSandbox();
});

function setupInteractiveListeners() {
  setupCompilerTriggers(triggerCompileAll);
}

// Global compiler function
function triggerCompileAll() {
  const audience = $('target_audience').value;
  const workflow = $('git_workflow').value;
  const platform = $('git_platform').value;
  const detail = $('detail_level').value;

  const secretsOpt = $('secret_scanning').checked;
  const commitLintOpt = $('linting_policies').checked;
  const troubleshootingOpt = $('interactive_scenarios').checked;

  compileGuide(audience, workflow, platform, detail, secretsOpt, commitLintOpt, troubleshootingOpt);
  compileDiagrams();
  compileCheatSheet();
  compileScenarios(troubleshootingOpt);
  compileCICD(platform, secretsOpt, commitLintOpt);

  updateViewportContent();
}

// Compile Guide Markdown
function compileGuide(audience, workflow, platform, detail, secretsOpt, commitLintOpt, troubleshootingOpt) {
  let md = `# Git Developer & SRE Learning Guide\n`;
  md += `*Target Persona: ${audience.toUpperCase()} | Workflow: ${workflow.toUpperCase()} | Hosting Platform: ${platform.toUpperCase()}*\n\n`;

  md += `## 1. Version Control Ecosystem\n`;
  md += `### Git vs GitHub vs GitLab vs Azure Repos\n`;
  md += `**Git** is the distributed version control system engine running on local systems. **GitHub**, **GitLab**, and **Azure Repos** are remote cloud-hosted platforms that serve as centralized code repositories, adding team collaboration layers, access management, and automated runner webhooks.\n\n`;

  // Dynamic remote details
  if (platform === 'github') {
    md += `*Platform Highlights (GitHub):* Focuses on Github Actions, pull requests, branch policies, secret protection rules, and enterprise environment environments.\n\n`;
  } else if (platform === 'gitlab') {
    md += `*Platform Highlights (GitLab):* Focuses on GitLab CI pipeline YAML, merge requests, container registries, and developer code review gates.\n\n`;
  } else {
    md += `*Platform Highlights (Azure Repos):* Focuses on Azure DevOps pipelines YAML integration, branch policies, project backlogs, and active directory credential gates.\n\n`;
  }

  md += `## 2. Dynamic Workflow Core: ${workflow.toUpperCase()}\n`;
  if (workflow === 'feature') {
    md += `**Feature Branch Workflow:** Developers create short-lived branch targets (e.g. \`feature/add-login\`) off the main line. Once tasks are done, a Pull Request is opened, code review gates check quality, and it is merged back to main.\n`;
    md += `*Best for:* General developer collaboration, code review compliance, and microservices environments.\n\n`;
  } else if (workflow === 'gitflow') {
    md += `**GitFlow Workflow:** Integrates historical structures. Uses long-lived \`main\` (production state) and \`develop\` (staging state) branches. Developers branch off \`develop\` using \`feature/*\`, and merge back. Releases are prepared on \`release/*\` branches before merging to main and develop. Critical live errors use \`hotfix/*\` directly off main.\n`;
    md += `*Best for:* Large enterprise projects, packaged software release management, and legacy codebases.\n\n`;
  } else if (workflow === 'trunk') {
    md += `**Trunk-Based Development:** Developers merge small, frequent commits directly into the central 'trunk' (usually main). Minimizes long-lived branches to prevent merge conflicts. Employs Feature Flags (Feature Toggles) to hide uncompleted features in production deployments.\n`;
    md += `*Best for:* High-performing SaaS organizations, Continuous Deployment, and SRE/DevOps teams.\n\n`;
  } else {
    md += `**Forking Workflow:** Developers fork the main repository to their own remote space, commit changes locally, and submit a Pull/Merge Request back upstream. Used to protect central access.\n`;
    md += `*Best for:* Open-source projects, vendor integrations, and contract developer management.\n\n`;
  }

  md += `## 3. Step-by-Step Command Playbook\n`;
  md += `*Detail Level: ${detail.toUpperCase()}*\n\n`;

  // Loop through command databases
  for (const [key, cmd] of Object.entries(gitCommands)) {
    // Basic filter check by detail level if desired
    if (detail === 'beginner' && (key === 'rebase' || key === 'revert' || key === 'reset')) {
      // Keep advanced items concise in beginner view
      continue;
    }

    md += `### 🛠️ ${cmd.name}\n`;
    md += `**Definition:** ${cmd.def}\n`;
    md += `**Why to use:** ${cmd.why}\n`;
    md += `**Real-World Scenario:** ${cmd.scenarios[audience]}\n`;
    md += `**Command Code:**\n\`\`\`bash\n${cmd.examples}\n\`\`\`\n`;
    md += `**Common Mistake:** ${cmd.mistakes}\n`;
    md += `**Best Practice:** ${cmd.practices}\n\n`;
  }

  // Add interactive rebase and reset details if intermediate or advanced
  if (detail !== 'beginner') {
    md += `### 🔀 Advanced Interactive Rebase (\`git rebase -i HEAD~N\`)\n`;
    md += `Interactive rebase allows you to rewrite local history before pushing your commits. Commands inside the rebase file specify what Git does with each commit:\n\n`;
    md += `- **pick**: Keep the commit as-is.\n`;
    md += `- **reword**: Change the commit message without altering modifications.\n`;
    md += `- **squash**: Combine this commit's changes with the previous commit, keeping both messages.\n`;
    md += `- **fixup**: Combine this commit's changes with the previous commit, discarding this commit's message.\n`;
    md += `- **drop**: Delete the commit and its changes from history entirely.\n\n`;
    md += `**Rebase Workflow Example:**\n`;
    md += `\`\`\`bash\n# Rebase the last 3 local commits\ngit rebase -i HEAD~3\n\`\`\`\n\n`;
  }

  // Append security and policies
  md += `## 4. SRE Security & Standards Enforcement\n`;
  if (secretsOpt) {
    md += `### 🔒 Secrets Avoidance & Token Hygiene\n`;
    md += `- Never commit raw credentials, PAT tokens, SSH keys, or cloud access keys.\n`;
    md += `- Secure your repo by installing \`gitleaks\` locally or adding it as a pre-commit hook.\n`;
    md += `- If secrets are pushed by mistake, immediately rotate them and scrub repo history.\n\n`;
  }
  if (commitLintOpt) {
    md += `### 📝 Conventional Commits Rules\n`;
    md += `Enforce clear commits structure matching conventional guidelines:\n`;
    md += `- \`feat(scope): ...\` - new application features\n`;
    md += `- \`fix(scope): ...\` - software patches\n`;
    md += `- \`docs(scope): ...\` - documentation tweaks\n`;
    md += `- \`ci(scope): ...\` - build pipeline updates\n\n`;
  }

  compiledCode.guide = md;
}

// Compile Diagrams text
function compileDiagrams() {
  let text = `==================================================\n`;
  text += `   GIT INTERACTIVE STUDIO: ASCII DIAGRAM MAPPINGS   \n`;
  text += `==================================================\n\n`;

  text += asciiDiagrams.branch + `\n\n`;
  text += `--------------------------------------------------\n\n`;
  text += asciiDiagrams.merge + `\n\n`;
  text += `--------------------------------------------------\n\n`;
  text += asciiDiagrams.rebase + `\n\n`;
  text += `--------------------------------------------------\n\n`;
  text += asciiDiagrams.cherry + `\n\n`;
  text += `--------------------------------------------------\n\n`;
  text += asciiDiagrams.conflict + `\n`;

  compiledCode.diagrams = text;
}

// Compile Cheat Sheet
function compileCheatSheet() {
  let md = `# Git Quick-Reference Cheat Sheet\n\n`;
  md += `## Setup & Initialization\n`;
  md += `- \`git init\` - Initialize local repository.\n`;
  md += `- \`git clone <url>\` - Download remote repository.\n`;
  md += `- \`git config --global user.name \"Name\"\` - Set global commit name.\n`;
  md += `- \`git config --global user.email \"email@domain.com\"\` - Set global commit email.\n\n`;

  md += `## Staging & Commits\n`;
  md += `- \`git status\` - Show modified/untracked files.\n`;
  md += `- \`git add <file>\` - Stage modification modifications.\n`;
  md += `- \`git add .\` - Stage all changed files.\n`;
  md += `- \`git commit -m \"message\"\` - Commit staged files with message.\n`;
  md += `- \`git commit --amend\` - Amend last commit message or changes.\n\n`;

  md += `## Branching & Merging\n`;
  md += `- \`git branch\` - List local branches.\n`;
  md += `- \`git branch -a\` - List local and remote branches.\n`;
  md += `- \`git switch <branch>\` - Swaps target branches.\n`;
  md += `- \`git switch -c <name>\` - Create and swap to branch.\n`;
  md += `- \`git merge <branch>\` - Merges branch into active.\n`;
  md += `- \`git branch -d <name>\` - Delete merged local branch.\n\n`;

  md += `## History & Comparison\n`;
  md += `- \`git log --oneline --graph --all\` - Graph view of commits.\n`;
  md += `- \`git diff\` - Show unstaged file modifications.\n`;
  md += `- \`git diff --staged\` - Show staged changes.\n`;
  md += `- \`git blame <file>\` - Review line edits & authors.\n\n`;

  md += `## Syncing & Remotes\n`;
  md += `- \`git fetch origin\` - Download remote references.\n`;
  md += `- \`git pull --rebase origin <branch>\` - Update local and rebase commits.\n`;
  md += `- \`git push origin <branch>\` - Upload commits to remote.\n\n`;

  md += `## Undo Operations\n`;
  md += `- \`git stash\` - Temporarily shelf modifications.\n`;
  md += `- \`git stash pop\` - Restore shelved modifications.\n`;
  md += `- \`git reset --soft HEAD~1\` - Undo commit, keep edits staged.\n`;
  md += `- \`git reset --hard HEAD~1\` - Undo commit, delete edits (Careful!).\n`;
  md += `- \`git revert <hash>\` - Revert pushed commit with safe inverse commit.\n`;

  compiledCode.cheatsheet = md;
}

// Compile QA Scenarios MD
function compileScenarios(troubleshootingOpt) {
  let md = `# Git Scenarios, QA & Troubleshooting\n\n`;

  md += `## Section 1: 25 Essential Git Interview Q&A\n\n`;
  interviewQA.forEach((qa, idx) => {
    md += `### Q${idx + 1}: ${qa.q}\n`;
    md += `**A:** ${qa.a}\n\n`;
  });

  md += `--------------------------------------------------\n\n`;

  md += `## Section 2: 20 Common Real-World Troubleshooting Scenarios\n\n`;
  troubleshootingScenarios.forEach((scen) => {
    md += `### ❓ ${scen.title}\n`;
    md += `**Recommended Fix Steps:**\n`;
    md += `\`\`\`bash\n${scen.steps}\n\`\`\`\n\n`;
  });

  md += `--------------------------------------------------\n\n`;

  md += `## Section 3: 15 Common Git Terminal Error Messages & Solutions\n\n`;
  commonErrors.forEach((errObj, idx) => {
    md += `### ❌ Error ${idx + 1}: \`${errObj.err}\`\n`;
    md += `**Root Cause & Fix Resolution:**\n`;
    md += `> ${errObj.fix}\n\n`;
  });

  compiledCode.qa_scenarios = md;
}

// Compile CI/CD pipelines
function compileCICD(platform, secretsOpt, commitLintOpt) {
  let code = '';
  if (platform === 'github') {
    code += `# GitHub Actions: CI Workflow Validation\n`;
    code += `name: Git Workflow Validation\n\n`;
    code += `on:\n`;
    code += `  push:\n`;
    code += `    branches: [ main, develop ]\n`;
    code += `  pull_request:\n`;
    code += `    branches: [ main, develop ]\n\n`;
    code += `jobs:\n`;
    code += `  validation:\n`;
    code += `    runs-on: ubuntu-latest\n`;
    code += `    steps:\n`;
    code += `      - name: Checkout Code\n`;
    code += `        uses: actions/checkout@v4\n`;
    code += `        with:\n`;
    code += `          fetch-depth: 0 # Fetch all history for linting / checks\n\n`;

    if (secretsOpt) {
      code += `      - name: Scan Secrets (Gitleaks)\n`;
      code += `        uses: gitleaks/gitleaks-action@v2\n`;
      code += `        env:\n`;
      code += `          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}\n\n`;
    }

    if (commitLintOpt) {
      code += `      - name: Lint Commits (Conventional Commits)\n`;
      code += `        uses: wagoid/commitlint-github-action@v5\n\n`;
    }

    code += `      - name: Run Code Linter & Tests\n`;
    code += `        run: |\n`;
    code += `          echo \"Running build and test triggers for continuous integration...\"\n`;
    code += `          # npm ci && npm test`;
  } else if (platform === 'gitlab') {
    code += `# GitLab CI: Git Pipeline Security Verification\n`;
    code += `stages:\n`;
    code += `  - lint\n`;
    code += `  - security\n`;
    code += `  - test\n\n`;
    code += `variables:\n`;
    code += `  GIT_DEPTH: 0 # Fetch all history for commitlint / scanner\n\n`;

    if (commitLintOpt) {
      code += `commit-lint:\n`;
      code += `  stage: lint\n`;
      code += `  image: node:latest\n`;
      code += `  script:\n`;
      code += `    - npm install -g @commitlint/cli @commitlint/config-conventional\n`;
      code += `    - npx commitlint --from=origin/main\n`;
      code += `  rules:\n`;
      code += `    - if: $CI_PIPELINE_SOURCE == "merge_request_event"\n\n`;
    }

    if (secretsOpt) {
      code += `secret-scanning:\n`;
      code += `  stage: security\n`;
      code += `  image:\n`;
      code += `    name: zricethezav/gitleaks:latest\n`;
      code += `    entrypoint: [\"\"]\n`;
      code += `  script:\n`;
      code += `    - gitleaks detect --verbose --source=\".\"\n\n`;
    }

    code += `unit-testing:\n`;
    code += `  stage: test\n`;
    code += `  script:\n`;
    code += `    - echo \"Running repository automated tests...\"\n`;
    code += `    - # run test scripts here`;
  } else {
    code += `# Azure DevOps Pipelines: Git Validation Pipeline\n`;
    code += `trigger:\n`;
    code += `  branches:\n`;
    code += `    include:\n`;
    code += `      - main\n`;
    code += `      - develop\n\n`;
    code += `pool:\n`;
    code += `  vmImage: 'ubuntu-latest'\n\n`;
    code += `steps:\n`;
    code += `  - checkout: self\n`;
    code += `    fetchDepth: 0 # Full checkout for scanning tools\n\n`;

    if (secretsOpt) {
      code += `  - task: GitleaksScan@2\n`;
      code += `    displayName: 'Scan Git repository for secrets'\n`;
      code += `    inputs:\n`;
      code += `      scanLocation: '$(Build.SourcesDirectory)'\n\n`;
    }

    code += `  - script: |\n`;
    code += `      echo \"Running static tests and pipelines...\"\n`;
    code += `    displayName: 'Run Pipeline Checks'`;
  }

  compiledCode.cicd = code;
}

// Switch Active View Tab
function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'guide') {
    nameBox.value = 'git_guide';
    extTag.textContent = '.md';
  } else if (tabId === 'diagrams') {
    nameBox.value = 'diagrams';
    extTag.textContent = '.txt';
  } else if (tabId === 'cheatsheet') {
    nameBox.value = 'cheatsheet';
    extTag.textContent = '.md';
  } else if (tabId === 'qa_scenarios') {
    nameBox.value = 'qa_scenarios';
    extTag.textContent = '.md';
  } else if (tabId === 'cicd') {
    const platform = $('git_platform').value;
    if (platform === 'github') {
      nameBox.value = 'git-ci';
      extTag.textContent = '.yml';
    } else if (platform === 'gitlab') {
      nameBox.value = '.gitlab-ci';
      extTag.textContent = '.yml';
    } else {
      nameBox.value = 'azure-pipelines';
      extTag.textContent = '.yml';
    }
  } else if (tabId === 'terminal') {
    nameBox.value = 'git_sandbox';
    extTag.textContent = '.sh';
  }

  updateViewportContent();
}

function updateViewportContent() {
  if (activeTab === 'terminal') {
    $('output-box').classList.add('hidden');
    $('terminal-container').classList.remove('hidden');
    drawGitGraph();
  } else {
    $('output-box').classList.remove('hidden');
    $('terminal-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

function copyActiveTabContent() {
  const content = compiledCode[activeTab];
  navigator.clipboard.writeText(content).then(() => {
    showToast('✅ Copied configuration file to clipboard!');
  });
}

function downloadGitZip() {
  const zip = new JSZip();
  const platform = $('git_platform').value;

  zip.file('git_guide.md', compiledCode.guide);
  zip.file('diagrams.txt', compiledCode.diagrams);
  zip.file('cheatsheet.md', compiledCode.cheatsheet);
  zip.file('qa_scenarios.md', compiledCode.qa_scenarios);

  if (platform === 'github') {
    zip.file('.github/workflows/git-ci.yml', compiledCode.cicd);
  } else if (platform === 'gitlab') {
    zip.file('.gitlab-ci.yml', compiledCode.cicd);
  } else {
    zip.file('azure-pipelines.yml', compiledCode.cicd);
  }

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'git-studio.zip';
    a.click();
    showToast('⬇️ git-studio.zip downloaded successfully!');
  });
}

function clearAllFields() {
  $('target_audience').value = 'devops';
  $('git_workflow').value = 'feature';
  $('git_platform').value = 'github';
  $('detail_level').value = 'beginner';

  $('secret_scanning').checked = true;
  $('linting_policies').checked = true;
  $('interactive_scenarios').checked = true;

  triggerCompileAll();
  showToast('🗑️ Reset all configurations to SRE defaults');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg z-50 border border-slate-800 transition duration-300';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Side Drawer Explanations Data Map
const tabExplanations = {
  'guide': {
    title: 'Git Version Control Guide',
    filename: 'git_guide.md',
    why: 'Compiles a personalized version control resource detailing the core Git commands, scenarios, common mistakes, and recommended workflows customized to your specific engineering role and provider.',
    when: 'Use to train new team members, align developer practices, and enforce safe commit patterns across the engineering group.',
    where: 'Deploy in the root directory or save as reference guides inside internal wikis.',
    command: 'git log --oneline --graph --all',
    practices: [
      'Pin repositories with clear semantic release version tags.',
      'Always pull updates using rebases to avoid cluttering histories.',
      'Configure remote branch protection policies on shared integration targets.'
    ],
    ai_mlops: 'Provides references for syncing large datasets and models model training checkpoint assets without bloat.',
    flow: '[Staging Area] ➔ [git commit] ➔ [Local HEAD] ➔ [git push] ➔ [Remote Repository]'
  },
  'diagrams': {
    title: 'Visual Git Tree Diagrams',
    filename: 'diagrams.txt',
    why: 'Provides readable ASCII diagrams outlining key Git trees during mergers, rebases, branching, and conflicts resolution loops.',
    when: 'Use to visually debug complex rebase failures, resolve conflicting lines, or onboard team members on Git internals.',
    where: 'Save as text files or reference templates in project roots.',
    command: 'git log --graph --oneline --decorate',
    practices: [
      'Understand rebase history rewrites before applying pushes.',
      'Leverage cherry-picks selectively for isolated bug-fixes.',
      'Check conflict boundary markers manually before final stages.'
    ],
    ai_mlops: 'Visualizes parallel branches syncing custom pipelines and model weights.',
    flow: '[Branch Split] ➔ [Parallel Changes] ➔ [Merge/Rebase] ➔ [Unified Trunk Line]'
  },
  'cheatsheet': {
    title: 'Git Reference Cheat Sheet',
    filename: 'cheatsheet.md',
    why: 'Lists short, memorable commands grouped by category (Staging, Branching, Comparing, Undoing) to accelerate day-to-day console terminal interactions.',
    when: 'Ideal for daily console lookup and learning Git shortcuts.',
    where: 'Save as a workspace cheat sheet or system manual.',
    command: 'git checkout -b feature-name',
    practices: [
      'Create custom CLI aliases for common commands.',
      'Reference staging checkouts before resetting files.',
      'Verify status before committing changes.'
    ],
    ai_mlops: 'Optimizes workspace terminal commands for prompt builders.',
    flow: '[Working Directory] ➔ [git status] ➔ [Staging Index] ➔ [git commit] ➔ [Local Commit]'
  },
  'qa_scenarios': {
    title: 'Troubleshooting & QA Prep',
    filename: 'qa_scenarios.md',
    why: 'Packages a reference catalog of 25 QA interviews queries, 20 real-world rescue procedures, and 15 error messages with fixes.',
    when: 'Use when troubleshooting merge conflicts, detached HEAD states, pushed secrets, or preparing for developer interviews.',
    where: 'Read in terminal or markdown viewer during emergency incidents.',
    command: 'git reflog',
    practices: [
      'Use git reflog to recover commits after accidental hard resets.',
      'Use ours/theirs filters for non-mergable binary conflicts.',
      'Configure helper managers to save credential caching prompts.'
    ],
    ai_mlops: 'Helps teams recover from git-rebase loss of ML pipeline code.',
    flow: '[Trigger Error] ➔ [Inspect Reflog / Diff] ➔ [Execute Rescue Script] ➔ [Restored State]'
  },
  'cicd': {
    title: 'Continuous Integration YAML',
    filename: 'git-ci.yml',
    why: 'Ensures pipeline code checks quality metrics, lints commit syntax conforming to standards, and prevents accidental API keys leakage.',
    when: 'Use in repository CI actions to block invalid commits and secrets prior to main branch merge actions.',
    where: 'Save in repository CI folders (.github/workflows/, .gitlab-ci.yml, or root).',
    command: '# Triggered dynamically on remote branch pushes',
    practices: [
      'Enable secret scanners on pipeline triggers.',
      'Lint commit comments matching conventional guidelines.',
      'Run unit testing modules on pristine container environments.'
    ],
    ai_mlops: 'Scans prompt catalogs and validates configuration formats before pipeline deployment.',
    flow: '[Code Push] ➔ [Pipeline Execution] ➔ [Secrets Check] ➔ [Format Lint] ➔ [Build/Test Success]'
  },
  'terminal': {
    title: 'Git Sandbox Terminal',
    filename: 'git_sandbox.sh',
    why: 'Provides an interactive terminal simulator for typing Git commands and visualizing the local branching trees via vector graphics.',
    when: 'Use to safely practice and test command outcomes without modifying live production repositories.',
    where: 'Runs directly in the browser using client-side SVG drawing structures.',
    command: 'git init',
    practices: [
      'Experiment with branches and checkouts in a sandbox before live console runs.',
      'Check commit parent mappings visually to understand history graphs.',
      'Practice rebase commands to visualize commit head movements.'
    ],
    ai_mlops: 'Simulates checkpoint branches and prompt commits version cycles.',
    flow: '[Command Input] ➔ [CLI Parsing] ➔ [Tree Update] ➔ [SVG Graph Redraw]'
  }
};

// ── Simulated Terminal Sandbox Engine ──
let gitInitialized = false;
let commits = [];
let branches = { 'main': null };
let activeBranch = 'main';

function printTerminal(msg, isInput = false) {
  const history = $('terminal-history');
  if (!history) return;
  const line = document.createElement('div');
  if (isInput) {
    line.innerHTML = `<span class="text-orange-500">visitor@sre-portfolio:~/git-sandbox$</span> <span class="text-white">${escapeHtml(msg)}</span>`;
  } else {
    line.innerHTML = msg;
  }
  history.appendChild(line);
  history.scrollTop = history.scrollHeight;
}

function generateHash() {
  return Math.random().toString(16).substring(2, 9);
}

function processTerminalCommand(cmdRaw) {
  const cmd = cmdRaw.trim();
  printTerminal(cmd, true);

  if (!cmd) return;

  const tokens = cmd.split(/\s+/);
  const base = tokens[0].toLowerCase();

  if (base === 'help') {
    printTerminal('Available simulated commands:<br>' +
                  '- <span class="text-white">git init</span>: Initialize local repository<br>' +
                  '- <span class="text-white">git branch</span>: List or create branch<br>' +
                  '- <span class="text-white">git switch &lt;branch&gt;</span> / <span class="text-white">checkout &lt;branch&gt;</span>: Switch branch<br>' +
                  '- <span class="text-white">git checkout -b &lt;branch&gt;</span>: Create and switch branch<br>' +
                  '- <span class="text-white">git commit -m \"&lt;msg&gt;\"</span>: Save changes in commit snapshot<br>' +
                  '- <span class="text-white">git merge &lt;branch&gt;</span>: Merge a branch into active branch<br>' +
                  '- <span class="text-white">git rebase &lt;branch&gt;</span>: Rebase commits on top of another branch<br>' +
                  '- <span class="text-white">git reset --hard HEAD~1</span>: Reset local changes by 1 commit<br>' +
                  '- <span class="text-white">git log</span>: Print commit log tree history<br>' +
                  '- <span class="text-white">clear</span>: Clear terminal screen output');
    return;
  }

  if (base === 'clear') {
    const history = $('terminal-history');
    if (history) history.innerHTML = '';
    return;
  }

  if (base !== 'git') {
    printTerminal(`<span class="text-rose-500">bash: command not found: ${escapeHtml(base)}</span>`);
    return;
  }

  if (tokens.length < 2) {
    printTerminal('<span class="text-rose-500">git: missing argument. Type "help" for a list of commands.</span>');
    return;
  }

  const sub = tokens[1].toLowerCase();

  if (sub === 'init') {
    if (gitInitialized) {
      printTerminal('<span class="text-amber-500">Reinitialized existing Git repository in /home/visitor/git-sandbox/.git/</span>');
      return;
    }
    gitInitialized = true;
    commits = [];
    branches = { 'main': null };
    activeBranch = 'main';
    printTerminal('<span class="text-emerald-400">Initialized empty Git repository in /home/visitor/git-sandbox/.git/</span>');
    drawGitGraph();
    return;
  }

  if (!gitInitialized) {
    printTerminal('<span class="text-rose-500">fatal: not a git repository (or any of the parent directories): .git</span>');
    return;
  }

  if (sub === 'branch') {
    if (tokens.length === 2) {
      let out = '';
      Object.keys(branches).forEach(bName => {
        if (bName === activeBranch) {
          out += `<span class="text-emerald-400 font-bold">* ${escapeHtml(bName)}</span><br>`;
        } else {
          out += `  ${escapeHtml(bName)}<br>`;
        }
      });
      printTerminal(out);
      return;
    }
    
    const bName = tokens[2];
    if (branches[bName] !== undefined) {
      printTerminal(`<span class="text-rose-500">fatal: A branch named '${escapeHtml(bName)}' already exists.</span>`);
      return;
    }
    branches[bName] = branches[activeBranch];
    printTerminal(`Created branch pointer: <span class="text-white">${escapeHtml(bName)}</span> pointing to ${branches[activeBranch] || 'NULL'}`);
    drawGitGraph();
    return;
  }

  if (sub === 'checkout' || sub === 'switch') {
    if (tokens.length < 3) {
      printTerminal('<span class="text-rose-500">git: missing branch argument.</span>');
      return;
    }

    if (sub === 'checkout' && tokens[2] === '-b') {
      const bName = tokens[3];
      if (!bName) {
        printTerminal('<span class="text-rose-500">fatal: Missing new branch name.</span>');
        return;
      }
      if (branches[bName] !== undefined) {
        printTerminal(`<span class="text-rose-500">fatal: A branch named '${escapeHtml(bName)}' already exists.</span>`);
        return;
      }
      branches[bName] = branches[activeBranch];
      activeBranch = bName;
      printTerminal(`Switched to a new branch '<span class="text-white">${escapeHtml(bName)}</span>'`);
      drawGitGraph();
      return;
    }

    let bName = tokens[2];
    if (sub === 'switch' && bName === '-c') {
      bName = tokens[3];
      if (!bName) {
        printTerminal('<span class="text-rose-500">fatal: Missing new branch name.</span>');
        return;
      }
      if (branches[bName] !== undefined) {
        printTerminal(`<span class="text-rose-500">fatal: A branch named '${escapeHtml(bName)}' already exists.</span>`);
        return;
      }
      branches[bName] = branches[activeBranch];
      activeBranch = bName;
      printTerminal(`Switched to a new branch '<span class="text-white">${escapeHtml(bName)}</span>'`);
      drawGitGraph();
      return;
    }

    if (branches[bName] === undefined) {
      printTerminal(`<span class="text-rose-500">error: pathspec '${escapeHtml(bName)}' did not match any file(s) known to git</span>`);
      return;
    }

    activeBranch = bName;
    printTerminal(`Switched to branch '<span class="text-white">${escapeHtml(bName)}</span>'`);
    drawGitGraph();
    return;
  }

  if (sub === 'commit') {
    const msgMatch = cmd.match(/-m\s+["'](.*?)["']/);
    if (!msgMatch) {
      printTerminal('<span class="text-rose-500">error: switch -m requires a commit message argument.</span>');
      return;
    }
    const msg = msgMatch[1];
    const hash = generateHash();
    const parent = branches[activeBranch];

    const newCommit = {
      hash: hash,
      msg: msg,
      parent: parent,
      branch: activeBranch,
      timestamp: new Date().toLocaleTimeString()
    };

    commits.push(newCommit);
    branches[activeBranch] = hash;
    printTerminal(`[${escapeHtml(activeBranch)} ${hash}] ${escapeHtml(msg)}<br>1 file changed, 1 insertion(+)`);
    drawGitGraph();
    return;
  }

  if (sub === 'log') {
    if (commits.length === 0) {
      printTerminal('<span class="text-amber-500">No commits recorded yet. Add modifications and commit!</span>');
      return;
    }
    
    let out = '';
    let curr = branches[activeBranch];
    while (curr) {
      const commit = commits.find(c => c.hash === curr);
      if (!commit) break;
      out += `<span class="text-yellow-400">commit ${commit.hash}</span> (HEAD -> <span class="text-emerald-400">${commit.branch}</span>)<br>`;
      out += `Author: visitor &lt;visitor@sre-portfolio&gt;<br>`;
      out += `Date:   ${commit.timestamp}<br><br>`;
      out += `    ${escapeHtml(commit.msg)}<br><br>`;
      curr = commit.parent;
    }
    printTerminal(out || 'Empty log history');
    return;
  }

  if (sub === 'reset') {
    const isHard = cmd.includes('--hard');
    const hasHeadRef = cmd.includes('HEAD~1');

    if (isHard && hasHeadRef) {
      const activeHash = branches[activeBranch];
      if (!activeHash) {
        printTerminal('<span class="text-rose-500">fatal: Cannot reset, branch has no commits.</span>');
        return;
      }
      const activeCommit = commits.find(c => c.hash === activeHash);
      if (activeCommit) {
        branches[activeBranch] = activeCommit.parent;
        printTerminal(`HEAD is now at ${activeCommit.parent || 'root state'}`);
        drawGitGraph();
      }
      return;
    }
    printTerminal('<span class="text-rose-500">git reset: syntax parameter mismatch. Try: "git reset --hard HEAD~1"</span>');
    return;
  }

  if (sub === 'merge') {
    if (tokens.length < 3) {
      printTerminal('<span class="text-rose-500">git merge: missing target merge branch.</span>');
      return;
    }
    const target = tokens[2];
    if (branches[target] === undefined) {
      printTerminal(`<span class="text-rose-500">fatal: '${escapeHtml(target)}' is not a branch name.</span>`);
      return;
    }

    if (branches[target] === branches[activeBranch]) {
      printTerminal('Already up to date.');
      return;
    }

    const currentHash = branches[activeBranch];
    const targetHash = branches[target];

    const hash = generateHash();
    const newCommit = {
      hash: hash,
      msg: `Merge branch '${target}' into ${activeBranch}`,
      parent: currentHash,
      mergeParent: targetHash,
      branch: activeBranch,
      timestamp: new Date().toLocaleTimeString()
    };
    commits.push(newCommit);
    branches[activeBranch] = hash;
    printTerminal(`Updating ${currentHash || 'root'}..${targetHash}<br>Fast-forward merge or merge commit simulated.`);
    drawGitGraph();
    return;
  }

  if (sub === 'rebase') {
    if (tokens.length < 3) {
      printTerminal('<span class="text-rose-500">git rebase: missing target base branch.</span>');
      return;
    }
    const target = tokens[2];
    if (branches[target] === undefined) {
      printTerminal(`<span class="text-rose-500">fatal: '${escapeHtml(target)}' is not a branch name.</span>`);
      return;
    }

    branches[activeBranch] = branches[target];
    printTerminal(`Successfully rebased and updated refs/heads/${escapeHtml(activeBranch)} on top of ${escapeHtml(target)}`);
    drawGitGraph();
    return;
  }

  printTerminal(`<span class="text-rose-500">git: "${escapeHtml(sub)}" is not a simulated command. Type "help" to see allowed commands.</span>`);
}

function drawGitGraph() {
  const graphContainer = $('terminal-graph');
  if (!graphContainer) return;

  if (!gitInitialized) {
    graphContainer.innerHTML = '<span class="text-slate-600 font-mono text-xs">Run "git init" to begin repository visualization</span>';
    return;
  }

  if (commits.length === 0) {
    graphContainer.innerHTML = '<span class="text-slate-500 font-mono text-xs">Initialized repository. Create your first commit using: <span class="text-emerald-400">git commit -m "commit msg"</span></span>';
    return;
  }

  const width = graphContainer.clientWidth || 550;
  const height = 220;

  const branchRows = {};
  let rowCount = 0;
  branchRows['main'] = 70;
  
  Object.keys(branches).forEach(bName => {
    if (bName !== 'main') {
      rowCount++;
      branchRows[bName] = 70 + (rowCount * 50);
    }
  });

  const svgHeight = Math.max(height, 70 + (rowCount * 50) + 40);
  const commitCoords = {};
  const stepX = 75;
  const startX = 40;

  commits.forEach((commit, index) => {
    const x = startX + (index * stepX);
    const y = branchRows[commit.branch] || 70;
    commitCoords[commit.hash] = { x, y };
  });

  let svgHtml = `<svg width="100%" height="${svgHeight}" style="background-color: #0c1017;" xmlns="http://www.w3.org/2000/svg">`;

  commits.forEach((commit) => {
    const coord = commitCoords[commit.hash];
    if (commit.parent && commitCoords[commit.parent]) {
      const parentCoord = commitCoords[commit.parent];
      svgHtml += `<line x1="${parentCoord.x}" y1="${parentCoord.y}" x2="${coord.x}" y2="${coord.y}" stroke="#4f46e5" stroke-width="2.5" />`;
    }
    if (commit.mergeParent && commitCoords[commit.mergeParent]) {
      const mergeCoord = commitCoords[commit.mergeParent];
      svgHtml += `<line x1="${mergeCoord.x}" y1="${mergeCoord.y}" x2="${coord.x}" y2="${coord.y}" stroke="#f05032" stroke-width="2.5" stroke-dasharray="3,3" />`;
    }
  });

  commits.forEach((commit) => {
    const coord = commitCoords[commit.hash];
    const isTip = Object.values(branches).includes(commit.hash);
    const color = commit.branch === 'main' ? '#f05032' : '#7c3aed';

    svgHtml += `
      <g>
        <circle cx="${coord.x}" cy="${coord.y}" r="${isTip ? '8' : '6'}" fill="${color}" stroke="#ffffff" stroke-width="1.5" cursor="pointer" />
        <title>Hash: ${commit.hash}\nBranch: ${commit.branch}\nMessage: ${commit.msg}</title>
        <text x="${coord.x}" y="${coord.y - 12}" fill="#cbd5e1" font-family="monospace" font-size="8px" text-anchor="middle">${commit.hash}</text>
      </g>
    `;
  });

  Object.entries(branches).forEach(([bName, hash]) => {
    if (hash && commitCoords[hash]) {
      const coord = commitCoords[hash];
      const isActive = bName === activeBranch;
      const bgColor = isActive ? '#10b981' : '#475569';
      
      const sharedCount = Object.entries(branches).filter(([b, h]) => h === hash).indexOf([bName, hash]);
      const offsetY = 20 + (sharedCount * 18);

      svgHtml += `
        <g>
          <polygon points="${coord.x},${coord.y + offsetY - 4} ${coord.x - 4},${coord.y + offsetY + 2} ${coord.x + 4},${coord.y + offsetY + 2}" fill="${bgColor}" />
          <rect x="${coord.x - 30}" y="${coord.y + offsetY + 2}" width="60" height="15" rx="3" fill="${bgColor}" />
          <text x="${coord.x}" y="${coord.y + offsetY + 12}" fill="#ffffff" font-family="sans-serif" font-size="9px" font-weight="bold" text-anchor="middle">${bName}</text>
        </g>
      `;
    } else if (!hash && bName === activeBranch) {
      svgHtml += `
        <text x="40" y="45" fill="#10b981" font-family="monospace" font-size="10px">* ${bName} (empty repository)</text>
      `;
    }
  });

  svgHtml += `</svg>`;
  graphContainer.innerHTML = svgHtml;
}

function initTerminalSandbox() {
  const terminalInput = $('terminal-input');
  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        processTerminalCommand(val);
      }
    });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function explainActiveTabCode() {
  const explanation = tabExplanations[activeTab];
  if (!explanation) {
    showToast("⚠️ No explanation available for this tab.");
    return;
  }

  // Populate drawer content
  $('drawer-title').textContent = explanation.title;
  $('drawer-filename').textContent = explanation.filename;
  $('explain-why').textContent = explanation.why;
  $('explain-when').textContent = explanation.when;
  
  $('explain-where').textContent = explanation.where;
  $('explain-command').textContent = explanation.command;

  const practicesBox = $('explain-practices');
  practicesBox.innerHTML = '';
  explanation.practices.forEach(practice => {
    const li = document.createElement('li');
    li.textContent = practice;
    practicesBox.appendChild(li);
  });

  $('explain-ai-mlops').textContent = explanation.ai_mlops || 'Integrated with Git version workflows and DevOps repositories.';

  const drawer = $('explanation-drawer');
  drawer.classList.remove('translate-x-full');
  drawer.classList.add('translate-x-0');
}

function closeExplanationDrawer() {
  const drawer = $('explanation-drawer');
  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');
}

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadGitZip = downloadGitZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
