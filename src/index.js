import { intro, outro, text, select, confirm, multiselect } from '@clack/prompts';
import colors from 'picocolors';


import { COMMIT_TYPES } from './commit-types.js';
import { getChangedFiles, getStagedFiles, gitAdd, gitCommit } from './git.js';







intro(colors.inverse(`Commit Assistant created by ${colors.blue('@emigimenezj')}`));

let changedFiles;
let stagedFiles;
try {
  changedFiles = await getChangedFiles();
  stagedFiles = await getStagedFiles();
} catch (_) {
  outro(colors.red("Error: check if you place in a git repository."));
  process.exit(1);
}

if (stagedFiles.length === 0 && changedFiles.length > 0) {

  const files = await multiselect({
    message: colors.cyan('Select the files you want to add to the staging area:'),
    options: changedFiles.map(file => ({
      value: file,
      label: file
    }))
  });

  await gitAdd({ files });
}

const commitType = await select({
  message: colors.cyan("Select the commit's type:"),
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key.padEnd(8, ' ')} · ${value.description}`
  }))
});

const commitMsg = await text({
  message: "Introduce the commit's message:",
  placeholder: 'Add new feature...',
  validate(value) {
    if (value.length === 0) return "Commits cannot have an empty message..."
  }
});

const { emoji, release } = COMMIT_TYPES[commitType];

let breakingChange = false;
if (release) {
  breakingChange = await confirm({
    initialValue: false,
    message: `${colors.cyan('There are changes in this commits that break the compatibility?')}
${colors.gray(`If the answer is yes, you should create a "BREAKING CHANGE" commit type and when you made a release it will publish a new major version.`)}`
  });
}

let commit = `${emoji} ${commitType}: ${commitMsg}${breakingChange ? ' [breaking change]' : ''}`;

const shouldContinue = await confirm({
  message: `${colors.cyan('Do you want to create a commit with the following message?')}

${colors.green(colors.bold(commit))}

${colors.cyan('Do you confirm?')}`
});

if (!shouldContinue) {
  outro(colors.yellow("None commit has been created."));
  process.exit(0);
}

await gitCommit({ commit });

outro(
  colors.green('✔ Commit created successfully. Thanks for using the assistant!')
);